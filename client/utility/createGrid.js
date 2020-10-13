// ---------- CREATE GRID ----------- //

export function createGrid(ctx, pixelSize, mappedGrid) {
  let y = 0;
  let rows = 48;
  for (let i = 0; i < rows; i++) {
    let x = 0;
    let array = [];
    for (let j = 0; j < rows; j++) {
      array.push(null);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(x, y, pixelSize, pixelSize);
      x += pixelSize;
    }

    // Add each array to the mappedGrid
    mappedGrid[i] = array;
    y += pixelSize;
  }
}
