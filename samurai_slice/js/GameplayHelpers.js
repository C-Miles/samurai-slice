import { config } from "./config.js";

import { flashLivesIndicator, triggerGameOver } from "./UIHelpers.js";
import { spawnExplosionEffect } from "./AnimationHelpers.js";

const { gameWidth, gameHeight, isMobile, scaleToFitX, scaleToFitY } = config;

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
    let totalItems = Math.min(Math.floor(scene.gameLevel / 3) + 1, 4);

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
  item.body.setCircle(45);
  item.setInteractive();
  item.setScale(scaleToFitX + 1, scaleToFitY + 1);
  item.body.setVelocity(
    Phaser.Math.Between(-80, 80),
    isMobile ? -gameHeight : -gameHeight - 100
  );
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
  applySliceForce(parts[0], "left");
  applySliceForce(parts[1], "right");
  item.destroy();
}

export function createSlicedFruit(scene, itemType, x, y) {
  var cutTexture = itemType + "-cut";

  var part1 = scene.itemsCut.create(x, y, cutTexture);
  scene.physics.add.existing(part1);
  part1.type = cutTexture;
  part1.state = "falling";
  part1.setScale(scaleToFitX + 1, scaleToFitY + 1);
  part1.body.setVelocity(0, 0);
  part1.setOrigin(0.5, 0.5);

  var part2 = scene.itemsCut.create(x, y, cutTexture);
  scene.physics.add.existing(part2);
  part2.type = cutTexture;
  part2.state = "falling";
  part2.setScale(scaleToFitX + 1, scaleToFitY + 1);
  part2.body.setVelocity(0, 0);
  part2.setOrigin(0.5, 0.5);

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
