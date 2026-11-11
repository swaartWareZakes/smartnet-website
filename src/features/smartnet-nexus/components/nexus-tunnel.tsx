'use client';

import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  progress: RefObject<number>;
};

export function NexusTunnel({ progress }: Props) {
  const tunnel = useRef<THREE.Group>(null);
  const strands = useRef<THREE.LineBasicMaterial>(null);

  // Spiral light paths travel away from the camera
  // along the negative Z-axis.
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const lanes = 24;
    const segments = 72;

    for (let lane = 0; lane < lanes; lane++) {
      const offset = (lane / lanes) * Math.PI * 2;

      const vertex = (step: number) => {
        const z = -1.5 - step * 0.29;
        const angle = offset + step * 0.037;
        const radius = 2.17 + Math.sin(step * 0.16 + lane) * 0.13;

        return [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          z,
        ];
      };

      for (let step = 0; step < segments; step++) {
        positions.push(
          ...vertex(step),
          ...vertex(step + 1)
        );
      }
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    return buffer;
  }, []);

  useFrame((state, delta) => {
    const group = tunnel.current;
    if (!group) return;

    const raw = THREE.MathUtils.clamp(
      (progress.current - 0.75) / 0.24,
      0,
      1
    );

    const reveal = raw * raw * (3 - 2 * raw);

    group.visible = reveal > 0.005;

    const dt = Math.min(delta, 0.05);

    group.rotation.z += dt * (
      0.09 + reveal * 1.15
    );

    const targetScale = 0.83 + reveal * 0.22;

    group.scale.setScalar(
      THREE.MathUtils.damp(
        group.scale.x,
        targetScale,
        3.5,
        dt
      )
    );

    if (strands.current) {
      strands.current.opacity = reveal * 0.56;
    }

    // Fade the light rings into the scene.
    group.children.forEach((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const material = child.material;

      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = reveal * 0.48;
      }
    });
  });

  return (
    <group ref={tunnel} visible={false}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          ref={strands}
          color="#53cfff"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {Array.from({ length: 11 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0, -1.7 - i * 1.9]}
          rotation={[0, 0, i * 0.17]}
        >
          <torusGeometry args={[2.16, 0.012, 5, 128]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#c4f7ff' : '#35a8e1'}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
