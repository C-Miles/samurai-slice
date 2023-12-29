const isMobile = window.innerWidth < 768;
const baseWidth = 1024;
const baseHeight = 768;

const gameWidth = isMobile
  ? window.innerWidth
  : Math.min(window.innerWidth * 0.7, baseWidth);

const gameHeight = isMobile
  ? window.innerHeight
  : gameWidth * (baseHeight / baseWidth);

export const config = {
  gameWidth: gameWidth,
  gameHeight: gameHeight,
  fontSize: Math.max(gameWidth / baseWidth, gameHeight / baseHeight) * 30,
  isMobile,
  scaleToFitX: gameWidth / baseWidth,
  scaleToFitY: gameHeight / baseHeight,
};
