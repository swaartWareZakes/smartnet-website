'use client';

import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VoiceState } from './nexus-hologram';

type Props = {
  voiceState: VoiceState;
  reduced: boolean;
  analyser: RefObject<AnalyserNode | null>;
};

export function NexusFace({ voiceState, reduced, analyser }: Props) {
  const rig = useRef<THREE.Group>(null);
  const mouth = useRef<(THREE.Mesh | null)[]>([]);
  const eyes = useRef<(THREE.Mesh | null)[]>([]);
  const energy = useRef(0);
  const spectrum = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock, pointer }, delta) => {
    if (reduced) return;

    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (rig.current) {
      rig.current.position.y = Math.sin(t * 0.62) * 0.12;

      rig.current.rotation.y = THREE.MathUtils.damp(
        rig.current.rotation.y,
        pointer.x * 0.15 + Math.sin(t * 0.24) * 0.09,
        2,
        dt
      );

      rig.current.rotation.x = THREE.MathUtils.damp(
        rig.current.rotation.x,
        -pointer.y * 0.07,
        2,
        dt
      );
    }

    let level = 0;

    if (voiceState === 'speaking') {
      const meter = analyser.current;

      if (meter) {
        meter.getByteFrequencyData(spectrum);

        let total = 0;
        for (let i = 4; i < 40; i++) {
          total += spectrum[i];
        }

        level = Math.min(1, total / (36 * 120));
      } else {
        level = 0.3;
      }
    }

    energy.current = THREE.MathUtils.damp(
      energy.current,
      level,
      9,
      dt
    );

    mouth.current.forEach((bar, i) => {
      if (!bar) return;

      const shape = 0.35 + Math.abs(Math.sin(i * 0.8 + t * 11));
      const height = 0.3 + energy.current * shape * 3.1;

      bar.scale.y = THREE.MathUtils.damp(
        bar.scale.y,
        height,
        10,
        dt
      );
    });

    eyes.current.forEach((eye) => {
      if (!eye) return;

      eye.scale.y = THREE.MathUtils.damp(
        eye.scale.y,
        voiceState === 'listening' ? 1.25 : 1,
        4,
        dt
      );
    });
  });

  return (
    <group ref={rig} scale={1.46}>
      {/* Contoured metallic cranial structure */}
      <mesh position={[0, 0.12, 0]} scale={[0.74, 1.03, 0.53]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial
          color="#123349"
          metalness={0.83}
          roughness={0.19}
          clearcoat={1}
          clearcoatRoughness={0.14}
          flatShading
        />
      </mesh>

      {/* Holographic facial topology */}
      <mesh position={[0, 0.12, 0]} scale={[0.754, 1.045, 0.55]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color="#2badd7"
          transparent
          opacity={0.09}
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* Forehead armour and illuminated crown */}
      <mesh position={[0, 0.77, 0.32]} scale={[0.58, 0.18, 0.22]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial
          color="#247297"
          metalness={0.85}
          roughness={0.23}
        />
      </mesh>

      <mesh position={[0, 0.68, 0.48]}>
        <boxGeometry args={[0.85, 0.018, 0.025]} />
        <meshBasicMaterial color="#6ce8ff" toneMapped={false} />
      </mesh>

      {/* Dark visor */}
      <mesh position={[0, 0.36, 0.49]} scale={[0.61, 0.28, 0.16]}>
        <sphereGeometry args={[1, 30, 18]} />
        <meshPhysicalMaterial
          color="#020b17"
          metalness={0.3}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>

      {/* Angular light eyes */}
      {[-1, 1].map((side, i) => (
        <group key={side}>
          <mesh
            ref={(node) => { eyes.current[i] = node; }}
            position={[side * 0.255, 0.39, 0.644]}
            rotation={[0, 0, side * -0.13]}
          >
            <boxGeometry args={[0.26, 0.055, 0.03]} />
            <meshBasicMaterial
              color="#a2f5ff"
              toneMapped={false}
            />
          </mesh>

          {/* Cheek armour */}
          <mesh
            position={[side * 0.43, -0.08, 0.40]}
            rotation={[0, side * 0.3, side * 0.15]}
          >
            <boxGeometry args={[0.23, 0.55, 0.10]} />
            <meshStandardMaterial
              color="#205d79"
              metalness={0.78}
              roughness={0.22}
            />
          </mesh>

          <mesh
            position={[side * 0.48, -0.08, 0.47]}
            rotation={[0, 0, side * 0.15]}
          >
            <boxGeometry args={[0.018, 0.43, 0.025]} />
            <meshBasicMaterial color="#43ccea" />
          </mesh>

          {/* Side neural module */}
          <mesh position={[side * 0.76, 0.10, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.11, 20]} />
            <meshStandardMaterial
              color="#1c607e"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          <pointLight
            position={[side * 0.65, 0.3, 0.5]}
            color="#36ccff"
            intensity={1.2}
            distance={2.2}
          />
        </group>
      ))}

      {/* Nose and tapered lower facial structure */}
      <mesh position={[0, 0.05, 0.61]}>
        <octahedronGeometry args={[0.105, 0]} />
        <meshStandardMaterial
          color="#4288a7"
          metalness={0.9}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, -0.49, 0.26]} scale={[0.47, 0.39, 0.33]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial
          color="#153d53"
          metalness={0.88}
          roughness={0.2}
        />
      </mesh>

      {/* Real audio-driven mouth equalizer */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          ref={(node) => { mouth.current[i] = node; }}
          position={[(i - 4) * 0.063, -0.41, 0.588]}
        >
          <boxGeometry args={[0.038, 0.13, 0.02]} />
          <meshBasicMaterial
            color="#89efff"
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Jawline lighting */}
      <mesh position={[0, -0.78, 0.37]}>
        <boxGeometry args={[0.39, 0.016, 0.025]} />
        <meshBasicMaterial color="#43b9db" />
      </mesh>

      {/* Floating technical rings */}
      <mesh rotation={[1.1, 0.2, 0.22]} scale={1.13}>
        <torusGeometry args={[1.03, 0.006, 6, 128]} />
        <meshBasicMaterial
          color="#3b9cc5"
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[0.2, 1.1, 0.2]} scale={1.08}>
        <torusGeometry args={[1.17, 0.006, 6, 128]} />
        <meshBasicMaterial
          color="#63e2ff"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
