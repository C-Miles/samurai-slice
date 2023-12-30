import { config } from "./config.js";

import { flashLivesIndicator, triggerGameOver } from "./UIHelpers.js";
import { spawnExplosionEffect } from "./AnimationHelpers.js";

const { gameWidth, gameHeight, isMobile, scaleToFitX, scaleToFitY } = config;

const fruitScaleFactor = isMobile ? 0.7 : 1;
const fruitScaleX = scaleToFitX + fruitScaleFactor;
const fruitScaleY = scaleToFitY + fruitScaleFactor;

export function startGame(scene) {
  scene.startButton.visible = false;
  scene.scoreLabel.visible = true;
  scene.livesLabel.visible = true;

  scene.gameState = "playing";

  scheduleFruitLaunch(scene);
}

export function scheduleFruitLaunch(scene) {
  if (scene.throwEvent) {
    scene.throwEvent.remove();
  }

  scene.throwEvent = scene.time.addEvent({
    delay: 3000,
    callback: () => launchFruits(scene),
    loop: true,
  });
}

export function launchFruits(scene) {
  if (scene.gameState === "playing") {
    scene.gameLevel++;
    let totalItems = Math.min(
      Math.floor(scene.gameLevel / 3) + 1,
      isMobile ? 4 : 6
    );

    for (let i = 0; i < totalItems; i++) {
      scene.time.delayedCall(i * 200, () => createFruit(scene), []);
    }
  }
}

export function createFruit(scene) {
  const xPos = Phaser.Math.Between(50, gameWidth - 50);
  const fruitType = Phaser.Math.RND.pick(scene.itemList);
  const item = scene.items.create(xPos, gameHeight + 100, fruitType);

  item.type = fruitType;
  item.state = "spawning";

  const fruitRadius = (128 / 2) * fruitScaleFactor;
  item.body.setCircle(fruitRadius);

  item.setInteractive();
  item.setScale(fruitScaleX, fruitScaleY);

  const launchVelocityFactor = 1.7;
  const launchVelocityY = isMobile
    ? -gameHeight * launchVelocityFactor
    : (-gameHeight - 100) * launchVelocityFactor;

  const maxXVelocity = gameWidth / 4;

  const centerDistanceFactor = Math.abs(gameWidth / 2 - xPos) / (gameWidth / 2);
  let launchVelocityX = maxXVelocity * centerDistanceFactor;

  if (xPos < gameWidth / 2) {
    launchVelocityX = Math.abs(launchVelocityX);
  } else {
    launchVelocityX = -Math.abs(launchVelocityX);
  }

  item.body.setVelocity(launchVelocityX, launchVelocityY);

  item.setCollideWorldBounds(false);
}

export function restartGame(scene) {
  scene.children.getByName("restartButton").destroy();

  scene.gameLevel = 0;
  scene.gameState = "preparing";

  scene.livesCount = 3;
  scene.scoreCount = 0;

  if (scene.throwEvent) {
    scene.throwEvent.remove();
  }

  scene.items.clear(true, true);
  scene.itemsCut.clear(true, true);

  scene.physics.resume();

  startGame(scene);
}

export function handleFruitInteraction(scene, item) {
  if (scene.game.input.activePointer.isDown && scene.gameState === "playing") {
    if (item.type === "bomb") {
      scene.livesCount -= 1;

      flashLivesIndicator(scene);
      spawnExplosionEffect(scene, item.x, item.y);

      item.destroy();

      if (scene.livesCount <= 0) {
        triggerGameOver(scene);
      }
    } else {
      destroyFruitAndScore(scene, item);
    }
  } else {
    updateFruitState(scene, item);
  }
}

export function handleFallingFruit(scene, item) {
  const visibleBottomY = 1024 * scaleToFitY;

  if (item.state === "falling" && item.y >= visibleBottomY) {
    if (item.type !== "bomb") {
      scene.livesCount -= 1;
      flashLivesIndicator(scene);
    }

    item.destroy();

    if (scene.livesCount <= 0) {
      triggerGameOver(scene);
    }
  }
}

export function destroyFruitAndScore(scene, item) {
  scene.scoreCount += 100;
  const parts = createSlicedFruit(scene, item.type, item.x, item.y);

  applySliceForceAndRotation(parts[0], "left");
  applySliceForceAndRotation(parts[1], "right");

  item.destroy();
}

export function applySliceForceAndRotation(item, direction) {
  var xVector = direction === "left" ? -160 : 160;
  var yVector = -300;
  item.body.velocity.setTo(xVector, yVector);

  var angularVelocity = direction === "left" ? 130 : -130;
  item.body.angularVelocity = angularVelocity;
}

export function createSlicedFruit(scene, itemType, x, y) {
  var cutTexture = itemType + "-cut";

  var part1 = scene.itemsCut.create(x, y, cutTexture);
  scene.physics.add.existing(part1);
  part1.type = cutTexture;
  part1.state = "falling";
  part1.setScale(fruitScaleX, fruitScaleY);
  part1.body.setVelocity(0, 0);
  part1.setOrigin(0.5, 0.5);
  part1.alpha = 1;

  var part2 = scene.itemsCut.create(x, y, cutTexture);
  scene.physics.add.existing(part2);
  part2.type = cutTexture;
  part2.state = "falling";
  part2.setScale(fruitScaleX, fruitScaleY);
  part2.body.setVelocity(0, 0);
  part2.setOrigin(0.5, 0.5);
  part2.alpha = 1;

  return [part1, part2];
}

export function applySliceForce(item, direction) {
  var xVector = direction === "left" ? -80 : 80;
  var yVector = -300;
  item.body.velocity.setTo(xVector, yVector);
}

export function isPointerOver(scene, item) {
  const pointer = scene.input.activePointer;
  return item.getBounds().contains(pointer.worldX, pointer.worldY);
}

export function updateGameplay(scene) {
  if (scene.gameState === "playing") {
    scene.items.getChildren().forEach((item) => {
      if (isPointerOver(scene, item)) {
        handleFruitInteraction(scene, item);
      }

      updateFruitState(scene, item);
    });

    scene.itemsCut.getChildren().forEach((slicedItem) => {
      if (slicedItem.alpha > 0) {
        slicedItem.alpha -= 0.005;
        if (slicedItem.alpha <= 0) {
          slicedItem.destroy();
        }
      }
    });
  }
}

function updateFruitState(scene, item) {
  if (item.previousY === undefined) {
    item.previousY = item.y;
  }

  if (item.state === "spawning" && item.y < item.previousY) {
    item.state = "rising";
  } else if (item.state === "rising" && item.y > item.previousY) {
    item.state = "falling";
  }

  handleFallingFruit(scene, item);
  item.previousY = item.y;
}
