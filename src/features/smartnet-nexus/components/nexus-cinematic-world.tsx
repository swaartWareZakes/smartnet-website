'use client';

import { Component, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  speaking: boolean;
  researching: boolean;
  reduced: boolean;
  hasPanel: boolean;
  globe: boolean;
  analyser: RefObject<AnalyserNode | null>;
};

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <div className="nc-static-core" aria-hidden="true" />
      : this.props.children;
  }
}

function World({
  speaking, researching, reduced, hasPanel, globe, analyser,
}: Props) {
  const core = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const earth = useRef<THREE.Group>(null);
  const tunnel = useRef<THREE.Group>(null);
  const energy = useRef(0);
  const satellites = useRef<THREE.Group>(null);
  const audio = useRef<{
    node: AnalyserNode | null;
    samples: Uint8Array<ArrayBuffer>;
  }>({ node: null, samples: new Uint8Array(0) });

  const geometry = useMemo(() => {
    // Deterministic particles: no random changes during React renders.
    let seed = 427;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const stars = new Float32Array(720 * 3);
    for (let i = 0; i < stars.length; i += 3) {
      stars[i] = (random() - .5) * 15;
      stars[i + 1] = (random() - .5) * 8;
      stars[i + 2] = .6 - random() * 9;
    }

    const ticks: number[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = i / 180 * Math.PI * 2;
      const radius = 1.88;
      const end = radius + (i % 5 === 0 ? .095 : .035);
      ticks.push(
        Math.cos(angle) * radius, Math.sin(angle) * radius, -.12,
        Math.cos(angle) * end, Math.sin(angle) * end, -.12,
      );
    }

    const nodes = new Float32Array(260 * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < 260; i++) {
      const y = 1 - i / 259 * 2;
      const radius = Math.sqrt(1 - y * y);
      nodes[i * 3] = Math.cos(golden * i) * radius * .82;
      nodes[i * 3 + 1] = y * .82;
      nodes[i * 3 + 2] = Math.sin(golden * i) * radius * .82;
    }

    return { stars, ticks: new Float32Array(ticks), nodes };
  }, []);

  useFrame(({ clock, pointer, viewport }, delta) => {
    if (!core.current || !rings.current) return;
    const time = clock.elapsedTime;
    const blend = 1 - Math.exp(-Math.min(delta, .1) * 5);
    let level = 0;
    const node = analyser.current;

    if (speaking && node && !reduced) {
      if (audio.current.node !== node) {
        audio.current = {
          node,
          samples: new Uint8Array(node.fftSize),
        };
      }
      node.getByteTimeDomainData(audio.current.samples);
      let sum = 0;
      for (const sample of audio.current.samples) {
        sum += ((sample - 128) / 128) ** 2;
      }
      level = Math.min(1, Math.sqrt(sum / audio.current.samples.length) * 5);
    }
    energy.current += (level - energy.current) * blend;

    const narrow = viewport.width < 7;
    const targetX = narrow ? 0 : hasPanel ? .42 : 0;
    const size = Math.min(1, viewport.width / 5.1, viewport.height / 5.6);
    const targetSize = size * (1 + energy.current * .035);
    core.current.position.x = THREE.MathUtils.lerp(
      core.current.position.x, targetX, reduced ? 1 : blend,
    );
    core.current.position.y = reduced
      ? .18
      : .18 + Math.sin(time * .55) * .035;
    core.current.scale.setScalar(
      reduced ? size : THREE.MathUtils.lerp(core.current.scale.x, targetSize, blend),
    );

    if (reduced) {
      core.current.rotation.set(.04, -.12, 0);
      return;
    }

    core.current.rotation.x = .04 + pointer.y * .035;
    core.current.rotation.y = -.12 + pointer.x * .045;
    rings.current.children.forEach((ring, index) => {
      const direction = index % 2 ? -1 : 1;
      const assembly = THREE.MathUtils.smoothstep(
        time, index * .045, 1.4 + index * .045,
      );
      const expansion = 1 + energy.current * (.008 + (index % 3) * .008);

      ring.scale.setScalar((.65 + assembly * .35) * expansion);
      ring.rotation.z += Math.min(delta, .05) * direction *
        (.05 + index * .005 + energy.current * .15 + (researching ? .12 : 0));

      ring.rotation.x = Math.sin(time * .3 + index * .7) * .025;
      ring.rotation.y = Math.cos(time * .24 + index * .45) * .035;
      ring.position.z = Math.sin(time * .4 + index) * .035;
    });

    if (satellites.current) {
      satellites.current.children.forEach((satellite, index) => {
        const angle = time * (.16 + index * .045) + index * 2.1;
        const radius = 2.04 + index * .12;
        satellite.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * .86,
          Math.sin(angle + index) * .45,
        );
      });
    }

    if (particles.current) {
      particles.current.rotation.y = time * .008;
      particles.current.position.y = Math.sin(time * .12) * .08;
    }
    if (earth.current) {
      earth.current.rotation.y += delta * .12;
      earth.current.rotation.z = -.18;
    }
    if (tunnel.current) {
      tunnel.current.children.forEach((ring, index) => {
        const progress = (time * .24 + index / 9) % 1;
        ring.position.z = -8 + progress * 11;
        ring.scale.setScalar(.3 + progress * 1.3);
      });
    }
  });

  return (
    <>
      <color attach="background" args={['#020a10']} />
      <fog attach="fog" args={['#020a10', 8, 24]} />

      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geometry.stars, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={.018}
          color="#a9edf5"
          transparent
          opacity={.65}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <gridHelper
        args={[28, 34, '#0c2b35', '#06151e']}
        position={[0, -2.15, -4]}
      />

      {researching && !reduced && (
        <group ref={tunnel}>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, .18, -8 + i]}>
              <torusGeometry args={[2.25, .004, 4, 100]} />
              <meshBasicMaterial
                color="#47b8d0"
                transparent
                opacity={.15}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      <group ref={core} position={[0, .18, 0]}>
        <group ref={rings}>
          {Array.from({ length: 16 }, (_, i) => {
            const radius = .37 + i * .103;
            return (
              <group key={i} rotation={[0, 0, i * .83]}>
                <mesh position={[0, 0, -(i % 4) * .09]}>
                  <torusGeometry
                    args={[radius, i % 5 === 0 ? .012 : .004, 5, 150, Math.PI * 1.55]}
                  />
                  <meshBasicMaterial
                    color={i % 4 === 0 ? '#c7f8ff' : '#56bdcc'}
                    transparent
                    opacity={i % 4 === 0 ? .86 : .42}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
                <mesh
                  rotation={[0, 0, Math.PI * 1.69]}
                  position={[0, 0, -(i % 4) * .09]}
                >
                  <torusGeometry args={[radius, .004, 4, 28, .43]} />
                  <meshBasicMaterial color="#90e5f4" transparent opacity={.6} />
                </mesh>
              </group>
            );
          })}
        </group>

        <group ref={satellites}>
          {[0, 1, 2].map(index => (
            <group key={index} position={[2.05, 0, 0]}>
              <mesh>
                <sphereGeometry args={[.022, 10, 8]} />
                <meshBasicMaterial color={index === 1 ? '#ffd49c' : '#c6faff'} />
              </mesh>
              <mesh>
                <sphereGeometry args={[.08, 10, 8]} />
                <meshBasicMaterial
                  color={index === 1 ? '#e6aa63' : '#68d7ef'}
                  transparent
                  opacity={.1}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
          ))}
        </group>

        <mesh rotation={[.13, -.22, .4]}>
          <torusGeometry args={[2.07, .003, 4, 160, Math.PI * 1.7]} />
          <meshBasicMaterial color="#9ad5e5" transparent opacity={.25} />
        </mesh>

        <mesh rotation={[-.17, .16, 2.1]}>
          <torusGeometry args={[2.16, .003, 4, 160, Math.PI * 1.35]} />
          <meshBasicMaterial color="#7cb6ca" transparent opacity={.17} />
        </mesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[geometry.ticks, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#a6edf6" transparent opacity={.6} />
        </lineSegments>

        <mesh position={[0, 0, -.5]}>
          <circleGeometry args={[1.76, 100]} />
          <meshBasicMaterial
            color="#0b3441"
            transparent
            opacity={.09}
            depthWrite={false}
          />
        </mesh>

        {globe ? (
          <group ref={earth} scale={.82}>
            <mesh>
              <sphereGeometry args={[.8, 18, 12]} />
              <meshBasicMaterial
                color="#4ac5d9"
                wireframe
                transparent
                opacity={.24}
              />
            </mesh>
            <points>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[geometry.nodes, 3]} />
              </bufferGeometry>
              <pointsMaterial size={.025} color="#bcfaff" transparent opacity={.8} />
            </points>
          </group>
        ) : (
          <mesh>
            <sphereGeometry args={[.025, 10, 8]} />
            <meshBasicMaterial color="#c9fcff" />
          </mesh>
        )}

        {[1.35, 1.85, 2.25].map((radius, i) => (
          <mesh
            key={radius}
            position={[0, -2.05 - i * .035, 0]}
            rotation={[-Math.PI / 2, 0, i * .3]}
          >
            <torusGeometry args={[radius, .004, 4, 120, Math.PI * 1.82]} />
            <meshBasicMaterial color="#4dabc1" transparent opacity={.24 + i * .1} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function NexusCinematicWorld(props: Props) {
  return (
    <SceneBoundary>
      <Canvas
        camera={{ position: [0, .12, 7.5], fov: 43 }}
        dpr={[1, 1.5]}
        frameloop={props.reduced ? 'demand' : 'always'}
        gl={{ alpha: false, antialias: true, powerPreference: 'low-power' }}
        fallback={<div className="nc-static-core" aria-hidden="true" />}
      >
        <World {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
