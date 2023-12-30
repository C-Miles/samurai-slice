import { config } from "./config.js";

const { isMobile } = config;

export function processSlashInput(scene) {
  if (scene.game.input.activePointer.isDown) {
    renderSlashEffect(
      scene,
      scene.game.input.activePointer.worldX,
      scene.game.input.activePointer.worldY
    );
  } else {
    clearSlashTrace(scene);
  }
}

export function renderSlashEffect(scene, x, y) {
  const currentTime = scene.time.now;
  scene.slash.push({ x, y, time: currentTime });

  scene.slashGraphics.clear();

  for (let i = 1; i < scene.slash.length; i++) {
    const alpha = Phaser.Math.Clamp(
      1 - (currentTime - scene.slash[i - 1].time) / 400,
      0,
      1
    );

    if (alpha <= 0) {
      scene.slash.splice(i - 1, 1);
      i--;
      continue;
    }

    scene.slashGraphics.lineStyle(8, 0xffffff, alpha);
    scene.slashGraphics.strokeLineShape(
      new Phaser.Geom.Line(
        scene.slash[i - 1].x,
        scene.slash[i - 1].y,
        scene.slash[i].x,
        scene.slash[i].y
      )
    );
  }
}

export function clearSlashTrace(scene) {
  scene.slash = [];
  scene.slashGraphics.clear();
}

export function spawnExplosionEffect(scene, x, y) {
  let explosion = scene.add.sprite(x, y, "explosion");
  explosion.scale = scene.explosionScale;
  explosion.setScale(explosion.scale);
  explosion.setDepth(10);
  scene.explosions.push(explosion);
}

export function animateExplosions(scene) {
  const explosionScaleFactor = isMobile ? 1.2 : 1.5;
  const scaleIncrement = 0.015;

  for (let i = scene.explosions.length - 1; i >= 0; i--) {
    let explosion = scene.explosions[i];
    explosion.scale += scaleIncrement;
    explosion.setScale(explosion.scale);

    if (explosion.scale >= explosionScaleFactor) {
      explosion.destroy();
      scene.explosions.splice(i, 1);
    }
  }
}
