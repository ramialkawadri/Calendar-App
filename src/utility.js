// A utility file that contains different important functions

// A utility function to know where the user clicked on the cell,
// returns the answer as a percentage
const calculateMinutePercentage = (mouseClickPosition, containerHeight) => {
  let percentage = mouseClickPosition / containerHeight;

  if (percentage < 0.25) percentage = 0.0;
  else if (percentage < 0.5) percentage = 0.25;
  else if (percentage < 0.75) percentage = 0.5;
  else percentage = 0.75;

  return percentage;
};

// Returns the element height that was set in the CSS in pixels
const getElementHeightFromCSS = (element) =>
  Number(element.style.height.replace('px', ''));

export { calculateMinutePercentage, getElementHeightFromCSS };
