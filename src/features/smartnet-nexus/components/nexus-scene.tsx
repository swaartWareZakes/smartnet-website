'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Network() {
  const assembly = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    const count = 36;

    return Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * 2.3999632297;

      return new THREE.Vector3(
        Math.cos(angle) * radius * 2.7,
        y * 2.45,
        Math.sin(angle) * radius * 2.7
      );
    });
  }, []);

  const connections = useMemo(() => {
    const positions: number[] = [];
    const connected = new Set<string>();

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

        if (connected.has(key)) return;
        connected.add(key);

        const other = nodes[i];

        positions.push(
          point.x, point.y, point.z,
          other.x, other.y, other.z
        );
      });
    });

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    return geometry;
  }, [nodes]);

  useFrame((state, delta) => {
    if (!assembly.current) return;

    const time = state.clock.elapsedTime;
    assembly.current.rotation.y += Math.min(delta, 0.05) * 0.11;
    assembly.current.rotation.x = Math.sin(time * 0.17) * 0.12;

    if (core.current) {
      core.current.rotation.y -= delta * 0.19;
      core.current.rotation.z += delta * 0.07;
    }
  });

  return (
    <group ref={assembly}>
      <lineSegments geometry={connections}>
        <lineBasicMaterial
          color="#46d9ff"
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </lineSegments>

      {nodes.map((node, index) => (
        <mesh
          key={index}
          position={[node.x, node.y, node.z]}
          scale={index % 6 === 0 ? 1.65 : 1}
        >
          <octahedronGeometry args={[0.085, 0]} />
          <meshStandardMaterial
            color={index % 6 === 0 ? '#ffffff' : '#67e6ff'}
            emissive="#12b5e8"
            emissiveIntensity={index % 6 === 0 ? 2 : 0.9}
            metalness={0.45}
            roughness={0.2}
          />
        </mesh>
      ))}

      <mesh ref={core}>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshPhysicalMaterial
          color="#163747"
          metalness={0.88}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
          flatShading
        />
      </mesh>

      <mesh scale={1.24}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial
          color="#62dfff"
          wireframe
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={0.45}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#83edff" />
      </mesh>

      <pointLight
        color="#18cfff"
        intensity={35}
        distance={7}
        decay={2}
      />
    </group>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 8]}
        intensity={3}
        color="#d9f5ff"
      />
      <pointLight
        position={[-4, -2, 3]}
        intensity={35}
        distance={12}
        color="#177fe8"
      />
      <Network />
    </Canvas>
  );
}

export default Scene;
