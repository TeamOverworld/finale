// GameSetterOverworld.js Key objective: Minecraft-themed platformer level
import GameSet from './GameSet.js';
import BackgroundParallax from './BackgroundParallax.js';
import BackgroundTransitions from './BackgroundTransitions.js';
import Platform from './Platform.js';
import JumpPlatform from './PlatformJump.js';
import PlayerOverworld from './PlayerOverworld.js';
import Zombie from './EnemyZombie.js';
import Chicken from './Chicken.js';
import Sword from './Sword.js';
import MovingPlatform from './PlatformMoving.js';
import Coin from './Coin.js';
import FinishLine from './FinishLine.js';
import BlockPlatform from './BlockPlatform.js';
import Sword from './Sword.js';

// Minecraft-themed asset definitions
const assets = {
  obstacles: {
    sword: {
      src: "/images/platformer/sprites/sword.png",
      width: 64,
      height: 64,
      scaleSize: 50,
    },
  },
  platforms: {
    grass: { src: "/images/platformer/platforms/grass_block.jpg" },
    stoneblock: { src: "/images/platformer/platforms/stone_block.jpg" },
    stonebrick: { src: "/images/platformer/platforms/stone_brick.png" },
  },
  backgrounds: {
    clouds: { src: "/images/platformer/backgrounds/mcclouds.png", parallaxSpeed: 0.2 },
    taiga: { src: "/images/platformer/backgrounds/taiga.png", parallaxSpeed: 0.1 },
  },
  transitions: {
    loading: { src: "/images/platformer/transitions/loading.jpg" },
  },
  players: {
    steve: {
      src: "/images/platformer/sprites/steve.png",
      width: 256,
      height: 256,
      scaleSize: 80,
      speedRatio: 0.7,
      idle: { left: { row: 1, frames: 15 }, right: { row: 0, frames: 15 } },
      walk: { left: { row: 3, frames: 7 }, right: { row: 2, frames: 7 } },
      jump: { left: { row: 11, frames: 15 }, right: { row: 10, frames: 15 } },
      hitbox: { widthPercentage: 0.3, heightPercentage: 0.8 }
    },
  },
  enemies: {
    zombie: {
      src: "/images/platformer/sprites/mczombie.png",
      width: 256,
      height: 256,
      scaleSize: 70,
      speedRatio: 0.5,
      hitbox: { widthPercentage: 0.3, heightPercentage: 0.8 }
    },
  },
  chickens: {
    chicken: {
      src: "/images/platformer/sprites/chicken.png",
      width: 128,
      height: 128,
      scaleSize: 50,
    },
  }
};

// Game objects for the Minecraft-themed overworld level
const objects = [
  // Backgrounds
  { name: 'clouds', id: 'background', class: BackgroundParallax, data: assets.backgrounds.clouds },
  { name: 'taiga', id: 'background', class: BackgroundParallax, data: assets.backgrounds.taiga },

  // Platforms
  { name: 'grass', id: 'floor', class: Platform, data: assets.platforms.grass },
  { name: 'stoneblock1', id: 'jumpPlatform', class: BlockPlatform, data: assets.platforms.stoneblock, xPercentage: 0.2, yPercentage: 0.85 },
  { name: 'stoneblock2', id: 'jumpPlatform', class: BlockPlatform, data: assets.platforms.stoneblock, xPercentage: 0.4, yPercentage: 0.7 },
  { name: 'stonebrick', id: 'jumpPlatform', class: JumpPlatform, data: assets.platforms.stonebrick, xPercentage: 0.6, yPercentage: 0.6 },

  // Sword item - must be picked up before fighting the zombie
  { name: 'sword', id: 'sword', class: Sword, data: assets.obstacles.sword, xPercentage: 0.6, yPercentage: 0.55 },

  // Player
  { name: 'steve', id: 'player', class: PlayerOverworld, data: assets.players.steve },

  // Zombie enemy
  { name: 'zombie', id: 'zombie', class: Zombie, data: assets.enemies.zombie, xPercentage: 0.75, yPercentage: 1 },

  // Chicken at the end - unlocks finish line only if zombie is dead
  { name: 'chicken', id: 'chicken', class: Chicken, data: assets.chickens.chicken, xPercentage: 0.9, yPercentage: 0.85 },

  // Finish line (will be accessible only after slaying the zombie & interacting with chicken)
  { name: 'finish', id: 'finishline', class: FinishLine, data: assets.platforms.wood, xPercentage: 0.95, yPercentage: 0.85 },

  // Loading screen
  { name: 'loading', id: 'background', class: BackgroundTransitions, data: assets.transitions.loading },
];

const GameSetterOverworld = {
  tag: 'Overworld',
  assets: assets,
  objects: objects
};

export default GameSetterOverworld;
