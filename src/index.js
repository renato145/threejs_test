import React, { useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useThree } from 'react-three-fiber'
import './index.css';
const THREE = require('three');
const d3 = require('d3');

const height = 500;
const width = 800;
const fov = 30;
const near = 10;
const far = 100;
const nPoints = 100;

const Points = () => {
  const ref = useRef();
  const { scene, camera } = useThree();
  const points = useMemo(() => {
    const positions = d3.range(nPoints).map(() => ({
      x: (Math.random()-0.5)*100,
      y: (Math.random()-0.5)*100,
    }));
    const pointsGeometry = new THREE.Geometry();
    const colors = [];
    positions.forEach(({ x, y }) => {
      const vertex = new THREE.Vector3(x, y, 0);
      pointsGeometry.vertices.push(vertex);
      const color = new THREE.Color('hotpink');
      colors.push(color);
    });
    pointsGeometry.colors = colors;
    const pointsMaterial = new THREE.PointsMaterial({
      size: 8,
      sizeAttenuation: false,
      vertexColors: THREE.VertexColors,
    });
    // TODO: Sprite settings

    return new THREE.Points(pointsGeometry, pointsMaterial);
  }, []);

  camera.fov = fov;
  camera.aspect = width / height;
  camera.near = near;
  camera.far = far;
  camera.position.set(0, 0, far);
  scene.background = new THREE.Color(0xefefef);
  scene.add(points);

  return (
    <mesh
      ref={ref}
    >
    </mesh>
  );
};

// const Thing = () => {
//   const ref = useRef();
//   useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01));
//   return (
//     <mesh
//       ref={ref}
//       onClick={e => console.log('click')}
//       onPointerOver={e => console.log('hover')}
//       onPointerOut={e => console.log('unhover')}
//     >
//       <boxBufferGeometry attach='geometry' args={[2,2,2]} />
//       <meshNormalMaterial attach='material' />
//     </mesh>
//   );
// };

const App = () => {
  return (
    <div style={{width: width, height: height}}>
      <p>Testing :)</p>
      <Canvas>
        <Points />
      </Canvas>
    </div>
  )
};

ReactDOM.render(<App />, document.getElementById('root'));
