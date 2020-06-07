// import

function fillPixel(
  defaultX,
  defaultY,
  color,
  pixelSize,
  factor,
) {
  console.log('fillpixel, color >>>', color)
  console.log('fillpixel, mappedGrid >>>', mappedGrid)
  //need to add a color value to the parameters
  const canvasRect = canvas.getBoundingClientRect();

  // These are not the actual coordinates but correspond to the place on the grid
  let x =
    defaultX ?? Math.floor((window.event.clientX - canvasRect.x) / pixelSize);
  let y =
    defaultY ?? Math.floor((window.event.clientY - canvasRect.y) / pixelSize);

  // MAP color to proper place on mappedGrid
  for (let i = 0; i < factor; i++) {
    for (let j = 0; j < factor; j++) {
      mappedGrid[y * factor + i][x * factor + j] = color;
    }
  }
  if (defaultX === undefined && defaultY === undefined) {
    socket.emit('fill', x, y, color, pixelSize, factor);
  }

  // These are the actual coordinates to properly place the pixel
  let actualCoordinatesX = x * pixelSize;
  let actualCoordinatesY = y * pixelSize;

  ctx.fillStyle = color;

  ctx.fillRect(
    actualCoordinatesX,
    actualCoordinatesY,
    pixelSize,
    pixelSize
  );

  localStorage.setItem(
    `${currentFrame}`,
    JSON.stringify(mappedGrid)
  );
}

export default fillPixel;
