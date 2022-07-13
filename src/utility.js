// A utility function to know where the user clicked on the cell
const calculateMinutePresentage = (mouseClickPosition, containerHeight) => {
  let presentage = mouseClickPosition / containerHeight;

  if (presentage < 0.25) presentage = 0.0;
  else if (presentage < 0.5) presentage = 0.25;
  else if (presentage < 0.75) presentage = 0.5;
  else presentage = 0.75;

  return presentage;
};

const getElementHeightFromCSS = (element) =>
  Number(element.style.height.replace('px', ''));

export { calculateMinutePresentage, getElementHeightFromCSS };
