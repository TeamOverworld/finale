import Character from './Character.js';
import GameEnv from './GameEnv.js';
import GameControl from './GameControl.js';

export class EnemyZombie extends Character {
    constructor(canvas, image, data, xPercentage, yPercentage, name, minPosition) {
        super(canvas, image, data);

        this.name = name;
        this.y = yPercentage;
        this.x = xPercentage * GameEnv.innerWidth;

        this.minPosition = minPosition * GameEnv.innerWidth;
        this.maxPosition = this.x + xPercentage * GameEnv.innerWidth;

        this.immune = 0;

        if (["easy", "normal"].includes(GameEnv.difficulty)) {
            this.speed = this.speed * Math.floor(Math.random() * 1.5 + 1);
        } else if (GameEnv.difficulty === "hard") {
            this.speed = this.speed * Math.floor(Math.random() * 2 + 1.5);
        } else {
            this.speed = this.speed * 3;
        }
    }

    update() {
        super.update();

        if (this.x <= this.minPosition || (this.x + this.canvasWidth >= this.maxPosition)) {
            this.speed = -this.speed;
        }

        if (GameControl.randomEventId === 2 && GameControl.randomEventState === 1) {
            this.speed = 0;
            if (this.name === "zombieSpecial") {
                GameControl.endRandomEvent();
            }
        }

        if (GameControl.randomEventId === 3 && GameControl.randomEventState === 1) {
            this.destroy();
            GameControl.endRandomEvent();
        }

        switch (GameEnv.difficulty) {
            case "normal":
                if (Math.random() < 0.002) this.speed = -this.speed;
                break;
            case "hard":
                if (Math.random() < 0.005) this.speed = -this.speed;
                break;
            case "impossible":
                if (Math.random() < 0.01) this.speed = -this.speed;
                break;
        }

        if (["normal", "hard"].includes(GameEnv.difficulty)) {
            if (Math.random() < 0.00002) {
                this.canvas.style.filter = 'hue-rotate(120deg)';
                this.immune = 1;
            }
        }

        if (GameEnv.difficulty === "hard") {
            this.canvas.style.filter = 'grayscale(100%)';
            this.immune = 1;
        } else if (GameEnv.difficulty === "impossible") {
            this.canvas.style.filter = 'hue-rotate(120deg) brightness(150%)';
            this.immune = 1;
        }

        this.x -= this.speed;

        if (Math.random() < 0.05) {
            this.lurch();
        }
        this.playerBottomCollision = false;
    }

    collisionAction() {
        if (this.collisionData.touchPoints.other.id === "finishline") {
            if (this.collisionData.touchPoints.other.left || this.collisionData.touchPoints.other.right) {
                this.speed = -this.speed;
            }
        }

        if (this.collisionData.touchPoints.other.id === "player") {
            // If player is holding a sword
            if (GameEnv.hasSword) {
                if (this.collisionData.touchPoints.other.bottom && this.immune === 0) {
                    GameEnv.invincible = true;
                    GameEnv.goombaBounce = true;
                    this.explode();
                    GameEnv.playSound("zombieDeath");

                    setTimeout(() => {
                        GameEnv.invincible = false;
                        this.destroy();
                    }, 1500);

                    setTimeout(() => {
                        this.destroy();
                        GameEnv.invincible = false;
                    }, 2000);
                }
            } else {
                // Player dies on contact with the zombie if no sword
                GameEnv.playerDead = true; // Or trigger your player death logic here
                GameEnv.playSound("playerDeath");
                console.log("Player has died because they had no sword!");
            }
        }

        if (["goomba", "zombie"].includes(this.collisionData.touchPoints.other.id)) {
            if (GameEnv.difficulty !== "impossible" && (this.collisionData.touchPoints.other.left || this.collisionData.touchPoints.other.right)) {
                this.speed = -this.speed;
            }
        }

        if (this.collisionData.touchPoints.other.id === "jumpPlatform") {
            if (this.collisionData.touchPoints.other.left || this.collisionData.touchPoints.other.right) {
                this.speed = -this.speed;
            }
        }
    }

    explode() {
        const shards = 15;
        for (let i = 0; i < shards; i++) {
            const shard = document.createElement('div');
            shard.style.position = 'absolute';
            shard.style.width = '5px';
            shard.style.height = '5px';
            shard.style.backgroundColor = 'green';
            shard.style.left = `${this.x}px`;
            shard.style.top = `${this.y}px`;
            this.canvas.parentElement.appendChild(shard);

            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 5 + 2;

            const shardX = Math.cos(angle) * speed;
            const shardY = Math.sin(angle) * speed;

            shard.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${shardX * 20}px, ${shardY * 20}px)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out',
                fill: 'forwards'
            });

            setTimeout(() => {
                shard.remove();
            }, 1000);
        }
        this.canvas.style.opacity = 0;
    }

    lurch() {
        this.y += Math.sin(Date.now() / 100) * 2;
    }
}

export default EnemyZombie;
