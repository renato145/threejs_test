import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { useSpring } from 'react-spring-three';
import { HoverDescription } from './HoverDescription';
import { d3Controls } from './d3Controls';
import { useCustomHover } from './useCustomHover';
import './index.css';
const THREE = require('three');
// const d3 = require('d3');

// camera settings
const fov = 30;
const near = 20;
const far = 150;
const defaultCameraZoom = 100;
// canvas settings
const backgroundColor = new THREE.Color(0xefefef);
// points generation
const nPoints = 100;
const randomScale = 50;
const pointsSize = 15;
const highlightPointSize = 40;
const colors = ['#ffd700', '#ffb14e', '#fa8775', '#ea5f94', '#cd34b5', '#9d02d7', '#0000ff'];
const sprite = new THREE.TextureLoader().load('textures/discNoShadow.png');

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

const Scene = ({ points, colors, pointsData, setHoverData }) => {
  const { scene, aspect, gl, camera, size, mouse } = useThree();
  const ref = useRef();
  const pointsRef = useRef();
  const geometryRef = useRef();

  // d3 controls (zoom and pan)
  useEffect(() => {
    d3Controls({ fov, near, far, defaultCameraZoom, renderer: gl, camera, size});
  }, [ gl, camera, size ])

  // Custom hover
  const highlightRef = useRef();
  const highlightPoint = useMemo(() => ({
    point: new Float32Array(3),
    color: new Float32Array(3),
    show: false,
  }), []);

  const onPointHover = useCallback(( { index, x, y } ) => {
    // Highlight Point
    positionsArray.slice(index*3,(index+1)*3).forEach( (d, i) => {highlightPoint.point[i] = d});
    colorsArray.slice(index*3,(index+1)*3).forEach( (d, i) => {highlightPoint.color[i] = d});
    highlightPoint.show = true;
    const { idxs } = pointsData;
    highlightRef.current.attributes.position.needsUpdate = true;
    highlightRef.current.attributes.color.needsUpdate = true;

    // hover description
    const pointColor = colors.slice(index*3, (index+1)*3).map(d => d.toFixed(2));
    setHoverData(HoverDescription({
      description: `mouse over: ${idxs[index]}\nColor: rgb(${pointColor})`,
      top: y,
      left: x,
      size
    }));
  }, [ points, size ]);

  const onPointOut = () => {
    highlightPoint.show = false;
    setHoverData('');
  };

  useCustomHover({ renderer: gl, mouse, camera, size, pointsRef, onPointHover, onPointOut });

  // Initialize arrays
  const positionsArray = useMemo(() => new Float32Array(nPoints*3), []);
  const colorsArray = useMemo(() => new Float32Array(nPoints*3), []);

  // Initialize springs
  const [ { pointsSpring, colorsSpring }, setSpring ] = useSpring(() => ({
    // initial position
    pointsSpring: points,
    colorsSpring: Array(nPoints*3).fill(1),
  }));

  // Animation effects
  useEffect(() => {
    setSpring({ pointsSpring: points });
  }, [ points, setSpring ]);

  useEffect(() => {
    setSpring({ colorsSpring: colors });
  }, [ colors, setSpring ]);

  // Animate point change
  useFrame(() => {
    pointsSpring.getValue().forEach((v,i) => {
      const value = (i%3) === 0 ? v*aspect : v; // consider aspect
      positionsArray[i] = value;
    });
    colorsSpring.getValue().forEach((v,i) => {
      colorsArray[i] = v;
    })
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.attributes.color.needsUpdate = true;
  });

  useEffect(() => {
    scene.background = backgroundColor;
  }, [ scene ]);

  return (
    <group>

      <mesh ref={ref}>
        <points ref={pointsRef}>
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

      <mesh>
        <points>
          <bufferGeometry
            attach='geometry'
            ref={highlightRef}
          >
            <bufferAttribute
              attachObject={['attributes', 'position']}
              count={highlightPoint.show}
              array={highlightPoint.point}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            /> 
            <bufferAttribute
              attachObject={['attributes', 'color']}
              count={1}
              array={highlightPoint.color}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            attach='material'
            size={highlightPointSize}
            map={sprite}
            transparent={true}
            alphaTest={0.5}
            sizeAttenuation={false}
            vertexColors={THREE.VertexColors}
          />
        </points>
      </mesh>

    </group>

  );
};

const App = () => {
  const [ points, setPoints ] = useState(getRandomPoints());
  const [ colors, setColors ] = useState(getRandomColors());
  const [ animatePoints, setAnimatePoints ] = useState(false);
  const [ animateColors, setAnimateColors ] = useState(false);
  const [ toogleColorsClass, setToogleColorsClass ] = useState('light');
  const [ tooglePointsClass, setTooglePointsClass ] = useState('light');
  const [ hoverData, setHoverData] = useState('');
  const pointsData = useMemo(() => ({
    idxs: [...Array(nPoints).keys()].map(d => `Points #${d}`),
  }), []);

  // toogle functions
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
    <div style={{height: '100%'}}>
      <div className='canvas-container h-100'>
        <Canvas
          camera={{
            fov: fov,
            near: 0.1,
            far: far+1,
            position: [0, 0, defaultCameraZoom]
          }}
        >
          <Scene
            points={points}
            colors={colors}
            pointsData={pointsData}
            setHoverData={setHoverData}
          />
        </Canvas>
        {hoverData}
        <div className='row'>
          <div className='git-info col'>
            <a href='https://github.com/renato145/threejs_test'>Source code</a>
          </div>
          <div className='button-container col'>
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
      </div>
    </div>
  )
};

ReactDOM.render(<App />, document.getElementById('root'));
