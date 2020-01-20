import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree,  useFrame } from 'react-three-fiber';
import { animated, useSpring } from 'react-spring-three';
import './index.css';
const THREE = require('three');
// const d3 = require('d3');

// camera settings
const fov = 30;
const near = 10;
const far = 100;
// points generation
const nPoints = 100;
const randomScale = 50;
const pointsSize = 25;
const colors = ['hotpink', 'skyblue', 'indianred', 'forestgreen', 'thistle'];
const sprite = new THREE.TextureLoader().load('textures/discNoShadow.png')

const getRandomNumber = () => (Math.random()-0.5)*randomScale;

const getRandomPoints = () => {
  let positions = []
  Array(nPoints).fill().forEach(() => {
    positions.push(getRandomNumber(), getRandomNumber(), 0);
  });
  return positions;
};

const getRandomColor = () => new THREE.Color(colors[parseInt(Math.random() * colors.length)]);
const getRandomColors = () => {
  let colors = []
  Array(nPoints).fill().forEach(() => {
    const {r,g,b} = getRandomColor();
    colors.push(r,g,b);
  });
  return colors;
};
console.log(getRandomColors());
const getRandomColorsArray = () => Array(nPoints).fill().map(() => getRandomColor());

const Scene = ({ points, colors }) => {
  const { scene, camera, aspect } = useThree();
  const geometryRef = useRef();
  // const [ colorIdx, setColorIdx ] = useState(0);
  // const [ firstRender, setFirstRender ] = useState(true);

  // Set up position array
  const positionsArray = useMemo(() => new Float32Array(nPoints*3), []);
  const [ { positions }, setSpring ] = useSpring(() => ({
    // initial position
    positions: new Array(nPoints*3).fill(0)
  }));

  // Initialize colors
  const colorsArray = useMemo(() => new Float32Array(nPoints*3), []);
  const ccc = useMemo(() => {
    return new THREE.BufferAttribute( colorsArray, 3, true)
  }, [ colors ]);

  // const colorsArray = useMemo(() => { 
  //   const temp = colors.map(color => new THREE.Color(color));
  //   const t =  new THREE.BufferAttribute().copyColorsArray(temp);
  //   console.log(temp);
  //   return temp;
  // }, [ colors ]);

  // console.log(colorsArray);
  // const colorProps = useSpring({
  //   'color': colors[colorIdx]
  // });

  useEffect(() => {
    setSpring({ positions: points });
    console.log(geometryRef.current);
  }, [ points, setSpring ]);

  useEffect(() => {
    colors.forEach((v,i) => {
      geometryRef.current.attributes.color.array[i] = v;
    });
    geometryRef.current.attributes.color.needsUpdate = true;
  }, [ colors ]);

  // Animate point change
  useFrame(() => {
    positions.getValue().forEach((v,i) => {
      const value = (i%3) === 0 ? v*aspect : v; // consider aspect
      geometryRef.current.attributes.position.array[i] = value;
    });
    geometryRef.current.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    camera.fov = fov;
    camera.near = near;
    camera.far = far;
    camera.position.set(0, 0, far);
    camera.updateProjectionMatrix();
    scene.background = new THREE.Color(0xefefef);
  }, [ scene, camera ]);

  return (
    <mesh>
      <points>
        <bufferGeometry
          attach='geometry'
          ref={geometryRef}
          // attributes-color={ccc}
        >
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={points.length / 3}
            array={positionsArray}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          <bufferAttribute
            attachObject={['attributes', 'color']}
            count={points.length / 3}
            array={colorsArray}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
            // normalized={true}
          />
        </bufferGeometry>
        <pointsMaterial
          attach='material'
          size={pointsSize}
          map={sprite}
          transparent={true}
          alphaTest={0.5}
          sizeAttenuation={false}
          vertexColor={THREE.VertexColors}
        />
      </points>
    </mesh>
  );
};

const App = () => {
  const [ points, setPoints ] = useState(getRandomPoints());
  const [ colors, setColors ] = useState(getRandomColors());
  return (
    <div className='canvas-container'>
      <Canvas>
        <Scene
          points={points}
          colors={colors}
        />
      </Canvas>
      <div className='button-container'>
        <button
          type='button'
          className='btn btn-primary'
          onClick={() => setColors(getRandomColors())}
        >
          Change colors
        </button>
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
