'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

export type GlobalHub = {
  id: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  timezone: string;
  role: string;
  hq?: boolean;
};

export const GLOBAL_HUBS: GlobalHub[] = [
  {
    id: 'jhb',
    city: 'Johannesburg',
    region: 'Gauteng, South Africa',
    lat: -26.2041,
    lon: 28.0473,
    timezone: 'Africa/Johannesburg',
    role: 'SmartNet Engineering HQ',
    hq: true,
  },
  {
    id: 'cpt',
    city: 'Cape Town',
    region: 'Western Cape, South Africa',
    lat: -33.9249,
    lon: 18.4241,
    timezone: 'Africa/Johannesburg',
    role: 'National Delivery Corridor',
  },
  {
    id: 'lon',
    city: 'London',
    region: 'United Kingdom',
    lat: 51.5072,
    lon: -0.1276,
    timezone: 'Europe/London',
    role: 'EMEA Remote Engineering',
  },
  {
    id: 'ams',
    city: 'Amsterdam',
    region: 'Netherlands',
    lat: 52.3676,
    lon: 4.9041,
    timezone: 'Europe/Amsterdam',
    role: 'European Cloud Connectivity',
  },
  {
    id: 'dxb',
    city: 'Dubai',
    region: 'United Arab Emirates',
    lat: 25.2048,
    lon: 55.2708,
    timezone: 'Asia/Dubai',
    role: 'MEA Advisory & Solutions',
  },
  {
    id: 'nyc',
    city: 'New York',
    region: 'United States',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
    role: 'North America Collaboration',
  },
  {
    id: 'sin',
    city: 'Singapore',
    region: 'Southeast Asia',
    lat: 1.3521,
    lon: 103.8198,
    timezone: 'Asia/Singapore',
    role: 'APAC Remote Delivery',
  },
];

const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const ATMO_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.8);
    float pulse = 0.85 + sin(uTime * 1.8) * 0.15;
    vec3 cyan = vec3(0.18, 0.84, 1.0);
    vec3 amber = vec3(1.0, 0.72, 0.36);
    vec3 col = mix(cyan, amber, pow(rim, 3.2) * 0.45);
    gl_FragColor = vec4(col * pulse, rim * 0.72);
  }
`;

function latLonToVec3(lat: number, lon: number, radius = 2.0): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function targetRotationForHub(hub: GlobalHub): { x: number; y: number } {
  const lonRad = THREE.MathUtils.degToRad(hub.lon);
  const latRad = THREE.MathUtils.degToRad(hub.lat);
  return {
    x: THREE.MathUtils.clamp(latRad * 0.52, -0.75, 0.75),
    y: -lonRad - Math.PI / 2,
  };
}

function GlobalEarthScene({
  activeHub,
  onSelectHub,
  reduced,
}: {
  activeHub: GlobalHub;
  onSelectHub: (hub: GlobalHub) => void;
  reduced: boolean;
}) {
  const worldRef = useRef<THREE.Group>(null);
  const hudRingA = useRef<THREE.Group>(null);
  const hudRingB = useRef<THREE.Group>(null);
  const satGroupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const pulsesRef = useRef<THREE.InstancedMesh>(null);
  const atmoShaderRef = useRef<THREE.ShaderMaterial>(null);

  const dummyRef = useRef(new THREE.Object3D());
  const posRef = useRef(new THREE.Vector3());
  const rotRef = useRef({
    x: targetRotationForHub(activeHub).x,
    y: targetRotationForHub(activeHub).y,
  });

  const atmoUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const built = useMemo(() => {
    // 2,200 Fibonacci lattice surface nodes
    const latticeCount = 2200;
    const latticeArr = new Float32Array(latticeCount * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < latticeCount; i++) {
      const y = 1 - (i / (latticeCount - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      latticeArr[i * 3] = Math.cos(theta) * r * 2.02;
      latticeArr[i * 3 + 1] = y * 2.02;
      latticeArr[i * 3 + 2] = Math.sin(theta) * r * 2.02;
    }
    const latticeGeo = new THREE.BufferGeometry();
    latticeGeo.setAttribute('position', new THREE.BufferAttribute(latticeArr, 3));

    // Precision outer radar tick marks (180 ticks)
    const tickCoords: number[] = [];
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      const r0 = 2.66;
      const r1 = r0 + (i % 5 === 0 ? 0.16 : 0.06);
      tickCoords.push(
        Math.cos(a) * r0,
        Math.sin(a) * r0,
        0,
        Math.cos(a) * r1,
        Math.sin(a) * r1,
        0
      );
    }
    const ticksGeo = new THREE.BufferGeometry();
    ticksGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(tickCoords, 3)
    );

    // Deterministic deep-space starfield
    let seed = 31415;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const starCount = 540;
    const starArr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const dist = 5.4 + rand() * 8.5;
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      starArr[i * 3] = dist * Math.sin(v) * Math.cos(u);
      starArr[i * 3 + 1] = dist * Math.cos(v) * 0.8;
      starArr[i * 3 + 2] = dist * Math.sin(v) * Math.sin(u) - 2.0;
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));

    // Elevated global Bezier arcs radiating from Johannesburg HQ to every hub
    const hq = GLOBAL_HUBS[0];
    const origin = latLonToVec3(hq.lat, hq.lon, 2.04);
    const arcs = GLOBAL_HUBS.slice(1).map((hub) => {
      const dest = latLonToVec3(hub.lat, hub.lon, 2.04);
      const dist = origin.distanceTo(dest);
      const mid = origin
        .clone()
        .add(dest)
        .normalize()
        .multiplyScalar(2.04 + Math.min(1.25, dist * 0.34));
      return {
        hubId: hub.id,
        curve: new THREE.QuadraticBezierCurve3(origin.clone(), mid, dest),
      };
    });

    const markers = GLOBAL_HUBS.map((hub) => ({
      hub,
      pos: latLonToVec3(hub.lat, hub.lon, 2.06),
    }));

    return { latticeGeo, ticksGeo, starsGeo, arcs, markers };
  }, []);

  useEffect(() => {
    return () => {
      built.latticeGeo.dispose();
      built.ticksGeo.dispose();
      built.starsGeo.dispose();
    };
  }, [built]);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (atmoShaderRef.current) {
      atmoShaderRef.current.uniforms.uTime.value = t;
    }

    const goal = targetRotationForHub(activeHub);
    const idleSpin = reduced ? 0 : Math.sin(t * 0.16) * 0.18;

    rotRef.current.x = THREE.MathUtils.damp(
      rotRef.current.x,
      goal.x - (reduced ? 0 : pointer.y * 0.12),
      2.6,
      dt
    );
    rotRef.current.y = THREE.MathUtils.damp(
      rotRef.current.y,
      goal.y + idleSpin + (reduced ? 0 : pointer.x * 0.18),
      2.6,
      dt
    );

    if (worldRef.current) {
      worldRef.current.rotation.x = rotRef.current.x;
      worldRef.current.rotation.y = rotRef.current.y;
      worldRef.current.position.y = reduced ? 0 : Math.sin(t * 0.55) * 0.06;
    }

    if (reduced) return;

    if (hudRingA.current) {
      hudRingA.current.rotation.z = t * 0.12;
      hudRingA.current.rotation.x = 0.42 + Math.sin(t * 0.25) * 0.06;
    }

    if (hudRingB.current) {
      hudRingB.current.rotation.z = -t * 0.18;
      hudRingB.current.rotation.y = -0.35 + Math.cos(t * 0.22) * 0.08;
    }

    if (satGroupRef.current) {
      satGroupRef.current.children.forEach((sat, idx) => {
        const angle = t * (0.28 + idx * 0.09) + idx * 2.1;
        const r = 2.86 + idx * 0.16;
        sat.position.set(
          Math.cos(angle) * r,
          Math.sin(angle * 0.85) * (r * 0.58),
          Math.sin(angle) * r
        );
        sat.rotation.y = t * 0.8;
      });
    }

    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.015;
    }

    // Stream 18 high-speed light packets across the 6 global fiber arcs
    if (pulsesRef.current && built.arcs.length > 0) {
      const dummy = dummyRef.current;
      const pos = posRef.current;
      const total = built.arcs.length * 3;
      for (let i = 0; i < total; i++) {
        const arc = built.arcs[i % built.arcs.length];
        const speed = 0.24 + (i % 3) * 0.07;
        const phase = (t * speed + i * 0.19) % 1;
        arc.curve.getPoint(phase, pos);
        dummy.position.copy(pos);
        const scale = 0.55 + Math.sin(phase * Math.PI) * 1.35;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        pulsesRef.current.setMatrixAt(i, dummy.matrix);
      }
      pulsesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <points ref={starsRef} geometry={built.starsGeo}>
        <pointsMaterial
          color="#9ef3ff"
          size={0.028}
          transparent
          opacity={0.55}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Outer orbital gyroscope & satellites (stationary frame around Earth) */}
      <group ref={hudRingA}>
        <lineSegments geometry={built.ticksGeo}>
          <lineBasicMaterial
            color="#7eeeff"
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </lineSegments>
        <mesh>
          <torusGeometry args={[2.86, 0.008, 6, 180, Math.PI * 1.48]} />
          <meshBasicMaterial
            color="#7beeff"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI * 1.62]}>
          <torusGeometry args={[2.86, 0.014, 6, 48, 0.55]} />
          <meshBasicMaterial
            color="#ffba6b"
            transparent
            opacity={0.82}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={hudRingB}>
        <mesh rotation={[Math.PI / 2.2, 0.25, 0]}>
          <torusGeometry args={[2.52, 0.007, 5, 160, Math.PI * 1.35]} />
          <meshBasicMaterial
            color="#ffba6b"
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 3, 0.4, 0.8]}>
          <torusGeometry args={[3.06, 0.006, 5, 160, Math.PI * 1.2]} />
          <meshBasicMaterial
            color="#58dcff"
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={satGroupRef}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx}>
            <octahedronGeometry args={[idx === 1 ? 0.068 : 0.052, 0]} />
            <meshBasicMaterial
              color={idx === 1 ? '#ffd49c' : '#ccfaff'}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Interactive Rotating 3D Earth + Global Arcs */}
      <group ref={worldRef}>
        <mesh>
          <sphereGeometry args={[1.97, 48, 36]} />
          <meshStandardMaterial
            color="#06233a"
            metalness={0.62}
            roughness={0.4}
            emissive="#04192a"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Atmospheric Fresnel Halo */}
        <mesh>
          <sphereGeometry args={[2.12, 48, 36]} />
          <shaderMaterial
            ref={atmoShaderRef}
            vertexShader={ATMO_VERTEX}
            fragmentShader={ATMO_FRAGMENT}
            uniforms={atmoUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Geodetic wireframe shell */}
        <mesh>
          <sphereGeometry args={[2.0, 28, 20]} />
          <meshBasicMaterial
            color="#49c9f2"
            wireframe
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>

        {/* Equator & meridian precision rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.03, 0.005, 4, 140]} />
          <meshBasicMaterial color="#75e9ff" transparent opacity={0.35} />
        </mesh>

        {/* Fibonacci lattice surface points */}
        <points geometry={built.latticeGeo}>
          <pointsMaterial
            color="#7ae8ff"
            size={0.017}
            transparent
            opacity={0.68}
            depthWrite={false}
            sizeAttenuation
          />
        </points>

        {/* Global fiber arcs */}
        {built.arcs.map((arc) => {
          const highlighted = arc.hubId === activeHub.id;
          return (
            <mesh key={arc.hubId}>
              <tubeGeometry
                args={[arc.curve, 40, highlighted ? 0.014 : 0.008, 6, false]}
              />
              <meshBasicMaterial
                color={highlighted ? '#ffca80' : '#6beeff'}
                transparent
                opacity={highlighted ? 0.95 : 0.45}
                depthWrite={false}
              />
            </mesh>
          );
        })}

        {/* High-speed streaming data packets along arcs */}
        <instancedMesh
          ref={pulsesRef}
          args={[undefined, undefined, built.arcs.length * 3]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshBasicMaterial color="#fff3d6" toneMapped={false} />
        </instancedMesh>

        {/* Interactive Hub Beacons */}
        {built.markers.map(({ hub, pos }) => {
          const isSelected = hub.id === activeHub.id;
          const color = hub.hq
            ? '#ffbe6b'
            : isSelected
              ? '#ffffff'
              : '#7beeff';
          return (
            <group key={hub.id} position={pos}>
              <mesh
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectHub(hub);
                }}
              >
                <sphereGeometry
                  args={[hub.hq ? 0.088 : isSelected ? 0.08 : 0.056, 16, 16]}
                />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
              <mesh>
                <sphereGeometry
                  args={[hub.hq ? 0.175 : isSelected ? 0.155 : 0.105, 14, 14]}
                />
                <meshBasicMaterial
                  color={hub.hq ? '#ffaa52' : '#74ecff'}
                  transparent
                  opacity={isSelected || hub.hq ? 0.34 : 0.2}
                  depthWrite={false}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
}

export default function GlobalContactGlobe({
  activeHub,
  onSelectHub,
}: {
  activeHub: GlobalHub;
  onSelectHub: (hub: GlobalHub) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      className="sn-global-earth-canvas"
      aria-label="Interactive 3D global connectivity globe linking South Africa to international hubs"
    >
      <Canvas
        camera={{ position: [0, 0.15, 7.6], fov: 44 }}
        dpr={[1, 1.5]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={1.45} />
        <hemisphereLight args={['#c8f4ff', '#061524', 2.2]} />
        <directionalLight position={[5, 6, 8]} intensity={3.8} color="#e5faff" />
        <pointLight
          position={[-4, -2, 5]}
          intensity={14}
          distance={14}
          color="#2bc2ff"
        />

        <GlobalEarthScene
          activeHub={activeHub}
          onSelectHub={onSelectHub}
          reduced={!!reduced}
        />
      </Canvas>
    </div>
  );
}
