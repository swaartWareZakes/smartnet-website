'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

import {
  SA_BUSINESS_HUBS,
  type BusinessHub,
} from '@/lib/sa-business-hubs';

type Variant = 'landing' | 'services' | 'portfolio' | 'about';

// Simplified Natural Earth country outline.
// Coordinates are [longitude, latitude].
const SA_BORDER: [number, number][] = [
  [16.344977,-28.576705],
  [16.824017,-28.082162],
  [17.836152,-28.856378],
  [19.002127,-28.972443],
  [19.894734,-28.461105],
  [19.895768,-24.76779],
  [20.758609,-25.868136],
  [20.889609,-26.828543],
  [21.605896,-26.726534],
  [22.579532,-25.979448],
  [23.312097,-25.26869],
  [24.211267,-25.670216],
  [25.664666,-25.486816],
  [26.485753,-24.616327],
  [27.11941,-23.574323],
  [28.017236,-22.827754],
  [29.432188,-22.091313],
  [30.659865,-22.151567],
  [31.191409,-22.25151],
  [31.670398,-23.658969],
  [31.930589,-24.369417],
  [31.752408,-25.484284],
  [31.333158,-25.660191],
  [30.949667,-26.022649],
  [30.676609,-26.398078],
  [31.282773,-27.285879],
  [31.86806,-27.177927],
  [32.83012,-26.742192],
  [32.462133,-28.301011],
  [31.521001,-29.257387],
  [30.622813,-30.423776],
  [30.055716,-31.140269],
  [28.925553,-32.172041],
  [27.464608,-33.226964],
  [26.419452,-33.61495],
  [25.780628,-33.944646],
  [24.677853,-33.987176],
  [23.594043,-33.794474],
  [22.574157,-33.864083],
  [21.542799,-34.258839],
  [20.071261,-34.795137],
  [19.616405,-34.819166],
  [19.193278,-34.462599],
  [18.424643,-33.997873],
  [18.244499,-33.867752],
  [18.25008,-33.281431],
  [17.92519,-32.611291],
  [18.24791,-32.429131],
  [18.221762,-31.661633],
  [17.566918,-30.725721],
  [17.064416,-29.878641],
  [16.344977,-28.576705],
];

const LESOTHO: [number, number][] = [
  [28.978263,-28.955597],
  [28.5417,-28.647502],
  [28.074338,-28.851469],
  [27.532511,-29.242711],
  [26.999262,-29.875954],
  [27.749397,-30.645106],
  [28.107205,-30.545732],
  [28.8484,-30.070051],
  [29.325166,-29.257387],
  [28.978263,-28.955597],
];

function geo(lat: number, lon: number, radius = 1.79) {
  const a = THREE.MathUtils.degToRad(lat);
  const b = THREE.MathUtils.degToRad(lon);

  return new THREE.Vector3(
    radius * Math.cos(a) * Math.sin(b),
    radius * Math.sin(a),
    radius * Math.cos(a) * Math.cos(b)
  );
}

function markerPosition(hub: BusinessHub) {
  const p = geo(hub.latitude, hub.longitude, 1.85);

  // Visually separate offices within the same metro.
  p.x += hub.offsetX;
  p.y += hub.offsetY;

  return p.normalize().multiplyScalar(1.85);
}

function GlobeScene({
  selected,
  onSelect,
  reduced,
}: {
  selected: string | null;
  onSelect: (hub: BusinessHub) => void;
  reduced: boolean;
}) {
  const globe = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape(
      SA_BORDER.map(([lon, lat]) => new THREE.Vector2(lon, lat))
    );

    shape.holes.push(
      new THREE.Path(
        LESOTHO.map(([lon, lat]) => new THREE.Vector2(lon, lat))
      )
    );

    const fill = new THREE.ShapeGeometry(shape, 2);
    const attr = fill.getAttribute('position') as THREE.BufferAttribute;

    for (let i = 0; i < attr.count; i++) {
      const v = geo(attr.getY(i), attr.getX(i), 1.758);
      attr.setXYZ(i, v.x, v.y, v.z);
    }

    fill.computeVertexNormals();

    const border = new THREE.BufferGeometry().setFromPoints(
      SA_BORDER.map(([lon, lat]) => geo(lat, lon, 1.78))
    );

    const hole = new THREE.BufferGeometry().setFromPoints(
      LESOTHO.map(([lon, lat]) => geo(lat, lon, 1.78))
    );

    const cloud = new THREE.BufferGeometry();
    const count = 1150;
    const points = new Float32Array(count * 3);
    const angle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - i / (count - 1) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = angle * i;

      points[i * 3] = Math.cos(theta) * radius * 1.79;
      points[i * 3 + 1] = y * 1.79;
      points[i * 3 + 2] = Math.sin(theta) * radius * 1.79;
    }

    cloud.setAttribute(
      'position',
      new THREE.BufferAttribute(points, 3)
    );

    return { fill, border, hole, cloud };
  }, []);

  const links = useMemo(() => {
    const origin = geo(-26.2041, 28.0473, 1.82);

    const destinations = [
      [-33.9249,18.4241],
      [-33.9346,18.8668],
      [-29.7276,31.0855],
      [-25.7479,28.2293],
      [-33.9608,25.6022],
    ];

    return destinations.map(([lat, lon]) => {
      const destination = geo(lat, lon, 1.82);
      const midpoint = origin.clone()
        .add(destination)
        .normalize()
        .multiplyScalar(2.03);

      return new THREE.QuadraticBezierCurve3(
        origin.clone(),
        midpoint,
        destination
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometry).forEach((item) => item.dispose());
    };
  }, [geometry]);

  useFrame(({ clock }) => {
    if (reduced || !globe.current) return;

    const t = clock.elapsedTime;

    globe.current.rotation.y =
      -0.44 + Math.sin(t * 0.16) * 0.035;

    globe.current.rotation.x =
      -0.51 + Math.sin(t * 0.12) * 0.025;

    globe.current.position.y = Math.sin(t * 0.45) * 0.035;
  });

  return (
    <group ref={globe} rotation={[-0.51, -0.44, 0]}>
      <mesh>
        <sphereGeometry args={[1.73, 44, 32]} />
        <meshStandardMaterial
          color="#061d31"
          metalness={0.54}
          roughness={0.58}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.742, 26, 20]} />
        <meshBasicMaterial
          color="#4ccbeb"
          wireframe
          transparent
          opacity={0.065}
          depthWrite={false}
        />
      </mesh>

      <points geometry={geometry.cloud}>
        <pointsMaterial
          color="#74dcfb"
          size={0.014}
          sizeAttenuation
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </points>

      {/* South Africa land area */}
      <mesh geometry={geometry.fill}>
        <meshBasicMaterial
          color="#17a5b4"
          side={THREE.DoubleSide}
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </mesh>

      <lineLoop geometry={geometry.border}>
        <lineBasicMaterial
          color="#a1f6ff"
          transparent
          opacity={0.98}
        />
      </lineLoop>

      <lineLoop geometry={geometry.hole}>
        <lineBasicMaterial color="#83bbcb" />
      </lineLoop>

      {links.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 30, 0.006, 5, false]} />
          <meshBasicMaterial
            color="#65dfff"
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>
      ))}

      {SA_BUSINESS_HUBS.map((hub) => {
        const active = selected === hub.id;

        return (
          <group key={hub.id} position={markerPosition(hub)}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onSelect(hub);
              }}
            >
              <sphereGeometry args={[0.065, 14, 14]} />
              <meshBasicMaterial
                color={active ? '#ffffff' : '#ffbc74'}
                toneMapped={false}
              />
            </mesh>

            <mesh>
              <sphereGeometry
                args={[active ? 0.13 : 0.095, 12, 12]}
              />
              <meshBasicMaterial
                color={active ? '#b2f9ff' : '#ffbc74'}
                transparent
                opacity={0.22}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function SignalGlobe({
  variant = 'landing',
}: {
  variant?: Variant;
}) {
  const reduced = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const selected = SA_BUSINESS_HUBS.find(
    (hub) => hub.id === selectedId
  );

  const results = SA_BUSINESS_HUBS.filter((hub) =>
    `${hub.name} ${hub.city}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className={`sn-signal-globe sn-signal-globe--${variant}`}>
      <div
        className="sn-signal-canvas"
        aria-label="Three-dimensional globe highlighting South Africa and featured banking offices"
      >
        <Canvas
          camera={{ position: [0, 0, 6.8], fov: 43 }}
          dpr={[1, 1.5]}
          frameloop={reduced ? 'demand' : 'always'}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[3, 5, 6]}
            intensity={2.6}
            color="#b9f0ff"
          />
          <pointLight
            position={[-3, -2, 4]}
            intensity={8}
            distance={10}
            color="#3ebaff"
          />

          <GlobeScene
            selected={selectedId}
            onSelect={(hub) => setSelectedId(hub.id)}
            reduced={!!reduced}
          />
        </Canvas>
      </div>

      <div className="sn-signal-readout">
        <span>SOUTH AFRICA / BUSINESS NETWORK</span>
        <strong>FEATURED FINANCIAL HUBS</strong>
        <small>Curated public office directory</small>
      </div>

      {variant === 'landing' && (
        <div className="sn-hubs-panel">
          <div className="sn-hubs-top">
            <strong>ZA / BUSINESS RADAR</strong>
            <span>{SA_BUSINESS_HUBS.length} LOCATIONS</span>
          </div>

          <input
            type="search"
            aria-label="Search featured business hubs"
            placeholder="Search bank or city..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="sn-hubs-list">
            {results.map((hub) => (
              <button
                type="button"
                key={hub.id}
                className={
                  selectedId === hub.id ? 'is-selected' : ''
                }
                onClick={() => setSelectedId(hub.id)}
              >
                <span>{hub.name}</span>
                <small>{hub.city}</small>
              </button>
            ))}

            {results.length === 0 && (
              <p>No matching featured offices.</p>
            )}
          </div>

          {selected && (
            <div className="sn-hubs-detail">
              <strong>{selected.name}</strong>
              <p>{selected.address}, South Africa</p>
              <div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    encodeURIComponent(selected.address + ', South Africa')
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View address on map ↗
                </a>
                <a
                  href={selected.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official source ↗
                </a>
              </div>
            </div>
          )}

          <small>
            Approximate metro markers. Addresses sourced from
            published company information. These are not
            SmartNet client references.
          </small>
        </div>
      )}
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
        <span>SMARTNET / SOUTH AFRICAN CONNECTIONS</span>

        <h2 id="sn-signal-heading">
          Built in South Africa.
          <em> Connected to opportunity.</em>
        </h2>

        <p>
          Explore a curated view of major South African
          financial-services offices and their locations.
          A demonstration of connected geographic data
          and interactive technology.
        </p>

        <div className="sn-signal-disciplines">
          <span>GEOSPATIAL DATA</span>
          <span>SOFTWARE</span>
          <span>FINANCIAL TECHNOLOGY</span>
          <span>INTEGRATION</span>
        </div>
      </div>

      <SignalGlobe variant="landing" />
    </section>
  );
}
