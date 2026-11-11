import { ImageResponse } from 'next/og';

export const alt =
  'SmartNet Technologies — Software, Cloud and Digital Engineering';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(125deg, #020b13 0%, #082d43 75%, #06344c 100%)',
          color: '#e9faff',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 95,
            width: 420,
            height: 420,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #57dfff',
            borderRadius: 210,
            opacity: 0.55,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 285,
              height: 285,
              border: '2px solid #83edff',
              borderRadius: 160,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 115,
              fontWeight: 800,
              color: '#8aeaff',
              background: '#071d2e',
            }}
          >
            SN
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '70px 65px',
            width: 880,
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: '#7be7ff',
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            SMARTNET / TECHNOLOGIES
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 68,
              fontSize: 75,
              fontWeight: 750,
              letterSpacing: -3,
              lineHeight: 1.08,
            }}
          >
            <span>Engineering</span>
            <span style={{ color: '#7ae8ff' }}>
              what comes next.
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 38,
              fontSize: 23,
              color: '#b8d5e2',
            }}
          >
            Software · Cloud · DevOps · Digital Transformation
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 45,
              color: '#6fcfe9',
              fontSize: 17,
              letterSpacing: 2,
            }}
          >
            SOUTH AFRICA / HUMAN-LED ENGINEERING
          </div>
        </div>
      </div>
    ),
    size
  );
}
