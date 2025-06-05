// PlayerOverworld.js
import GameEnv from './GameEnv.js';
import PlayerBase from './PlayerBase.js';
import GameControl from './GameControl.js';

/**
 * @class PlayerOverworld
 * @description Handles the Minecraft-themed overworld player: movement, collisions, and item pickups.
 * 
 * Extends PlayerBase.
 */
export class PlayerOverworld extends PlayerBase {

    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - The canvas element to draw the player on.
     * @param {HTMLImageElement} image - The image for the player sprite.
     * @param {Object} data - Player data (animations, scaling, etc.).
     */
    constructor(canvas, image, data) {
        super(canvas, image, data);
        this.inventory = []; // Store picked-up items
    }

    /**
     * @override
     * Handles collisions for PlayerOverworld: finishline, zombie, chicken, and item pickups.
     */
    handleCollisionStart() {
        super.handleCollisionStart();

        // Additional collision checks for item pickups
        this.handleCollisionEvent("finishline");
        this.handleCollisionEvent("zombie");
        this.handleCollisionEvent("chicken");
        this.handleCollisionEvent("sword");
        this.handleCollisionEvent("coin");
    }

    /**
     * @override
     * Handles player reactions to collisions.
     */
    handlePlayerReaction() {
        super.handlePlayerReaction();

        switch (this.state.collision) {
            case "finishline":
                if (this.collisionData.touchPoints.this.onTopofOther || this.state.isFinishing) {
                    this.x = this.collisionData.newX;
                    this.state.movement = { up: false, down: false, left: false, right: false, falling: false };
                    this.state.isFinishing = true;
                    this.gravityEnabled = true;
                    if (Math.abs(this.y - this.bottom) <= GameEnv.gravity) {
                        this.x = GameEnv.innerWidth + 1;
                    }
                } else if (this.collisionData.touchPoints.this.right) {
                    this.state.movement.right = false;
                    this.state.movement.left = true;
                } else if (this.collisionData.touchPoints.this.left) {
                    this.state.movement.left = false;
                    this.state.movement.right = true;
                }
                break;

            case "zombie":
                if (this.collisionData.touchPoints.this.top && this.collisionData.touchPoints.other.bottom && !this.state.isDying) {
                    if (GameEnv.goombaBounce) {
                        GameEnv.goombaBounce = false;
                        this.y -= 100;
                    }
                } else if (this.collisionData.touchPoints.this.right || this.collisionData.touchPoints.this.left) {
                    if (!this.state.isDying) {
                        this.state.isDying = true;
                        this.canvas.style.transition = "transform 0.5s";
                        this.canvas.style.transform = "rotate(-90deg) translate(-26px, 0%)";
                        GameEnv.playSound("PlayerDeath");
                        setTimeout(async () => {
                            await GameControl.transitionToLevel(GameEnv.levels[GameEnv.levels.indexOf(GameEnv.currentLevel)]);
                        }, 900);
                    }
                }
                break;

            case "chicken":
                // For now: Chicken triggers level finish if zombie is defeated
                if (GameEnv.zombieDefeated) {
                    GameEnv.playSound("LevelComplete");
                    this.x = GameEnv.innerWidth + 1;
                }
                break;

            case "sword":
                this.pickupItem("sword");
                break;

            case "coin":
                this.pickupItem("coin");
                break;
        }
    }

    /**
     * Handle item pickups.
     * @param {string} item - The name of the item to pick up.
     */
    pickupItem(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
            GameEnv.playSound("ItemPickup");
            GameEnv.destroyedItems.push(item); // Mark it as picked up in the environment
            console.log(`Picked up: ${item}`);
        }
    }
}

export default PlayerOverworld;
