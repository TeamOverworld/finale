// Updated GameLevel.js
import GameEnv from "./GameEnv.js"

class GameLevel {

  constructor(gameControl) {
    this.gameEnv = new GameEnv()
    this.gameEnv.game = gameControl.game
    this.gameEnv.path = gameControl.path
    this.gameEnv.gameContainer = gameControl.gameContainer
    this.gameEnv.gameCanvas = gameControl.gameCanvas
    this.gameEnv.gameControl = gameControl

    // Store bound resize listener for proper removal later
    this.boundResize = this.resize.bind(this)
  }

  create(GameLevelClass) {
    this.continue = true
    this.gameEnv.create()
    this.gameLevel = new GameLevelClass(this.gameEnv)
    this.gameObjectClasses = this.gameLevel.classes

    // Set current level instance in Game
    if (typeof Game !== 'undefined' && Game.setCurrentLevelInstance) {
        Game.setCurrentLevelInstance(this.gameLevel);
    }

    for (let gameObjectClass of this.gameObjectClasses) {
        if (!gameObjectClass.data) gameObjectClass.data = {}
        let gameObject = new gameObjectClass.class(gameObjectClass.data, this.gameEnv)
        this.gameEnv.gameObjects.push(gameObject)
    }

    if (typeof this.gameLevel.initialize === "function") {
        this.gameLevel.initialize()
    }

    window.addEventListener("resize", this.boundResize)
  }

  destroy() {
    if (typeof this.gameLevel.destroy === "function") {
      this.gameLevel.destroy()
    }

    // Properly clean up all game objects
    for (let index = this.gameEnv.gameObjects.length - 1; index >= 0; index--) {
      // Make sure each object's destroy method is called to clean up event listeners
      if (typeof this.gameEnv.gameObjects[index].destroy === "function") {
        this.gameEnv.gameObjects[index].destroy()
      }
    }

    // Clear out the game objects array
    this.gameEnv.gameObjects = [];
    
    window.removeEventListener("resize", this.boundResize)
  }

  update() {
    this.gameEnv.clear()

    for (let gameObject of this.gameEnv.gameObjects) {
      if (typeof gameObject.update === "function") {
        gameObject.update()
      }
    }

    if (typeof this.gameLevel.update === "function") {
      this.gameLevel.update()
    }
  }

  resize() {
    this.gameEnv.resize()
    for (let gameObject of this.gameEnv.gameObjects) {
      if (typeof gameObject.resize === "function") {
        gameObject.resize()
      }
    }
  }
}

export default GameLevel
