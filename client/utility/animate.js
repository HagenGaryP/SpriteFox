export function animate(
  framesArray,
  getCanvas,
  fps,
  currentFrame
) {
  let len = framesArray.length;
  let interval = 0;
  let startingFrame = parseInt(currentFrame) - 1;
  for (let i = 0; i < len; i++) {
    setTimeout(() => {
      getCanvas(framesArray[i]);
    }, interval);
    interval = interval + 1000 / fps;
  }
  setTimeout(() => {
    getCanvas(framesArray[startingFrame])
  }, interval + 1);
}
