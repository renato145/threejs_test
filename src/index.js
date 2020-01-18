import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree, useUpdate, useFrame } from 'react-three-fiber';
import { animated, useSpring } from 'react-spring-three';
import './index.css';
const THREE = require('three');
// const d3 = require('d3');

const height = 500;
const width = 800;
const fov = 30;
const near = 10;
const far = 100;
const nPoints = 200;
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
  return positions;
};

const Scene = ({ points }) => {
  const { scene, camera } = useThree();
  const geometryRef = useRef();

  const [ { positions }, setSpring ] = useSpring(() => ({
    // initial position
    positions: new Array(nPoints*3).fill(0)
  }));

  useEffect(() => {
    setSpring({ positions: points });
  }, [ points, setSpring ]);

  useFrame(() => {
    geometryRef.current.attributes.position.array = new Float32Array(positions.getValue(), 3);
    geometryRef.current.attributes.position.needsUpdate = true;
  });

  camera.fov = fov;
  camera.aspect = width / height;
  camera.near = near;
  camera.far = far;
  camera.position.set(0, 0, far);
  camera.updateProjectionMatrix();
  scene.background = new THREE.Color(0xefefef);

  return (
    <mesh>
      <animated.points >
        <bufferGeometry attach='geometry' ref={geometryRef} >
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={points.length / 3}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          </bufferGeometry>
        <pointsMaterial attach='material' size={pointsSize} color='hotpink' />
      </animated.points>
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
