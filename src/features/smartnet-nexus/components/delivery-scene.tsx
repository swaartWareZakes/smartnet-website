'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  selected: number;
  reduced: boolean;
  visible: boolean;
};

function Tower({
  index,
  selected,
  reduced,
}: {
  index: number;
  selected: number;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const active = index === selected;

  useFrame((state, delta) => {
    if (!group.current || reduced) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    const targetScale = active ? 1.12 : 0.85;

    group.current.scale.setScalar(
      THREE.MathUtils.damp(
        group.current.scale.x,
        targetScale,
        3,
        dt
      )
    );

    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      Math.sin(t * 0.65 + index) * 0.09 +
        (active ? 0.22 : -0.14),
      2,
      dt
    );

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      Math.sin(t * 0.35 + index) * 0.22 +
        state.pointer.x * 0.12,
      2,
      dt
    );
  });

  return (
    <group position={[(index - 1) * 2.7, 0, 0]}>
      <group ref={group}>
        {Array.from({ length: 5 }, (_, layer) => (
          <group
            key={layer}
            position={[0, (layer - 2) * 0.57, 0]}
          >
            <mesh>
              <boxGeometry args={[1.3, 0.44, 1.2]} />
              <meshStandardMaterial
                color={active ? '#28799c' : '#173447'}
                metalness={0.82}
                roughness={0.23}
                emissive={active ? '#12618a' : '#071b28'}
                emissiveIntensity={active ? 0.8 : 0.3}
              />
            </mesh>

            <mesh scale={[1.04, 1.08, 1.04]}>
              <boxGeometry args={[1.3, 0.44, 1.2]} />
              <meshBasicMaterial
                color={active ? '#9befff' : '#407d98'}
                wireframe
                transparent
                opacity={active ? 0.58 : 0.2}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 1.68, 0]}>
          <octahedronGeometry args={[0.28, 0]} />
          <meshBasicMaterial
            color={active ? '#b8f7ff' : '#3a9dbd'}
            toneMapped={false}
          />
        </mesh>

        <mesh
          position={[0, -1.75, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1.05, 0.012, 6, 96]} />
          <meshBasicMaterial
            color={active ? '#75e6ff' : '#24516a'}
            transparent
            opacity={active ? 0.9 : 0.35}
          />
        </mesh>
      </group>
    </group>
  );
}

function Transmission({
  selected,
  reduced,
}: {
  selected: number;
  reduced: boolean;
}) {
  const packet = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!packet.current || reduced) return;

    const progress = (state.clock.elapsedTime * 0.45) % 1;
    const targetX = (selected - 1) * 2.7;

    packet.current.position.x =
      THREE.MathUtils.lerp(0, targetX, progress);

    packet.current.position.y =
      Math.sin(progress * Math.PI) * 0.4;
  });

  return (
    <group>
      {[-1.35, 1.35].map((x) => (
        <mesh
          key={x}
          position={[x, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.012, 0.012, 2.7, 6]} />
          <meshBasicMaterial
            color="#3e9dbf"
            transparent
            opacity={0.45}
          />
        </mesh>
      ))}

      <mesh ref={packet}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshBasicMaterial
          color="#d5fcff"
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Wake({ selected }: { selected: number }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [selected, invalidate]);

  return null;
}

export default function DeliveryScene({
  selected,
  reduced,
  visible,
}: Props) {
  return (
    <Canvas
      camera={{ position: [0, 1, 10.5], fov: 43 }}
      dpr={[1, 1.5]}
      frameloop={visible && !reduced ? 'always' : 'demand'}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <ambientLight intensity={0.8} />

      <hemisphereLight
        args={['#a2eaff', '#07131e', 1.5]}
      />

      <directionalLight
        position={[4, 7, 8]}
        color="#e4faff"
        intensity={3.8}
      />

      <pointLight
        position={[0, 1, 4]}
        color="#23baff"
        intensity={22}
        distance={12}
      />

      <group rotation={[0.1, -0.15, 0]}>
        {[0, 1, 2].map((index) => (
          <Tower
            key={index}
            index={index}
            selected={selected}
            reduced={reduced}
          />
        ))}

        <Transmission
          selected={selected}
          reduced={reduced}
        />
      </group>

      <Wake selected={selected} />
    </Canvas>
  );
}
