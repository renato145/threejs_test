import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { useSpring } from 'react-spring-three';
import { HoverDescription } from './HoverDescription';
import { Controls } from './Controls';
import './index.css';

const THREE = require('three');
// const d3 = require('d3');

// camera settings
const fov = 30;
const near = 10;
const far = 1000;
const defaultCameraZoom = 100;
// points generation
const nPoints = 100;
const randomScale = 50;
const pointsSize = 25;
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

const Scene = ({ points, colors, pointsData, setHoverDescription }) => {
  const { scene, aspect } = useThree();
  const ref = useRef();
  const geometryRef = useRef();

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
      geometryRef.current.attributes.position.array[i] = value;
    });
    colorsSpring.getValue().forEach((v,i) => {
      geometryRef.current.attributes.color.array[i] = v;
    })
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.attributes.color.needsUpdate = true;
  });

  useEffect(() => {
    scene.background = new THREE.Color(0xefefef);
  }, [ scene ]);

  // Events
  const pointOver = ( { index, clientX, clientY } ) => {
    const { idxs } = pointsData;
    const pointColor = colors.slice(index*3, (index+1)*3).map(d => d.toFixed(2));
    setHoverDescription(HoverDescription({
    description: `mouse over: ${idxs[index]}\nColor: rgb(${pointColor})`,
      top: clientY,
      left: clientX,
    }));
  };

  const pointOut = () => {
    setHoverDescription('');
  };

  return (
    <mesh
      ref={ref}
      onPointerOver={pointOver}
      onPointerOut={pointOut}
    >
      <points>
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
  const [ hoverData, setHoverData] = useState('');
  const pointsData = useMemo(() => ({
    idxs: [...Array(nPoints).keys()].map(d => `Points #${d}`),
  }), []);

  const setHoverDescription = data => {
    setHoverData(data)
  };

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
    <div className='canvas-container'>
      <Canvas
        camera={{
          fov: fov,
          near: near,
          far: far,
          position: [0, 0, defaultCameraZoom]
        }}
      >
        <Scene
          points={points}
          colors={colors}
          pointsData={pointsData}
          setHoverDescription={setHoverDescription}
        />
        <Controls
          far={far}
          near={near}
        />
      </Canvas>
      {hoverData}
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
