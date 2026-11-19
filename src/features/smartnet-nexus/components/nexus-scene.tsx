'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { NexusTunnel } from './nexus-tunnel';

const NODE_COUNT = 56;
const SIGNAL_COUNT = 84;
const DUST_COUNT = 420;

const CORE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vPos;
  void main() {
    vPos = position;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const CORE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vPos;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.4);
    float band1 = sin(vPos.y * 9.0 - uTime * 2.4 + vPos.x * 4.0) * 0.5 + 0.5;
    float band2 = cos(vPos.z * 11.0 + uTime * 1.9 - vPos.y * 5.0) * 0.5 + 0.5;
    float plasma = smoothstep(0.28, 0.88, band1 * 0.6 + band2 * 0.4);

    vec3 deep = vec3(0.03, 0.24, 0.42);
    vec3 cyan = vec3(0.18, 0.84, 1.0);
    vec3 hot = vec3(0.84, 0.99, 1.0);
    vec3 amber = vec3(1.0, 0.72, 0.34);

    vec3 col = mix(deep, cyan, plasma * 0.75 + 0.25);
    col = mix(col, hot, fresnel * 0.85);
    col += amber * pow(fresnel, 4.0) * (0.35 + uPulse * 0.35);

    float alpha = clamp(0.76 + fresnel * 0.24, 0.0, 1.0);
    gl_FragColor = vec4(col * (1.05 + uPulse * 0.25), alpha);
  }
`;

function Network({
  reduced,
  progress,
}: {
  reduced: boolean;
  progress: RefObject<number>;
}) {
  const assembly = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const coreShaderRef = useRef<THREE.ShaderMaterial>(null);
  const haloShellRef = useRef<THREE.Mesh>(null);
  const networkMaterial = useRef<THREE.LineBasicMaterial>(null);
  const field = useRef<THREE.Group>(null);
  const orbits = useRef<THREE.Group>(null);
  const hudRingA = useRef<THREE.Group>(null);
  const hudRingB = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);
  const signals = useRef<THREE.InstancedMesh>(null);

  const scrollSmooth = useRef(0);
  const dummyRef = useRef(new THREE.Object3D());
  const tempPosRef = useRef(new THREE.Vector3());

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
    }),
    []
  );

  // Distribute nodes in a three-dimensional Fibonacci lattice
  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = i * 2.399963229728653;

      return new THREE.Vector3(
        Math.cos(angle) * radius * 3.05,
        y * 2.72,
        Math.sin(angle) * radius * 3.05
      );
    });
  }, []);

  // Connect each node to its closest neighbours + build radial HUD ticks & ambient dust
  const built = useMemo(() => {
    const edges: Array<{ a: THREE.Vector3; b: THREE.Vector3 }> = [];
    const seen = new Set<string>();

    nodes.forEach((point, index) => {
      const closest = nodes
        .map((other, i) => ({
          i,
          distance: point.distanceToSquared(other),
        }))
        .filter((item) => item.i !== index)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      closest.forEach(({ i }) => {
        const key = [index, i].sort((a, b) => a - b).join('-');
        if (seen.has(key)) return;
        seen.add(key);
        edges.push({ a: point, b: nodes[i] });
      });
    });

    const positions: number[] = [];
    edges.forEach(({ a, b }) => {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    });

    const networkGeometry = new THREE.BufferGeometry();
    networkGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const edgesGeometry = new THREE.EdgesGeometry(
      new THREE.IcosahedronGeometry(1.16, 1)
    );

    // 180 precision radial HUD tick marks
    const tickCoords: number[] = [];
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      const r0 = 2.02;
      const r1 = r0 + (i % 5 === 0 ? 0.14 : 0.055);
      tickCoords.push(
        Math.cos(a) * r0,
        Math.sin(a) * r0,
        0,
        Math.cos(a) * r1,
        Math.sin(a) * r1,
        0
      );
    }
    const ticksGeometry = new THREE.BufferGeometry();
    ticksGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(tickCoords, 3)
    );

    // Deterministic ambient holographic data-dust starfield
    let seed = 9187;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const r = 3.2 + rand() * 5.8;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      dustPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = r * Math.cos(phi) * 0.72;
      dustPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 1.2;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(dustPositions, 3)
    );

    return {
      edges,
      networkGeometry,
      edgesGeometry,
      ticksGeometry,
      dustGeometry,
    };
  }, [nodes]);

  useEffect(() => {
    return () => {
      built.networkGeometry.dispose();
      built.edgesGeometry.dispose();
      built.ticksGeometry.dispose();
      built.dustGeometry.dispose();
    };
  }, [built]);

  useFrame((state, delta) => {
    if (reduced) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    scrollSmooth.current = THREE.MathUtils.damp(
      scrollSmooth.current,
      progress.current,
      3.2,
      dt
    );

    const p = scrollSmooth.current;

    if (coreShaderRef.current) {
      coreShaderRef.current.uniforms.uTime.value = t;
      coreShaderRef.current.uniforms.uPulse.value =
        Math.sin(t * 2.2) * 0.5 + 0.5 + p * 0.5;
    }

    if (haloShellRef.current) {
      haloShellRef.current.scale.setScalar(
        1.42 + Math.sin(t * 1.9) * 0.05 + p * 0.1
      );
      haloShellRef.current.rotation.y = t * 0.12;
    }

    if (networkMaterial.current) {
      networkMaterial.current.opacity =
        0.34 + Math.sin(t * 1.5) * 0.08 + Math.sin(p * Math.PI) * 0.18;
    }

    const ease = (a: number, b: number) => {
      const value = THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
      return value * value * (3 - 2 * value);
    };

    const unfold = ease(0.1, 0.33);
    const orbit = ease(0.34, 0.61);
    const reassemble = ease(0.63, 0.9);
    const dive = ease(0.76, 0.99);

    const expansion =
      (unfold * 0.44 + orbit * 0.25) * (1 - reassemble * 0.82);

    if (assembly.current) {
      assembly.current.rotation.y += dt * (0.095 + orbit * 0.22);

      assembly.current.rotation.x = THREE.MathUtils.damp(
        assembly.current.rotation.x,
        Math.sin(t * 0.22) * 0.07 + orbit * 0.3 - state.pointer.y * 0.13,
        2,
        dt
      );

      assembly.current.rotation.z = THREE.MathUtils.damp(
        assembly.current.rotation.z,
        state.pointer.x * 0.09 + orbit * 0.14,
        2,
        dt
      );

      const targetX =
        (1.85 - 3.2 * orbit + 3.2 * reassemble) *
        (1 - dive) *
        (state.size.width < 768 ? 0.35 : 1);

      assembly.current.position.x = THREE.MathUtils.damp(
        assembly.current.position.x,
        targetX,
        2.7,
        dt
      );

      assembly.current.position.y = Math.sin(t * 0.5) * 0.08;

      assembly.current.scale.setScalar(
        THREE.MathUtils.damp(
          assembly.current.scale.x,
          1 - dive * 0.91,
          3.1,
          dt
        )
      );
    }

    if (field.current) {
      const targetScale = 1 + expansion;
      field.current.scale.setScalar(
        THREE.MathUtils.damp(field.current.scale.x, targetScale, 3.3, dt)
      );
      field.current.rotation.z = THREE.MathUtils.damp(
        field.current.rotation.z,
        orbit * 0.68 - reassemble * 0.56,
        2.2,
        dt
      );
      field.current.rotation.x = THREE.MathUtils.damp(
        field.current.rotation.x,
        orbit * 0.55 - reassemble * 0.45,
        2.2,
        dt
      );
    }

    if (core.current) {
      core.current.rotation.y -= dt * (0.24 + orbit * 0.28);
      core.current.rotation.z += dt * 0.065;

      const targetCoreScale =
        1 - unfold * 0.36 - orbit * 0.18 + reassemble * 0.56;
      core.current.scale.setScalar(
        THREE.MathUtils.damp(
          core.current.scale.x,
          Math.max(0.38, targetCoreScale),
          3,
          dt
        )
      );
    }

    if (orbits.current) {
      orbits.current.rotation.y += dt * (0.14 + orbit * 0.5);
      orbits.current.rotation.x += dt * 0.09;
      const targetOrbitScale = 0.78 + orbit * 0.75 - reassemble * 0.4;
      orbits.current.scale.setScalar(
        THREE.MathUtils.damp(orbits.current.scale.x, targetOrbitScale, 3, dt)
      );
    }

    if (hudRingA.current) {
      hudRingA.current.rotation.z = t * 0.16 + p * 1.4;
      hudRingA.current.rotation.x = 0.36 + Math.sin(t * 0.3) * 0.08;
    }

    if (hudRingB.current) {
      hudRingB.current.rotation.z = -t * 0.22 - p * 1.8;
      hudRingB.current.rotation.y = -0.45 + Math.cos(t * 0.25) * 0.1;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = t * 0.018;
      dustRef.current.rotation.x = state.pointer.y * 0.05;
    }

    const baseCameraZ =
      9.1 + unfold * 1.35 + orbit * 1.1 - reassemble * 1.7;
    const targetCameraZ = THREE.MathUtils.lerp(baseCameraZ, -13, dive);

    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetCameraZ,
      3.6,
      dt
    );

    if (signals.current && built.edges.length > 0) {
      const dummy = dummyRef.current;
      const tempPos = tempPosRef.current;
      for (let i = 0; i < SIGNAL_COUNT; i++) {
        const edge = built.edges[(i * 7) % built.edges.length];
        const speed = 0.14 + (i % 6) * 0.035;
        const prog = (t * speed + i * 0.113) % 1;
        tempPos.lerpVectors(edge.a, edge.b, prog);
        dummy.position.copy(tempPos);

        const intensity = Math.sin(prog * Math.PI);
        dummy.scale.setScalar(0.45 + Math.max(0, intensity) * 1.65);
        dummy.updateMatrix();
        signals.current.setMatrixAt(i, dummy.matrix);
      }
      signals.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <points ref={dustRef} geometry={built.dustGeometry}>
        <pointsMaterial
          color="#7eeeff"
          size={0.026}
          transparent
          opacity={0.45}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <group ref={assembly}>
        <group ref={field}>
          <lineSegments geometry={built.networkGeometry}>
            <lineBasicMaterial
              ref={networkMaterial}
              color="#42d4ff"
              transparent
              opacity={0.46}
              depthWrite={false}
            />
          </lineSegments>

          {nodes.map((node, i) => {
            const isAmber = i % 11 === 0;
            const isKey = i % 7 === 0;
            return (
              <mesh
                key={i}
                position={[node.x, node.y, node.z]}
                scale={isAmber ? 1.85 : isKey ? 1.55 : 0.95}
              >
                <octahedronGeometry args={[0.075, 0]} />
                <meshStandardMaterial
                  color={
                    isAmber ? '#ffd49c' : isKey ? '#e2fcff' : '#3ad2f7'
                  }
                  emissive={isAmber ? '#ff9d3b' : '#0888b8'}
                  emissiveIntensity={isAmber ? 1.6 : 1.3}
                  metalness={0.45}
                  roughness={0.2}
                />
              </mesh>
            );
          })}

          <instancedMesh
            ref={signals}
            args={[undefined, undefined, SIGNAL_COUNT]}
            frustumCulled={false}
          >
            <sphereGeometry args={[0.036, 8, 8]} />
            <meshBasicMaterial color="#e8fcff" toneMapped={false} />
          </instancedMesh>
        </group>

        {/* Precision Holographic Gyro HUD Rings */}
        <group ref={orbits}>
          <group ref={hudRingA}>
            <lineSegments geometry={built.ticksGeometry}>
              <lineBasicMaterial
                color="#8cf4ff"
                transparent
                opacity={0.55}
                depthWrite={false}
              />
            </lineSegments>
            <mesh>
              <torusGeometry args={[2.24, 0.008, 6, 180, Math.PI * 1.45]} />
              <meshBasicMaterial
                color="#79efff"
                transparent
                opacity={0.52}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[0, 0, Math.PI * 1.6]}>
              <torusGeometry args={[2.24, 0.012, 6, 48, 0.5]} />
              <meshBasicMaterial
                color="#ffba6b"
                transparent
                opacity={0.78}
                depthWrite={false}
              />
            </mesh>
          </group>

          <group ref={hudRingB}>
            <mesh>
              <torusGeometry args={[1.76, 0.011, 6, 180, Math.PI * 1.65]} />
              <meshBasicMaterial
                color="#6eeaff"
                transparent
                opacity={0.46}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0.3, 0]}>
              <torusGeometry args={[2.46, 0.006, 5, 160, Math.PI * 1.25]} />
              <meshBasicMaterial
                color="#ffaa52"
                transparent
                opacity={0.38}
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>

        {/* Futuristic Fresnel Plasma Core */}
        <group ref={core}>
          <mesh>
            <icosahedronGeometry args={[0.84, 4]} />
            <shaderMaterial
              ref={coreShaderRef}
              vertexShader={CORE_VERTEX}
              fragmentShader={CORE_FRAGMENT}
              uniforms={coreUniforms}
              transparent
            />
          </mesh>

          <mesh>
            <icosahedronGeometry args={[1.1, 1]} />
            <meshPhysicalMaterial
              color="#257da8"
              metalness={0.55}
              roughness={0.18}
              clearcoat={1}
              clearcoatRoughness={0.08}
              emissive="#076594"
              emissiveIntensity={0.35}
              transparent
              opacity={0.55}
              depthWrite={false}
              flatShading
            />
          </mesh>

          <lineSegments geometry={built.edgesGeometry}>
            <lineBasicMaterial
              color="#baf6ff"
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </lineSegments>

          <mesh ref={haloShellRef} scale={1.42}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial
              color="#58dcff"
              wireframe
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>

          <pointLight
            color="#20ccff"
            intensity={16}
            distance={7}
            decay={2}
          />
        </group>
      </group>
    </>
  );
}

export default function NexusScene({
  progress,
  visible,
}: {
  progress: RefObject<number>;
  visible: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 9.1], fov: 45 }}
      dpr={[1, 1.5]}
      frameloop={reduced || !visible ? 'demand' : 'always'}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <ambientLight intensity={1.25} />
      <hemisphereLight args={['#c2f2ff', '#061422', 2.2]} />
      <directionalLight position={[4, 6, 8]} intensity={4.2} color="#e5f8ff" />
      <directionalLight position={[-4, -3, 2]} intensity={2.2} color="#2ab5ff" />

      <Network reduced={!!reduced} progress={progress} />
      {!reduced && <NexusTunnel progress={progress} />}
    </Canvas>
  );
}
