// --------- GET FRAMES--------- //
export function getFrames(framesArray, initialFrames = []) {

  for (let key in localStorage) {
    if (key !== 'currentColor'
    && typeof localStorage[key] === 'string'
    && !initialFrames.includes(key)
    ) {
      initialFrames.push(key);
    }
  }
  initialFrames = initialFrames.sort((a, b) => a - b);
  framesArray = framesArray.concat(initialFrames);
  if (initialFrames[0]) {
    JSON.parse(localStorage.getItem(initialFrames[0]));
  }
}
