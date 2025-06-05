import GameEnv from './GameEnv.js';

class Sword {
  constructor(canvas, image, data, xPercentage, yPercentage, name) {
    this.canvas = canvas;
    this.image = image;
    this.data = data;

    this.xPercentage = xPercentage;
    this.yPercentage = yPercentage;

    this.x = xPercentage * GameEnv.innerWidth;
    this.y = yPercentage * GameEnv.innerHeight;

    this.width = data.scaleSize || 50;
    this.height = data.scaleSize || 50;

    this.name = name || 'sword';

    this.collected = false;

    this.element = document.createElement('img');
    this.element.src = data.src;
    this.element.style.position = 'absolute';
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = 10;

    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.appendChild(this.element);
    }
  }

  update(player) {
    if (this.collected) return;

    // Update sword position on screen (if needed)
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;

    // Check collision with player bounding box
    if (this.checkCollisionWithPlayer(player)) {
      this.collect();
    }
  }

  checkCollisionWithPlayer(player) {
    // Simple AABB collision detection
    const swordLeft = this.x;
    const swordRight = this.x + this.width;
    const swordTop = this.y;
    const swordBottom = this.y + this.height;

    const playerLeft = player.x;
    const playerRight = player.x + player.width;
    const playerTop = player.y;
    const playerBottom = player.y + player.height;

    return !(
      swordRight < playerLeft ||
      swordLeft > playerRight ||
      swordBottom < playerTop ||
      swordTop > playerBottom
    );
  }

  collect() {
    this.collected = true;
    GameEnv.hasSword = true;

    if (GameEnv.playSound) {
      GameEnv.playSound('swordPickup');
    }

    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }
}

export default Sword;
