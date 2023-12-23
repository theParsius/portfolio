import React from 'react';

function Loader() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-grayscale-950 flex items-center justify-center relative">
      <span
        style={{ fontFamily: 'Permanent Marker' }}
        className="absolute text-primary-400 text-xl"
      >
        b
      </span>
      <div className="loader" />
    </div>
  );
}

export default Loader;
