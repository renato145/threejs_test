// From https://observablehq.com/@grantcuster/using-three-js-for-2d-data-visualization
import { zoom, event, select, zoomIdentity } from 'd3';

const toRadians = angle => (angle * (Math.PI/180));

export const d3Controls = ({ fov, near, far, defaultCameraZoom, renderer, camera, size }) => {
  const { width, height } = size;

  const zoomHandler = ({ x, y, k }) => {
    camera.position.set(
      -(x -  width/2) / k, // x
       (y - height/2) / k, // y
       getZFromScale(k)    // z
    )
  };

  const getScaleFromZ = z => ( height / (2 * z * Math.tan(toRadians(fov/2))) );
  const getZFromScale = scale => ( height / scale / (2 * Math.tan(toRadians(fov/2))) );

  const threeZoom = zoom()
    .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
    .on('zoom', () => {
      zoomHandler(event.transform);
    });
  
  // Add zoom listener
  const view = select(renderer.domElement);
  view.call(threeZoom);
  const initialScale = getScaleFromZ(defaultCameraZoom);
  const initialTransform = zoomIdentity
    .translate(width/2, height/2)
    .scale(initialScale);    
  threeZoom.transform(view, initialTransform);
  camera.position.set(0, 0, defaultCameraZoom);

  // Double click resets camera
  view.on('dblclick.zoom', () => {
    threeZoom.transform(view, initialTransform);
    camera.position.set(0, 0, defaultCameraZoom);
  });
};
