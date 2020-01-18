import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree,  useFrame } from 'react-three-fiber';
import { animated, useSpring } from 'react-spring-three';
import './index.css';
const THREE = require('three');
// const d3 = require('d3');

const height = 500;
const width = 800;
const fov = 30;
const near = 10;
const far = 100;
const nPoints = 30;
const randomScale = 40;
const pointsSize = 10;
const colors = ['hotpink', 'skyblue', 'indianred', 'forestgreen', 'thistle'];

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
  const [ colorIdx, setColorIdx ] = useState(0);
  const [ firstRender, setFirstRender ] = useState(true);

  const positionsArray = useMemo(() => new Float32Array(nPoints*3), []);

  const [ { positions }, setSpring ] = useSpring(() => ({
    // initial position
    positions: new Array(nPoints*3).fill(0)
  }));

  const colorProps = useSpring({
    'color': colors[colorIdx]
  });

  useEffect(() => {
    setSpring({ positions: points });
    setFirstRender(isFirstRender => {
      if (!isFirstRender)
        setColorIdx(d => (d+1) % colors.length);
      return false;
    });
  }, [ points, setSpring ]);

  useFrame(() => {
    positions.getValue().forEach((v,i) => {
      geometryRef.current.attributes.position.array[i] = v;
    });
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
      <points>
        <bufferGeometry attach='geometry' ref={geometryRef} >
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={points.length / 3}
            array={positionsArray}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          </bufferGeometry>
        <animated.pointsMaterial
          attach='material'
          size={pointsSize}
          {...colorProps}
        />
      </points>
    </mesh>
  );
};

const App = () => {
  const ref = useRef();
  const [ points, setPoints ] = useState(getRandomPoints());
  useEffect(() => {
    console.log(ref.current.clientWidth);
  });

  return (
    <div ref={ref} style={{width: width, height: height}}>
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
