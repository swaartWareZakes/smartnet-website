import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#061825',
          border: '5px solid #63e3ff',
          borderRadius: 34,
          color: '#e9faff',
          fontSize: 85,
          fontWeight: 800,
        }}
      >
        SN
      </div>
    ),
    size
  );
}
