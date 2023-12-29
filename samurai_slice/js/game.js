import { animateExplosions, processSlashInput } from "./AnimationHelpers.js";
import { startGame, updateGameplay } from "./GameplayHelpers.js";
import { addUIElements, updateUI } from "./UIHelpers.js";

import { config } from "./config.js";

const { fontSize, gameHeight, gameWidth, scaleToFitX, scaleToFitY } = config;

const assets = {
  images: [
    { name: "apple", src: "samurai_slice/assets/apple.png" },
    { name: "apple-cut", src: "samurai_slice/assets/apple_cut.png" },
    { name: "bomb", src: "samurai_slice/assets/bomb.png" },
    { name: "carrot", src: "samurai_slice/assets/carrot.png" },
    { name: "carrot-cut", src: "samurai_slice/assets/carrot_cut.png" },
    { name: "explosion", src: "samurai_slice/assets/explosion.png" },
    { name: "orange", src: "samurai_slice/assets/orange.png" },
    { name: "orange-cut", src: "samurai_slice/assets/orange_cut.png" },
    { name: "pear", src: "samurai_slice/assets/pear.png" },
    { name: "pear-cut", src: "samurai_slice/assets/pear_cut.png" },
    { name: "tomato", src: "samurai_slice/assets/tomato.png" },
    { name: "tomato-cut", src: "samurai_slice/assets/tomato_cut.png" },
    { name: "wood-bg", src: "samurai_slice/assets/wood_bg.png" },
  ],
};

class GamePlay extends Phaser.Scene {
  constructor() {
    super({ key: "GamePlay" });
    this.explosions = [];
    this.explosionScale = 0.1;
    this.gameLevel = 0;
    this.gameState = "preparing";
    this.itemList = ["apple", "carrot", "orange", "pear", "tomato", "bomb"];
    this.livesCount = 3;
    this.scoreCount = 0;
    this.slashGraphics = null;
    this.throwEvent = null;
  }

  preload() {
    assets.images.forEach((asset) => {
      this.load.image(asset.name, asset.src);
    });
  }

  create() {
    this.physics.world.setBounds(0, -100, gameWidth, gameHeight + 100);

    let scale = Math.max(scaleToFitX, scaleToFitY);

    let background = this.add.sprite(0, 0, "wood-bg");
    background.setOrigin(0, 0);
    background.setScale(scale, scale);

    this.items = this.physics.add.group({ defaultKey: "items" });
    this.itemsCut = this.physics.add.group({ defaultKey: "itemsCut" });

    this.slashGraphics = this.add.graphics({
      lineStyle: { width: 12, color: 0xffffff },
    });
    this.slashGraphics.setDepth(1);

    addUIElements(this);

    this.startButton = this.add
      .text(gameWidth / 2, gameHeight / 2, "Start Game", {
        font: fontSize + "px Arial",
        fill: "#fff",
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => startGame(this));

    this.scoreLabel.visible = false;
    this.livesLabel.visible = false;
  }

  update() {
    animateExplosions(this);
    processSlashInput(this);
    updateUI(this);
    updateGameplay(this);
  }
}

const configurations = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: gameWidth,
  height: gameHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [GamePlay],
};

const game = new Phaser.Game(configurations);
