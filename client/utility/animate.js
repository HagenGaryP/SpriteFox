export function animate(framesArray, getCanvas, fps) {
  let len = framesArray.length;
  let interval = 0;
  for (let i = 0; i < len; i++) {
    setTimeout(() => {
      getCanvas(framesArray[i]);
    }, interval);

    interval = interval + 1000 / fps;
  }
}
