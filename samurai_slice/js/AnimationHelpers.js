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
  scene.slash.push({ x, y });

  if (scene.slash.length > 1) {
    let lastIndex = scene.slash.length - 1;

    scene.slashGraphics.clear();
    scene.slashGraphics.strokeLineShape(
      new Phaser.Geom.Line(
        scene.slash[lastIndex - 1].x,
        scene.slash[lastIndex - 1].y,
        x,
        y
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
  for (let i = scene.explosions.length - 1; i >= 0; i--) {
    let explosion = scene.explosions[i];
    explosion.scale += 0.02;
    explosion.setScale(explosion.scale);

    if (explosion.scale >= 1.5) {
      explosion.destroy();
      scene.explosions.splice(i, 1);
    }
  }
}
