import React, { useRef, useEffect } from 'react';
import { useThree, extend } from 'react-three-fiber';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
extend({ MapControls });

export const Controls = ({ far, near }) => {
  const ref = useRef();
  const { camera, gl } = useThree();

  // Reset camera on double click
  const resetCamera = () => {
    ref.current.reset();
  };

  useEffect(() => {
    const domElement = ref.current.domElement;
    domElement.addEventListener('dblclick', resetCamera);
    return () => domElement.removeEventListener('resize', resetCamera);
  }, [] );

  return (
    <mapControls
      ref={ref}
      args={[camera, gl.domElement]}
      screenSpacePanning={true}
      minDistance={near}
      maxDistance={far}
    />
  );
};
