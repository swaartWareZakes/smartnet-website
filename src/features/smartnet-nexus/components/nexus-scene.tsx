'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

const NODE_COUNT = 42;
const SIGNAL_COUNT = 48;

function Network({ reduced }: { reduced: boolean }) {
  const assembly = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
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

    if (assembly.current) {
      assembly.current.rotation.y += dt * 0.09;

      assembly.current.rotation.x = THREE.MathUtils.damp(
        assembly.current.rotation.x,
        Math.sin(t * 0.22) * 0.07 - state.pointer.y * 0.15,
        1.8,
        dt
      );

      assembly.current.rotation.z = THREE.MathUtils.damp(
        assembly.current.rotation.z,
        state.pointer.x * 0.09,
        1.8,
        dt
      );

      assembly.current.position.y = Math.sin(t * 0.45) * 0.08;
    }

    if (core.current) {
      core.current.rotation.y -= dt * 0.21;
      core.current.rotation.z += dt * 0.055;
    }

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

export default function NexusScene() {
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

      <Network reduced={!!reduced} />
    </Canvas>
  );
}
