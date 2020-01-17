import React from 'react';
// import { Canvas, useFrame } from 'react-three-fiber'

const fov = 30;
const near = 10;
const far = 100;

export const PointsCamera = ( height, width ) => {
  const aspectRatio = width / height;
  console.log('camera');
  return (
    <perspectiveCamera
      attach='camera'
      fov={fov}
      aspect={aspectRatio}
      near={near}
      far={far}
    />
  );
};
