import React from 'react';

const hoverWidth = 150;

export const HoverDescription = ({ description, top, left }) => {
  const showLeft = Math.max(left-hoverWidth/2, 0);
  return (
  <div
    className='hover-description'
    style={{top: top, left: showLeft, width: hoverWidth}}
  >
    {description}
  </div>);
};
