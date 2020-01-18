import React, { useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree } from 'react-three-fiber'
import './index.css';
const THREE = require('three');
// const d3 = require('d3');

const height = 500;
const width = 800;
const fov = 30;
const near = 10;
const far = 100;
const maxPoints = 5000;
const nPoints = 100;
const randomScale = 40;
const pointsSize = 5;

const getRandomNumber = () => (Math.random()-0.5)*randomScale;

const Scene = () => {
  const ref = useRef();
  const { scene, camera } = useThree();

  const points = useMemo(() => { 
    const positions = []
    Array(nPoints).fill().forEach(() => {
      positions.push(getRandomNumber());
      positions.push(getRandomNumber());
      positions.push(0);
    });

    return new Float32Array(positions, 3)
  }, []);

  // {
  //   const positions = d3.range(nPoints).map(() => ({
  //     x: (Math.random()-0.5)*40,
  //     y: (Math.random()-0.5)*40,
  //   }));
  //   const pointsGeometry = new THREE.Geometry();
  //   const colors = [];
  //   positions.forEach(({ x, y }) => {
  //     const vertex = new THREE.Vector3(x, y, 0);
  //     pointsGeometry.vertices.push(vertex);
  //     const color = new THREE.Color('hotpink');
  //     colors.push(color);
  //   });
  //   pointsGeometry.colors = colors;
  //   const pointsMaterial = new THREE.PointsMaterial({
  //     size: 8,
  //     sizeAttenuation: false,
  //     vertexColors: THREE.VertexColors,
  //   });
  //   // TODO: Sprite settings

  //   return new THREE.Points(pointsGeometry, pointsMaterial);
  // }, []);

  camera.fov = fov;
  camera.aspect = width / height;
  camera.near = near;
  camera.far = far;
  camera.position.set(0, 0, far);
  camera.updateProjectionMatrix();
  scene.background = new THREE.Color(0xefefef);

  return (
    <mesh
      ref={ref}
    >
      <points>
        <bufferGeometry attach='geometry' >
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={points.length / 3}
            array={points}
            itemSize={3}
          />
          </bufferGeometry>
        <pointsMaterial attach='material' size={pointsSize} color='hotpink' />
      </points>
    </mesh>
  );
};

const App = () => {
  return (
    <div style={{width: width, height: height}}>
      <p>Testing :)</p>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  )
};

ReactDOM.render(<App />, document.getElementById('root'));
