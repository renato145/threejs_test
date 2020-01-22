import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree,  useFrame } from 'react-three-fiber';
import { useSpring } from 'react-spring-three';
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
const colors = ['mediumslateblue', 'indianred', 'darkseagreen'];
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

const Scene = ({ points, colors }) => {
  const { scene, camera, aspect } = useThree();
  const ref = useRef();
  const geometryRef = useRef();

  // Initialize arrays
  const positionsArray = useMemo(() => new Float32Array(nPoints*3), []);
  const colorsArray = useMemo(() => new Float32Array(nPoints*3), []);

  // Initialize springs
  const [ { pointsSpring, colorsSpring }, setSpring ] = useSpring(() => ({
    // initial position
    pointsSpring: new Array(nPoints*3).fill(0),
    colorsSpring: new Array(nPoints*3).fill(1)
  }));

  // Animation effects
  useEffect(() => {
    setSpring({ pointsSpring: points });
    console.log(ref.current);
  }, [ points, setSpring ]);

  useEffect(() => {
    setSpring({ colorsSpring: colors });
  }, [ colors, setSpring ]);

  // Animate point change
  useFrame(() => {
    pointsSpring.getValue().forEach((v,i) => {
      const value = (i%3) === 0 ? v*aspect : v; // consider aspect
      geometryRef.current.attributes.position.array[i] = value;
    });
    colorsSpring.getValue().forEach((v,i) => {
      geometryRef.current.attributes.color.array[i] = v;
    })
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.attributes.color.needsUpdate = true;
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
    <mesh
      ref={ref}
      onPointerUp={e => console.log('up')}
      onPointerDown={e => console.log('down')}
      onPointerOver={e => console.log('over')}
      onPointerOut={e => console.log('out')}
      onPointerEnter={e => console.log('enter')}
      onPointerLeave={e => console.log('leave')}
      onPointerMove={e => console.log('move')}
    >
      <points
      >
        <bufferGeometry
          attach='geometry'
          ref={geometryRef}
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
          />
        </bufferGeometry>
        <pointsMaterial
          attach='material'
          size={pointsSize}
          map={sprite}
          transparent={true}
          alphaTest={0.5}
          sizeAttenuation={false}
          vertexColors={THREE.VertexColors}
        />
      </points>
    </mesh>
  );
};

const App = () => {
  const [ points, setPoints ] = useState(getRandomPoints());
  const [ colors, setColors ] = useState(getRandomColors());
  const [ animatePoints, setAnimatePoints ] = useState(false);
  const [ animateColors, setAnimateColors ] = useState(false);
  const [ toogleColorsClass, setToogleColorsClass ] = useState('light');
  const [ tooglePointsClass, setTooglePointsClass ] = useState('light');

  const tooglePoints = () => {
    if ( !animatePoints ) {
      const interval = window.setInterval(() => setPoints(getRandomPoints()), 1000);
      setAnimatePoints(interval);
      setTooglePointsClass('dark');
    } else {
      clearInterval(animatePoints);
      setAnimatePoints(false);
      setTooglePointsClass('light');
    }
  };

  const toogleColors = () => {
    if ( !animateColors ) {
      const interval = window.setInterval(() => setColors(getRandomColors()), 1000);
      setAnimateColors(interval);
      setToogleColorsClass('dark');
    } else {
      clearInterval(animateColors);
      setAnimateColors(false);
      setToogleColorsClass('light');
    }
  };

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
          className='btn btn-light'
          onClick={() => setColors(getRandomColors())}
        >
          Change colors
        </button>
        <button
          type='button'
          className={`btn btn-${toogleColorsClass}`}
          onClick={() => toogleColors()}
        >
          Toogle colors
        </button>
        <button
          type='button'
          className='btn btn-light'
          onClick={() => setPoints(getRandomPoints())}
        >
          Refresh
        </button>
        <button
          type='button'
          className={`btn btn-${tooglePointsClass}`}
          onClick={() => tooglePoints()}
        >
          Toogle Refresh
        </button>
      </div>
    </div>
  )
};

ReactDOM.render(<App />, document.getElementById('root'));
