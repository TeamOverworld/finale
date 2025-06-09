// To build GameLevels, each contains GameObjects from below imports
import Background from './GameEngine/Background.js';
import Player from './GameEngine/Player.js';
import Npc from './GameEngine/Npc.js';
import GameControl from './GameEngine/GameControl.js';
import Creeper from './GameEngine/Creeper.js';
import Game from './Game.js';
import GameLevelDesert from './GameLevelDesert.js';

class GameLevelOverworld {
  constructor(gameEnv) {
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;
    const path = gameEnv.path;

    // Background image info
    const image_src_main = `${path}/images/gamify/maine_RPG.png`;
    const image_data_main = {
      name: 'main',
      greeting: "Welcome to the main hub of Overworld.",
      src: image_src_main,
      pixels: { height: 320, width: 480 }
    };

    // Player sprite info and configuration
    const sprite_src_player = `${path}/images/gamify/steve.png`;
    const PLAYER_SCALE_FACTOR = 5;
    const sprite_data_player = {
      id: 'Player',
      greeting: "I am Steve.",
      src: sprite_src_player,
      SCALE_FACTOR: PLAYER_SCALE_FACTOR,
      STEP_FACTOR: 800,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: 0, y: height - (height / PLAYER_SCALE_FACTOR) - 40 }, // Bottom-left corner
      pixels: { height: 1500, width: 600 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      downRight: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
      downLeft: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
      left: { row: 1, start: 0, columns: 3 },
      right: { row: 2, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      upLeft: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
      upRight: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 },

      // Velocity for movement handling
      velocity: { x: 5, y: 5 },

      // Bounds checking function for player movement inside canvas
      canMoveTo(newX, newY, canvasWidth, canvasHeight) {
        const leftBound = 0;
        const rightBound = canvasWidth - (this.pixels.width / this.SCALE_FACTOR);
        const topBound = 0;
        const bottomBound = canvasHeight - (this.pixels.height / this.SCALE_FACTOR);
        if (newX < leftBound || newX > rightBound) return false;
        if (newY < topBound || newY > bottomBound) return false;
        return true;
      }
    };

    // Creeper sprite info with movement and animation logic
    const sprite_src_creeper = `${path}/images/gamify/creepa.png`;
    const sprite_greet_creeper = "KABOOM!!";
    const sprite_data_creeper = {
      id: 'Creeper',
      greeting: sprite_greet_creeper,
      src: sprite_src_creeper,
      SCALE_FACTOR: 4,
      ANIMATION_RATE: 25,
      pixels: { height: 1200, width: 1600 },
      INIT_POSITION: { x: 100, y: 100 },
      orientation: { rows: 1, columns: 2 },
      down: { row: 0, start: 0, columns: 2 },
      right: { row: 0, start: 0, columns: 2 },
      left: { row: 0, start: 0, columns: 2 },
      up: { row: 0, start: 0, columns: 2 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },

      walkingArea: {
        xMin: width / 10,
        xMax: (width * 5) / 7,
        yMin: height / 4,
        yMax: (height * 8) / 15
      },
      speed: 10,
      direction: { x: 1, y: 1 },

      sound: new Audio(`${path}/assets/audio/creeper.mp3`),

      updatePosition() {
        this.INIT_POSITION.x += this.direction.x * this.speed;
        this.INIT_POSITION.y += this.direction.y * this.speed;

        if (this.INIT_POSITION.x <= this.walkingArea.xMin) {
          this.INIT_POSITION.x = this.walkingArea.xMin;
          this.direction.x = 1;
        }
        if (this.INIT_POSITION.x >= this.walkingArea.xMax) {
          this.INIT_POSITION.x = this.walkingArea.xMax;
          this.direction.x = -1;
        }
        if (this.INIT_POSITION.y <= this.walkingArea.yMin) {
          this.INIT_POSITION.y = this.walkingArea.yMin;
          this.direction.y = 1;
        }
        if (this.INIT_POSITION.y >= this.walkingArea.yMax) {
          this.INIT_POSITION.y = this.walkingArea.yMax;
          this.direction.y = -1;
        }

        // Update DOM element for creeper position and facing direction
        const spriteElement = document.getElementById(this.id);
        if (spriteElement) {
          spriteElement.style.transform = this.direction.x === -1 ? "scaleX(-1)" : "scaleX(1)";
          spriteElement.style.left = `${this.INIT_POSITION.x}px`;
          spriteElement.style.top = `${this.INIT_POSITION.y}px`;
        }
      },

      isAnimating: false,
      playAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const spriteElement = document.getElementById(this.id);
        if (!spriteElement) {
          this.isAnimating = false;
          return;
        }

        this.sound.play();

        spriteElement.style.transition = 'filter 1s ease-in-out';
        spriteElement.style.filter = 'brightness(3) saturate(0)';

        setTimeout(() => {
          spriteElement.style.filter = 'none';
          setTimeout(() => {
            spriteElement.style.transition = '';
            this.isAnimating = false;
          }, 1000);
        }, 1000);
      }
    };

    // Platformer mini-level inside overworld for exploration
    class PlatformerMini {
      constructor(gameEnv) {
        this.gameEnv = gameEnv; // Pass gameEnv to PlatformerMini
        this.isRunning = false;

        // Initialize enemyDefeated flag
        this.enemyDefeated = false;

        // Create and initialize the canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth; // Set canvas width
        this.canvas.height = window.innerHeight; // Set canvas height
        this.ctx = this.canvas.getContext('2d'); // Initialize context

        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = `${gameEnv.path}/images/gamify/mcbg.jpg`; // Replace with your image path

        
        // Load collectible item image
        this.collectibleImage = new Image();
        this.collectibleImage.src = `${gameEnv.path}/images/platformer/sprites/sword.png`; // Replace with your image path

        // Load player image
        this.playerImage = new Image();
        this.playerImage.src = `${gameEnv.path}/images/gamify/stevelol.png`; // Replace with your player image path

        // Player properties
        this.playerX = 50; // Initial X position
        this.playerY = 600; // Initial Y position
        this.playerWidth = 85; // Width of the player
        this.playerHeight = 85; // Height of the player
        this.playerSpeedX = 0;
        this.playerSpeedY = 0;
        this.gravity = 0.5;
        this.groundY = 700; // Ground level
        this.keysPressed = {};
        this.animationFrameId = null;
        this.onExit = null; // callback when platformer stops
        this.canJump = true; // Flag to track if the player can jump
        this.playerDirection = 1; // 1 for right, -1 for left

        // Load enemy image
        this.enemyImage = new Image();
        this.enemyImage.src = `${gameEnv.path}/images/gamify/mzombie.png`; // Replace with your enemy image path

        // Enemy properties
        const platformStartX = this.canvas.width / 2 + 50; // Start of the large platform
        const platformEndX = this.canvas.width / 2 + 410; // End of the large platform
        this.enemyX = platformStartX; // Start enemy at the beginning of the platform
        this.enemyY = this.groundY - 400 - 100; // Align enemy with the top of the large platform
        this.enemyWidth = 100; // Width of the enemy
        this.enemyHeight = 100; // Height of the enemy
        this.enemySpeedX = 1; // Horizontal movement speed
        this.enemyDirection = -1; // Start facing left (-1 for left, 1 for right)

        // Load NPC image
        this.npcImage = new Image();
        this.npcImage.src = `${gameEnv.path}/images/gamify/mchicken.png`; // Replace with your NPC image path
        this.npcWidth = 50; // Initialize NPC width
        this.npcHeight = 50; // Initialize NPC height
        this.npcX = this.canvas.width - 150; // Place NPC on the ground on the right-hand side
        this.npcY = this.canvas.height - 575; // Align NPC with the top of the ground
      }

      start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Pause the RPG game
        pauseRpg();

        // Reset player properties to ensure a clean start
        this.playerX = 50; // Reset to starting position
        this.playerY = this.groundY - 50; // Reset to ground level
        this.playerSpeedX = 0; // Reset horizontal speed
        this.playerSpeedY = 0; // Reset vertical speed
        this.keysPressed = {}; // Clear any previously pressed keys
        this.canJump = true; // Allow jumping

        // Reset collectible item state
        this.itemCollected = false; // Ensure the collectible item reappears

        // Initialize platform images
        this.platformImages = [
          new Image(),
          new Image(),
          new Image()
        ];
        this.platformImages[0].src = `${path}/images/platformer/platforms/grassblock.jpg`;
        this.platformImages[1].src = `${path}/images/platformer/platforms/grassblock.jpg`;
        this.platformImages[2].src = `${path}/images/platformer/platforms/grassblock.jpg`;

        // Create canvas overlay for mini platformer
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'platformerMiniCanvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        Object.assign(this.canvas.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '10000',
          backgroundColor: 'rgba(135, 206, 235, 1)' // Sky blue
        });
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);

        this.loop();
      }

      stop() {
        if (!this.isRunning) return;
        this.isRunning = false;

        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);

        if (this.canvas?.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
          this.canvas = null;
          this.ctx = null;
        }

        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }

        // Reset player position for retry
        this.playerX = 50; // Reset to starting position
        this.playerY = this.groundY - 50; // Reset to ground level
        this.playerSpeedX = 0;
        this.playerSpeedY = 0;
        this.canJump = true;

        // Show death screen
        this.showDeathScreen();
      }

      showDeathScreen() {
        // Create death screen overlay
        const deathScreen = document.createElement('div');
        deathScreen.id = 'deathScreen';
        Object.assign(deathScreen.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '10001',
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        });

        // Add death message
        const message = document.createElement('h1');
        message.textContent = 'You have died!';
        message.style.marginBottom = '20px';
        deathScreen.appendChild(message);

        // Add button to close death screen and resume RPG
        const button = document.createElement('button');
        button.textContent = 'Return to RPG';
        Object.assign(button.style, {
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        });
        button.addEventListener('click', () => {
          document.body.removeChild(deathScreen); // Remove death screen
          if (this.onExit) this.onExit(); // Resume RPG
        });
        deathScreen.appendChild(button);

        // Append death screen to the document
        document.body.appendChild(deathScreen);
      }

      showDialogue(message, title, callback) {
        // Create dialogue overlay
        const dialogueOverlay = document.createElement('div');
        Object.assign(dialogueOverlay.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '10001',
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        });

        // Add title
        const titleElement = document.createElement('h1');
        titleElement.textContent = title;
        titleElement.style.marginBottom = '20px';
        dialogueOverlay.appendChild(titleElement);

        // Add message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '20px';
        dialogueOverlay.appendChild(messageElement);

        // Add button to execute callback
        const button = document.createElement('button');
        button.textContent = 'Continue.';
        Object.assign(button.style, {
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        });
        button.addEventListener('click', () => {
          document.body.removeChild(dialogueOverlay); // Remove dialogue overlay
          if (callback) callback(); // Execute callback
        });
        dialogueOverlay.appendChild(button);

        // Append dialogue overlay to the document
        document.body.appendChild(dialogueOverlay);
      }

      returnToDesert() {
        if (!this.isRunning) return;
        this.isRunning = false;

        // Clean up event listeners and canvas
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);

        if (this.canvas?.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
          this.canvas = null;
          this.ctx = null;
        }

        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }

        // Transition back to GameLevelDesert
        const desertLevel = new GameLevelDesert(this.gameEnv); // Pass gameEnv to GameLevelDesert
        desertLevel.start(); // Start the desert level
      }

      keyDownHandler = (e) => {
        this.keysPressed[e.code] = true;

        // Handle interaction with NPC when 't' is pressed
        if (e.code === 'KeyE') {
          if (
            this.playerX + 50 > this.npcX && // Player's right edge is past NPC's left edge
            this.playerX < this.npcX + this.npcWidth && // Player's left edge is before NPC's right edge
            this.playerY + 50 > this.npcY && // Player's bottom edge is past NPC's top edge
            this.playerY < this.npcY + this.npcHeight // Player's top edge is before NPC's bottom edge
          ) {
            if (!this.enemyDefeated) { // Enemy is still alive
              this.showDialogue(
                "BAWK! I'm too scared to move because of that monster over there! ( You have to defeat it first! )",
                "Scared NPC"
              );
            } else { // Enemy is defeated
              this.showDialogue(
                "Hooray! You have slain the monster! Let's get out of here.. ( You will now be transported back to the Desert! )",
                "Grateful NPC",
                () => {
                  window.location.reload(); // Reload the page
                }
              );
            }
          }
        }

        if (e.code === 'Escape') {
          this.stop();
        }
      }

      keyUpHandler = (e) => {
        this.keysPressed[e.code] = false;
      }

      loop = () => {
        this.update();
        this.draw();
        if (this.isRunning) {
          this.animationFrameId = requestAnimationFrame(this.loop);
        }
      }

      update() {
        // Horizontal movement
        if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) {
          this.playerSpeedX = 5;
          this.playerDirection = 1; // Facing right
        } else if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) {
          this.playerSpeedX = -5;
          this.playerDirection = -1; // Facing left
        } else {
          this.playerSpeedX = 0;
        }

        // Jump only if player is allowed to jump
        if ((this.keysPressed['ArrowUp'] || this.keysPressed['KeyW'] || this.keysPressed['Space']) && this.canJump) {
          this.playerSpeedY = -15; // Increased jump height
          this.canJump = false; // Disable jumping until the player lands
        }

        // Gravity effect
        this.playerSpeedY += this.gravity;

        // Update player position
        this.playerX += this.playerSpeedX;
        this.playerY += this.playerSpeedY;

        // Collision with ground
        if (this.playerY + this.playerHeight > this.groundY && this.playerX < this.canvas.width / 6) {
          this.playerY = this.groundY - this.playerHeight; // Ensure the player touches the ground
          this.playerSpeedY = 0;
          this.canJump = true; // Enable jumping when the player lands on the ground
        }

        // Collision with elevated ground on the right
        if (
          this.playerY + this.playerHeight > this.groundY - 400 && // Adjust collision to match the visual height of the elevated ground
          this.playerX > this.canvas.width - 200 && // Elevated ground starts on the right
          this.playerX < this.canvas.width // Ensure collision ends at the right edge of the canvas
        ) {
          this.playerY = this.groundY - 400 - this.playerHeight; // Adjust for elevated ground height
          this.playerSpeedY = 0;
          this.canJump = true; // Enable jumping when the player lands on the elevated ground
        }

        // Collision with platforms
        const platforms = [
          { x: this.canvas.width / 4 - 50, y: this.groundY - 150, width: 60, height: 60 },
          { x: this.canvas.width / 4 + 50, y: this.groundY - 200, width: 60, height: 60 },
          { x: this.canvas.width / 2 - 100, y: this.groundY - 300, width: 60, height: 60 },
          { x: this.canvas.width / 2 - 40, y: this.groundY - 300, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 50, y: this.groundY - 400, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 110, y: this.groundY - 400, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 170, y: this.groundY - 400, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 230, y: this.groundY - 400, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 290, y: this.groundY - 400, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 350, y: this.groundY - 400, width: 60, height: 60 },
          { x: this.canvas.width / 2 + 410, y: this.groundY - 400, width: 60, height: 60 }, // Last platform

          // Bottom platforms
          { x: this.canvas.width / 2 - 150, y: this.groundY - 70, width: 60, height: 60 },
          { x: this.canvas.width / 2 - 90, y: this.groundY - 70, width: 60, height: 60 }
        ];

        for (const platform of platforms) {
          // Check if the player is colliding with the platform from above
          if (
            this.playerX + this.playerWidth > platform.x && // Player's right edge is past platform's left edge
            this.playerX < platform.x + platform.width && // Player's left edge is before platform's right edge
            this.playerY + this.playerHeight > platform.y && // Player's bottom edge is past platform's top edge
            this.playerY < platform.y + platform.height && // Player's top edge is before platform's bottom edge
            this.playerSpeedY > 0 // Ensure the player is falling
          ) {
            this.playerY = platform.y - this.playerHeight; // Place player on top of the platform
            this.playerSpeedY = 0; // Stop vertical movement
            this.canJump = true; // Enable jumping when the player lands on a platform
          }
        }

        // Check if the player is near the item and presses 'c' to collect it
        if (
          !this.itemCollected && // Ensure the item hasn't been collected yet
          this.playerX + this.playerWidth > this.canvas.width / 2 - 120 && // Player's right edge is past item's left edge
          this.playerX < this.canvas.width / 2 - 80 && // Player's left edge is before item's right edge
          this.playerY + this.playerHeight > this.groundY - 110 && // Player's bottom edge is past item's top edge
          this.playerY < this.groundY - 70 && // Player's top edge is before item's bottom edge
          this.keysPressed['KeyC'] // Check if 'c' key is pressed
        ) {
          this.itemCollected = true; // Mark the item as collected
          console.log('Item collected!'); // Log the collection event (optional)
        }

        // Check collision between player and enemy
        if (
          this.playerX + 50 > this.enemyX && // Player's right edge is past enemy's left edge
          this.playerX < this.enemyX + this.enemyWidth && // Player's left edge is before enemy's right edge
          this.playerY + 50 > this.enemyY && // Player's bottom edge is past enemy's top edge
          this.playerY < this.enemyY + this.enemyHeight // Player's top edge is before enemy's bottom edge
        ) {
          if (!this.itemCollected) {
            this.stop(); // Player dies if the item is not collected
            console.log('Player died!');
          } else {
            this.enemyX = -100; // Move enemy off-screen to simulate death
            this.enemyDefeated = true; // Mark the enemy as defeated
            console.log('Enemy defeated!');
          }
        }

        // Check if the player falls off the platforms
        if (this.playerY > this.groundY) {
          this.stop(); // End the platformer
        }

        // Keep player inside canvas horizontally
        this.playerX = Math.max(0, Math.min(this.playerX, this.canvas.width - 50));

        // Enemy movement logic
        const platformStartX = this.canvas.width / 2 + 50; // Start of the large platform
        const platformEndX = this.canvas.width / 2 + 410; // End of the large platform

        // Move enemy horizontally
        this.enemyX += this.enemySpeedX * this.enemyDirection;

        // Check if the enemy reaches the edges of the platform
        if (this.enemyX <= platformStartX || this.enemyX + this.enemyWidth >= platformEndX) {
          this.enemyDirection *= -1; // Switch direction
        }

        // Randomly switch direction (reduce probability)
        if (Math.random() < 0.005) { // 0.5% chance per frame (less frequent)
          this.enemyDirection *= -1;
        }

        // Prevent enemy from falling off the platform
        this.enemyY = this.groundY - 400 - 100; // Keep enemy aligned with the platform
      }

      draw() {
        if (!this.ctx) return;

        // Draw background image
        if (this.backgroundImage.complete) {
          this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
          // Fallback color if the image hasn't loaded yet
          this.ctx.fillStyle = 'rgba(135, 206, 235, 1)'; // Sky blue
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw ground on the left (smaller width for larger gap)
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(0, this.groundY, this.canvas.width / 6, this.canvas.height - this.groundY);

        // Draw elevated ground on the right (smaller width for larger gap)
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(this.canvas.width - 200, this.groundY - 400, 200, this.canvas.height - (this.groundY - 400));

        // Draw player using the image and flip based on direction
        if (this.playerImage.complete) {
          if (this.playerDirection === 1) {
            // Flip horizontally when facing right
            this.ctx.translate(this.playerX + this.playerWidth, 0); // Translate to the player's position + width
            this.ctx.scale(-1, 1); // Flip horizontally
            this.ctx.drawImage(
              this.playerImage,
              0, // X position after translation
              this.playerY, // Y position
              this.playerWidth, // Width
              this.playerHeight // Height
            );
            // Reset transform after drawing
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
          } else {
            // Draw normally when facing left
            this.ctx.drawImage(
              this.playerImage,
              this.playerX,
              this.playerY,
              this.playerWidth,
              this.playerHeight
            );
          }
          this.ctx.restore(); // Restore the canvas state
        } else {
          // Fallback if the image hasn't loaded yet
          this.ctx.fillStyle = 'red';
          this.ctx.fillRect(this.playerX, this.playerY, this.playerWidth, this.playerHeight);
        }

        // Draw platforms (organized to build up to a large platform)
        const platforms = [
          // Staircase-like platforms leading up to the large platform
          { x: this.canvas.width / 4 - 50, y: this.groundY - 150, width: 60, height: 60, image: this.platformImages[0] },
          { x: this.canvas.width / 4 + 50, y: this.groundY - 200, width: 60, height: 60, image: this.platformImages[1] },

          // Platform right before the big one (two platforms long, moved further to the right)
          { x: this.canvas.width / 2 - 100, y: this.groundY - 300, width: 60, height: 60, image: this.platformImages[0] },
          { x: this.canvas.width / 2 - 40, y: this.groundY - 300, width: 60, height: 60, image: this.platformImages[1] },

          // Large platform made of seven normal-sized platforms
          { x: this.canvas.width / 2 + 50, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[0] },
          { x: this.canvas.width / 2 + 110, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[1] },
          { x: this.canvas.width / 2 + 170, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[2] },
          { x: this.canvas.width / 2 + 230, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[0] },
          { x: this.canvas.width / 2 + 290, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[1] },
          { x: this.canvas.width / 2 + 350, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[2] },
          { x: this.canvas.width / 2 + 410, y: this.groundY - 400, width: 60, height: 60, image: this.platformImages[0] },

          // Two-platform section for the collectible item (moved further to the left again)
          { x: this.canvas.width / 2 - 150, y: this.groundY - 70, width: 60, height: 60, image: this.platformImages[0] },
          { x: this.canvas.width / 2 - 90, y: this.groundY - 70, width: 60, height: 60, image: this.platformImages[1] }
        ];

        for (const platform of platforms) {
          if (platform.image) {
            this.ctx.drawImage(platform.image, platform.x, platform.y, platform.width, platform.height);
          }
        }

        // Draw enemy using the image and flip based on direction
        if (this.enemyImage.complete) {
          this.ctx.save(); // Save the current canvas state
          if (this.enemyDirection === 1) {
            // Flip horizontally when moving right
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
              this.enemyImage,
              -this.enemyX - this.enemyWidth, // Flip X position
              this.enemyY, // Y position
              this.enemyWidth, // Width
              this.enemyHeight // Height
            );
          } else {
            // Draw normally when moving left
            this.ctx.drawImage(
              this.enemyImage,
              this.enemyX, // X position
              this.enemyY, // Y position
              this.enemyWidth, // Width
              this.enemyHeight // Height
            );
          }
          this.ctx.restore(); // Restore the canvas state
        } else {
          // Fallback if the image hasn't loaded yet
          this.ctx.fillStyle = 'blue';
          this.ctx.fillRect(this.enemyX, this.enemyY, this.enemyWidth, this.enemyHeight);
        }

        // Draw NPC using the image
        if (this.npcImage.complete) {
          this.ctx.drawImage(
            this.npcImage,
            this.npcX, // X position
            this.npcY, // Y position
            this.npcWidth, // Width
            this.npcHeight  // Height
          );
        } else {
          // Fallback if the image hasn't loaded yet
          this.ctx.fillStyle = 'green';
          this.ctx.fillRect(this.npcX, this.npcY, this.npcWidth, this.npcHeight);
        }

        // Draw collectible item if not collected
        if (!this.itemCollected) {
          if (this.collectibleImage.complete) {
            this.ctx.drawImage(
              this.collectibleImage,
              this.canvas.width / 2 - 120, // X position
              this.groundY - 110, // Y position (adjusted slightly for better alignment)
              40, // Width
              40  // Height
            );
          } else {
            // Fallback if the image hasn't loaded yet
            this.ctx.fillStyle = 'gold';
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2 - 120, this.groundY - 90, 20, 0, Math.PI * 2); // Gold circle
            this.ctx.fill();
          }
        }
      }
    }

    // Instantiate platformer mini-level
    const platformerMini = new PlatformerMini(gameEnv);

    // Variables to manage RPG pause state
    let isRpgPaused = false;
    let creeperMovementInterval, creeperAnimationInterval;

    // Functions to pause and resume RPG overworld activities
    const pauseRpg = () => {
      if (isRpgPaused) return;
      isRpgPaused = true;

      clearInterval(creeperMovementInterval);
      clearInterval(creeperAnimationInterval);

      // Additional pause logic can be added here (e.g., pause player controls)
    };

    const resumeRpg = () => {
      if (!isRpgPaused) return;
      isRpgPaused = false;

      // Restart creeper intervals
      creeperMovementInterval = setInterval(() => {
        sprite_data_creeper.updatePosition();
      }, 100);

      creeperAnimationInterval = setInterval(() => {
        sprite_data_creeper.playAnimation();
      }, 5000);

      // Additional resume logic can be added here
    };

    // Start creeper movement and animation intervals
    creeperMovementInterval = setInterval(() => {
      sprite_data_creeper.updatePosition();
    }, 100);

    creeperAnimationInterval = setInterval(() => {
      sprite_data_creeper.playAnimation();
    }, 5000);

    // Villager NPC sprite and interaction
    const sprite_src_villager = `${path}/images/gamify/villager.png`;
    const sprite_greet_villager = "Aur aur aur";
    const sprite_data_villager = {
      id: 'Villager',
      greeting: sprite_greet_villager,
      src: sprite_src_villager,
      SCALE_FACTOR: 6,
      ANIMATION_RATE: 100,
      pixels: { width: 700, height: 1400 },
      INIT_POSITION: { x: (width * 10) / 11, y: (height * 1) / 40 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },

      dialogues: [
        "Explore the new terrain?",
        "I love villager life!",
        "Roblox is not better than Minecraft!"
      ],

      reaction() {
        // Prevent default alert; interaction handled below
      },

      interact() {
        if (this.dialogueSystem?.isDialogueOpen()) {
          this.dialogueSystem.closeDialogue();
          return;
        }

        if (!this.dialogueSystem) {
          this.dialogueSystem = new DialogueSystem();
        }

        this.dialogueSystem.showDialogue(
          "Do you wish to explore the plains?",
          "Plains Biome?",
          this.src // villager sprite image
        );

        this.dialogueSystem.addButtons([
          {
            text: "Mountainous Plains",
            primary: true,
            action: () => {
              this.dialogueSystem.closeDialogue();
              pauseRpg();
              platformerMini.onExit = () => {
                resumeRpg();
              };
              platformerMini.start();
            }
          },
          {
            text: "Not Ready",
            action: () => {
              this.dialogueSystem.closeDialogue();
            }
          }
        ]);
      }
    };

    // Export the classes and their data for GameControl or game runner
    this.classes = [
      { class: Background, data: image_data_main },
      { class: Player, data: sprite_data_player },
      { class: Npc, data: sprite_data_villager },
      { class: Creeper, data: sprite_data_creeper },
      { class: GameControl, data: {} }
    ];
  }

  returnToDesert() {
    if (!this.isRunning) return;
    this.isRunning = false;

    // Clean up event listeners and canvas
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);

    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Transition back to GameLevelDesert
    const desertLevel = new GameLevelDesert(this.gameEnv); // Pass gameEnv to GameLevelDesert
    desertLevel.start(); // Start the desert level
  }
}

export default GameLevelOverworld;
