import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'TTYT Liên Chiểu';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        <img
          src="http://localhost:5000/logo.png"
          alt="Logo"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
