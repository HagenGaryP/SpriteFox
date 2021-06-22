
// export function renderSaved(savedGrid, ctx) {
//   let pixelSize = 8;

//   ctx.clearRect(0, 0, 16 * 24, 16 * 24);
//   for (let key in savedGrid) {
//     // key = id = index of row array
//     let pixelRow = savedGrid[key];
//     for (let i = 0; i < pixelRow.length; i++) {
//       if (pixelRow[i] !== null) {
//         // These are the actual coordinates to render on the grid
//         let coordinateX = i * pixelSize;
//         let coordinateY = key * pixelSize;

//         // Render each original pixel from the saved grid
//         ctx.fillStyle = pixelRow[i];
//         ctx.fillRect(coordinateX, coordinateY, pixelSize, pixelSize);
//       }
//     }
//   }
// }
