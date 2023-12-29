import { config } from "./config.js";

import { restartGame } from "./GameplayHelpers.js";

const { fontSize, gameWidth, gameHeight } = config;

export function addUIElements(scene) {
  const style = {
    font: fontSize + "px Arial",
    fill: "#FFFFFF",
    align: "center",
    stroke: "#000000",
    strokeThickness: 2,
  };

  let scoreX = gameWidth * 0.25;
  let livesX = gameWidth * 0.75;
  let textY = fontSize * 0.5;

  scene.scoreLabel = scene.add
    .text(scoreX, textY, "Score:\n" + scene.scoreCount, style)
    .setOrigin(0.5, 0)
    .setDepth(10);

  scene.livesLabel = scene.add
    .text(livesX, textY, "Lives:\n" + scene.livesCount, style)
    .setOrigin(0.5, 0)
    .setDepth(10);
}

export function updateUI(scene) {
  scene.scoreLabel.setText("Score:\n" + scene.scoreCount);
  scene.livesLabel.setText("Lives:\n" + scene.livesCount);
}

export function triggerGameOver(scene) {
  console.log("Game Over");
  scene.gameState = "gameOver";
  scene.physics.pause();

  if (scene.throwEvent) {
    scene.throwEvent.remove();
    scene.throwEvent = null;
  }

  scene.items.clear(true, true);
  scene.itemsCut.clear(true, true);

  let gameOverText = scene.add
    .text(gameWidth / 2, gameHeight / 2, "Game Over", {
      font: fontSize + "px Arial",
      fill: "#ffffff",
    })
    .setOrigin(0.5)
    .setDepth(12)
    .setName("restartButton");

  scene.time.delayedCall(1500, () => {
    gameOverText.setText("Restart");
    gameOverText.setInteractive().on("pointerdown", () => restartGame(scene));
  });
}

export function flashLivesIndicator(scene) {
  scene.livesLabel.setFontSize(fontSize * 1.8);
  scene.livesLabel.setFill("#ff0000");

  scene.time.delayedCall(1000, () => {
    scene.livesLabel.setFontSize(fontSize);
    scene.livesLabel.setFill("#FFFFFF");
  });
}
