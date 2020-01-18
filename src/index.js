import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree, useUpdate } from 'react-three-fiber'
import './index.css';
const THREE = require('three');
// const d3 = require('d3');

const height = 500;
const width = 800;
const fov = 30;
const near = 10;
const far = 100;
const nPoints = 100;
const randomScale = 40;
const pointsSize = 5;

const getRandomNumber = () => (Math.random()-0.5)*randomScale;

const getRandomPoints = () => {
  const positions = []
  Array(nPoints).fill().forEach(() => {
    positions.push(getRandomNumber());
    positions.push(getRandomNumber());
    positions.push(0);
  });
  return new Float32Array(positions, 3);
};

const Scene = ({ points }) => {
  const ref = useRef();
  const { scene, camera } = useThree();

  const geometryRef = useUpdate( geometry => {
    geometry.attributes.position.needsUpdate = true;
  }, [ points ]);

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
        <bufferGeometry attach='geometry' ref={geometryRef}>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={points.length / 3}
            array={points}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          </bufferGeometry>
        <pointsMaterial attach='material' size={pointsSize} color='hotpink' />
      </points>
    </mesh>
  );
};

const App = () => {
  const [ points, setPoints ] = useState(getRandomPoints());

  return (
    <div style={{width: width, height: height}}>
      <Canvas>
        <Scene points={points}/>
      </Canvas>
      <div className='button-container'>
        <button
          type='button'
          className='btn btn-primary'
          onClick={() => setPoints(getRandomPoints())}
        >
          Refresh
        </button>
      </div>
    </div>
  )
};

ReactDOM.render(<App />, document.getElementById('root'));
