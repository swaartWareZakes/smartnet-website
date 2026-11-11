'use client';

import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

const NODE_COUNT = 42;
const SIGNAL_COUNT = 48;

function Network({
  reduced,
  progress,
}: {
  reduced: boolean;
  progress: RefObject<number>;
}) {
  const assembly = useRef<THREE.Group>(null);
  // SMARTNET NEXUS V4 SCROLL CHOREOGRAPHY
  const core = useRef<THREE.Group>(null);
  const field = useRef<THREE.Group>(null);
  const orbits = useRef<THREE.Group>(null);
  const scrollSmooth = useRef(0);

  const signals = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  // Distribute nodes in a three-dimensional network.
  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = i * 2.399963229728653;

      return new THREE.Vector3(
        Math.cos(angle) * radius * 2.9,
        y * 2.65,
        Math.sin(angle) * radius * 2.9
      );
    });
  }, []);

  // Connect each node to its closest neighbours.
  const network = useMemo(() => {
    const edges: Array<{
      a: THREE.Vector3;
      b: THREE.Vector3;
    }> = [];

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
      positions.push(
        a.x, a.y, a.z,
        b.x, b.y, b.z
      );
    });

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    return { edges, geometry };
  }, [nodes]);

  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(
      new THREE.IcosahedronGeometry(1.13, 1)
    );
  }, []);

  useFrame((state, delta) => {
    if (reduced) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Smooth the incoming scroll value to avoid abrupt movement.
    scrollSmooth.current = THREE.MathUtils.damp(
      scrollSmooth.current,
      progress.current,
      3.2,
      dt
    );

    const p = scrollSmooth.current;

    const ease = (a: number, b: number) => {
      const value = THREE.MathUtils.clamp(
        (p - a) / (b - a),
        0,
        1
      );
      return value * value * (3 - 2 * value);
    };

    // Section 2: unfold the computational network.
    const unfold = ease(0.10, 0.33);

    // Section 3: expand into an orbital structure.
    const orbit = ease(0.34, 0.61);

    // Section 4: reassemble the system.
    const reassemble = ease(0.63, 0.90);

    const expansion =
      (unfold * 0.40 + orbit * 0.22) *
      (1 - reassemble * 0.82);

    if (assembly.current) {
      assembly.current.rotation.y += dt * (
        0.09 + orbit * 0.18
      );

      assembly.current.rotation.x = THREE.MathUtils.damp(
        assembly.current.rotation.x,
        Math.sin(t * 0.22) * 0.07 +
          orbit * 0.30 -
          state.pointer.y * 0.10,
        1.8,
        dt
      );

      assembly.current.rotation.z = THREE.MathUtils.damp(
        assembly.current.rotation.z,
        state.pointer.x * 0.07 +
          orbit * 0.13,
        1.8,
        dt
      );

      // Move the sculpture between left and right
      // so it complements each editorial chapter.
      const targetX =
        1.20 - 3.1 * orbit + 3.1 * reassemble;

      assembly.current.position.x = THREE.MathUtils.damp(
        assembly.current.position.x,
        targetX,
        2.6,
        dt
      );

      assembly.current.position.y = Math.sin(t * 0.45) * 0.07;
    }

    if (field.current) {
      const targetScale = 1 + expansion;

      field.current.scale.setScalar(
        THREE.MathUtils.damp(
          field.current.scale.x,
          targetScale,
          3.3,
          dt
        )
      );

      field.current.rotation.z = THREE.MathUtils.damp(
        field.current.rotation.z,
        orbit * 0.62 - reassemble * 0.54,
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
      core.current.rotation.y -= dt * (
        0.21 + orbit * 0.25
      );

      core.current.rotation.z += dt * 0.055;

      const targetCoreScale =
        1 - unfold * 0.40 -
        orbit * 0.20 +
        reassemble * 0.58;

      core.current.scale.setScalar(
        THREE.MathUtils.damp(
          core.current.scale.x,
          Math.max(0.35, targetCoreScale),
          3,
          dt
        )
      );
    }

    if (orbits.current) {
      orbits.current.rotation.y += dt * (
        0.12 + orbit * 0.45
      );

      orbits.current.rotation.x += dt * 0.08;

      const targetOrbitScale =
        0.72 + orbit * 0.72 -
        reassemble * 0.42;

      orbits.current.scale.setScalar(
        THREE.MathUtils.damp(
          orbits.current.scale.x,
          targetOrbitScale,
          3,
          dt
        )
      );
    }

    // Give the expanding network more camera space.
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      9 + unfold * 1.3 +
        orbit * 1.1 -
        reassemble * 1.7,
      2,
      dt
    );

    // Animate luminous data packets along network edges.
    if (signals.current) {
      for (let i = 0; i < SIGNAL_COUNT; i++) {
        const edge = network.edges[
          (i * 11) % network.edges.length
        ];

        const speed = 0.10 + (i % 5) * 0.025;
        const progress = (t * speed + i * 0.137) % 1;

        tempPosition.lerpVectors(edge.a, edge.b, progress);

        dummy.position.copy(tempPosition);

        const intensity = Math.sin(progress * Math.PI);

        dummy.scale.setScalar(
          0.5 + Math.max(0, intensity) * 1.3
        );

        dummy.updateMatrix();
        signals.current.setMatrixAt(i, dummy.matrix);
      }

      signals.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={assembly}>

      <group ref={field}>
      {/* Network connections */}
      <lineSegments geometry={network.geometry}>
        <lineBasicMaterial
          color="#42c9fa"
          transparent
          opacity={0.43}
          depthWrite={false}
        />
      </lineSegments>

      {/* Distributed processing nodes */}
      {nodes.map((node, i) => (
        <mesh
          key={i}
          position={[node.x, node.y, node.z]}
          scale={i % 7 === 0 ? 1.65 : 1}
        >
          <octahedronGeometry args={[0.077, 0]} />
          <meshStandardMaterial
            color={i % 7 === 0 ? '#e0faff' : '#39c7ed'}
            emissive="#087fa8"
            emissiveIntensity={1.2}
            metalness={0.35}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Travelling data packets - one instanced draw call */}
      <instancedMesh
        ref={signals}
        args={[undefined, undefined, SIGNAL_COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.037, 8, 8]} />
        <meshBasicMaterial
          color="#e0fbff"
          toneMapped={false}
        />
      </instancedMesh>

      </group>

      {/* New spatial orbit architecture */}
      <group ref={orbits}>
        <mesh rotation={[Math.PI / 2, 0.25, 0]}>
          <torusGeometry args={[1.65, 0.01, 6, 180]} />
          <meshBasicMaterial
            color="#72e6ff"
            transparent
            opacity={0.36}
            depthWrite={false}
          />
        </mesh>

        <mesh rotation={[0.55, Math.PI / 2, 0.8]}>
          <torusGeometry args={[1.85, 0.008, 6, 180]} />
          <meshBasicMaterial
            color="#238ebc"
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Computational core */}
      <group ref={core}>

        {/* Inner energy source */}
        <mesh>
          <icosahedronGeometry args={[0.74, 2]} />
          <meshBasicMaterial
            color="#21c9f5"
            toneMapped={false}
          />
        </mesh>

        {/* Semi-transparent metal shell */}
        <mesh>
          <icosahedronGeometry args={[1.08, 1]} />
          <meshPhysicalMaterial
            color="#317ea5"
            metalness={0.42}
            roughness={0.24}
            clearcoat={1}
            clearcoatRoughness={0.12}
            emissive="#075b87"
            emissiveIntensity={0.28}
            transparent
            opacity={0.85}
            depthWrite={false}
            flatShading
          />
        </mesh>

        {/* Bright geometric edges */}
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial
            color="#a4f1ff"
            transparent
            opacity={0.76}
            depthWrite={false}
          />
        </lineSegments>

        {/* Outer technical framework */}
        <mesh scale={1.36}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#49c9f5"
            wireframe
            transparent
            opacity={0.20}
            depthWrite={false}
          />
        </mesh>

        <pointLight
          color="#14bfff"
          intensity={14}
          distance={6}
          decay={2}
        />
      </group>
    </group>
  );
}

export default function NexusScene({
  progress,
}: {
  progress: RefObject<number>;
}) {
  const reduced = useReducedMotion();

  return (
    <Canvas
      camera={{
        position: [0, 0, 9],
        fov: 45,
      }}
      dpr={[1, 1.5]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <ambientLight intensity={1.2} />

      <hemisphereLight
        args={['#b5eaff', '#071320', 2]}
      />

      <directionalLight
        position={[4, 6, 8]}
        intensity={4}
        color="#e1f6ff"
      />

      <directionalLight
        position={[-4, -3, 2]}
        intensity={2}
        color="#29aaf0"
      />

      <Network reduced={!!reduced} progress={progress} />
    </Canvas>
  );
}
