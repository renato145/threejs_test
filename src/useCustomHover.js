import React, { useMemo, useEffect, useCallback } from 'react';
import { select } from 'd3';
const THREE = require('three');

export const useCustomHover = ({
  renderer,
  mouse,
  camera,
  size,
  pointsRef,
  onPointHover,
  onPointOut
  }) => {
  const raycaster = useMemo(() => {
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 1;
    return raycaster;
  }, []);

  const checkIntersects = useCallback( position => {
    raycaster.setFromCamera(position, camera);
    let intersects = raycaster.intersectObject(pointsRef.current);
    if (intersects[0]) {
      const intersect = intersects.sort(({ distanceToRay }) => distanceToRay)[0];
      const point = intersect.point;
      point.project(camera).addScalar(1).divideScalar(2);
      const x = point.x * size.width;
      const y = (1-point.y) * size.height;
      onPointHover({ index: intersect.index, x, y });
    } else {
      onPointOut();
    }
  }, [ size, onPointHover ]);

  useEffect(() => {
    const view = select(renderer.domElement);
    view.on('mousemove', () => {
      checkIntersects(mouse);
    });
  }, [ renderer, mouse, checkIntersects ]);

};

