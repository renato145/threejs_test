import React from 'react';

const hoverWidth = 150;

export const HoverDescription = ({ description, top, left, size }) => {
  const showLeft = (left+hoverWidth) > size.width
    ? size.right - hoverWidth
    : Math.max(left-hoverWidth/2, size.left);

  return (
    <div
      className='hover-description'
      style={{
        top: top,
        left: showLeft,
        width: hoverWidth
      }}
    >
      {description}
    </div>);
};
