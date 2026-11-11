'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

type Variant = 'landing' | 'services' | 'portfolio' | 'about';

const CITIES = [
  { name: 'JOHANNESBURG', lat: -26.204, lon: 28.047 },
  { name: 'PRETORIA', lat: -25.747, lon: 28.188 },
  { name: 'CAPE TOWN', lat: -33.925, lon: 18.424 },
  { name: 'DURBAN', lat: -29.858, lon: 31.021 },
  { name: 'GQEBERHA', lat: -33.961, lon: 25.603 },
  { name: 'BLOEMFONTEIN', lat: -29.085, lon: 26.159 },
  { name: 'POLOKWANE', lat: -23.904, lon: 29.468 },
  { name: 'MBOMBELA', lat: -25.475, lon: 30.970 },
] as const;

const ACCENTS: Record<Variant, string> = {
  landing: '#6ce7ff',
  services: '#70dfff',
  portfolio: '#75ffd5',
  about: '#9fd3ff',
};

function coordinate(
  latitude: number,
  longitude: number,
  radius = 1.76
) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

function NetworkPulse({
  curve,
  index,
  accent,
  reduced,
}: {
  curve: THREE.QuadraticBezierCurve3;
  index: number;
  accent: string;
  reduced: boolean;
}) {
  const pulse = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reduced || !pulse.current) return;

    const position = (
      clock.elapsedTime * 0.11 + index * 0.137
    ) % 1;

    pulse.current.position.copy(curve.getPoint(position));
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 36, 0.008, 5, false]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {!reduced && (
        <mesh
          ref={pulse}
          position={curve.getPoint(0)}
        >
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshBasicMaterial
            color="#ffffff"
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function SignalSphere({
  accent,
  reduced,
}: {
  accent: string;
  reduced: boolean;
}) {
  const globe = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 1300;
    const coords = new Float32Array(count * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < count; index++) {
      const y = 1 - (index / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = goldenAngle * index;

      coords[index * 3] =
        Math.cos(angle) * radius * 1.79;
      coords[index * 3 + 1] = y * 1.79;
      coords[index * 3 + 2] =
        Math.sin(angle) * radius * 1.79;
    }

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(coords, 3)
    );

    return geometry;
  }, []);

  const cityPoints = useMemo(
    () => CITIES.map((city) => ({
      name: city.name,
      position: coordinate(city.lat, city.lon),
    })),
    []
  );

  const connections = useMemo(() => {
    const origin = cityPoints[0].position;

    return cityPoints.slice(1).map(({ position }) => {
      const midpoint = origin.clone()
        .add(position)
        .normalize()
        .multiplyScalar(1.98);

      return new THREE.QuadraticBezierCurve3(
        origin.clone(),
        midpoint,
        position.clone()
      );
    });
  }, [cityPoints]);

  useEffect(() => {
    return () => particles.dispose();
  }, [particles]);

  useFrame(({ clock }) => {
    if (!globe.current || reduced) return;

    const t = clock.elapsedTime;

    // Keep South Africa facing the camera.
    globe.current.rotation.x =
      -0.51 + Math.sin(t * 0.18) * 0.035;

    globe.current.rotation.y =
      -0.44 + Math.sin(t * 0.13) * 0.085;

    globe.current.position.y =
      Math.sin(t * 0.4) * 0.035;
  });

  return (
    <group ref={globe} rotation={[-0.51, -0.44, 0]}>
      <mesh>
        <sphereGeometry args={[1.73, 48, 48]} />
        <meshStandardMaterial
          color="#071e30"
          metalness={0.55}
          roughness={0.6}
          transparent
          opacity={0.89}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.745, 32, 24]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={0.075}
        />
      </mesh>

      <points geometry={particles}>
        <pointsMaterial
          color={accent}
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.78}
          depthWrite={false}
        />
      </points>

      {connections.map((curve, index) => (
        <NetworkPulse
          key={CITIES[index + 1].name}
          curve={curve}
          index={index}
          accent={accent}
          reduced={reduced}
        />
      ))}

      {cityPoints.map(({ name, position }, index) => (
        <group key={name} position={position}>
          <mesh>
            <sphereGeometry
              args={[index === 0 ? 0.065 : 0.042, 14, 14]}
            />
            <meshBasicMaterial
              color={index === 0 ? '#ffffff' : accent}
              toneMapped={false}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.093, 12, 12]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function SignalGlobe({
  variant = 'landing',
}: {
  variant?: Variant;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      className={`sn-signal-globe sn-signal-globe--${variant}`}
      role="img"
      aria-label="Illustrative 3D South African digital network connecting eight cities"
    >
      <div className="sn-signal-canvas" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 6.7], fov: 43 }}
          dpr={[1, 1.5]}
          frameloop={reduced ? 'demand' : 'always'}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <ambientLight intensity={1.7} />
          <directionalLight
            position={[3, 5, 6]}
            intensity={2.7}
            color="#c7f5ff"
          />
          <pointLight
            position={[-3, -2, 4]}
            intensity={12}
            distance={10}
            color="#46d0ff"
          />

          <SignalSphere
            accent={ACCENTS[variant]}
            reduced={!!reduced}
          />
        </Canvas>
      </div>

      <div className="sn-signal-readout">
        <span>ZA / DIGITAL CONNECTIONS</span>
        <strong>ENGINEERING FROM SOUTH AFRICA</strong>
        <small>
          Illustrative network · Not real-time customer activity
        </small>
      </div>

      <div className="sn-signal-cities" aria-hidden="true">
        JHB / CPT / DBN / PTA / GQ / BFN / PLK / MBM
      </div>
    </div>
  );
}

export function SignalSection() {
  return (
    <section
      className="sn-signal-section"
      id="smartnet-south-africa"
      aria-labelledby="sn-signal-heading"
    >
      <div className="sn-signal-section-copy">
        <span>SMARTNET / ENGINEERING CONNECTIONS</span>

        <h2 id="sn-signal-heading">
          Built in South Africa.
          <br />
          <em>Engineered for possibility.</em>
        </h2>

        <p>
          Connected technology starts with people,
          thoughtful architecture and a practical
          understanding of real-world challenges.
        </p>

        <div className="sn-signal-disciplines">
          <span>SOFTWARE</span>
          <span>CLOUD</span>
          <span>EDUCATION</span>
          <span>INFRASTRUCTURE</span>
          <span>RESPONSIBLE AI</span>
        </div>
      </div>

      <SignalGlobe variant="landing" />
    </section>
  );
}
