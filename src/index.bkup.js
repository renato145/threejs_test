import 'bootstrap/dist/css/bootstrap.css';
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useFrame } from 'react-three-fiber'
import './index.css';
// const d3 = require('d3');

// const width = 960;
// const height = 500;
// const margin = { top: 20, right: 30, bottom: 65, left: 90 };
// const xAxisLabelOffset = 50;
// const yAxisLabelOffset = 45;

const Thing = () => {
  const ref = useRef();
  useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01));
  return (
    <mesh
      ref={ref}
      onClick={e => console.log('click')}
      onPointerOver={e => console.log('hover')}
      onPointerOut={e => console.log('unhover')}
    >
      <boxBufferGeometry attach='geometry' args={[2,2,2]} />
      <meshNormalMaterial attach='material' />
    </mesh>
  );
};

const App = () => {
  return (
    <div>
      <p>Testing :)</p>
      <Canvas
      >
        <Thing />
      </Canvas>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
