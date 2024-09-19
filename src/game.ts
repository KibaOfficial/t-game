// Copyright (c) 2024 kiba
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GRID_COLS, GRID_ROWS } from "./config.js";

let GAMERUN = false;

type InputManagerTypes = 'keyboard' | 'mouse';

/**
 * Represents a 2D player object with position, radius, color, and speed.
 */
class Player {
  position: Vector2;
  radius: number;
  color: string;
  speed: number;

  /**
   * Constructs a new Player instance.
   * @param {Vector2} position - The position of the player as a Vector2.
   * @param {number} [radius=0.2] - The radius of the player. Default is 0.2.
   * @param {string} [color="lightgreen"] - The color of the player. Default is "lightgreen".
   * @param {number} [speed=1.0] - The movement speed of the player. Default is 1.0.
   */
  constructor(
    position: Vector2,
    radius: number = 0.2,
    color: string = "lightgreen",
    speed: number = 1.0
  ) {
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
  }

  /**
 * Moves the player in the specified direction, constrained by the grid boundaries and considering the player's radius.
 * @param {Vector2} direction - The direction to move the player, as a Vector2.
 * @returns {void}
 */
  move(direction: Vector2): void {
    const normalizedDirection = direction.normalize();
    const deltaX = normalizedDirection.x * this.speed;
    const deltaY = normalizedDirection.y * this.speed;

    const newX = this.position.x + deltaX;
    const newY = this.position.y + deltaY;

    // Ensure player stays within the grid boundaries, considering the radius
    if (newX - this.radius >= 0 && newX + this.radius <= GRID_COLS) {
      this.position.x = newX;
    }
    if (newY - this.radius >= 0 && newY + this.radius <= GRID_ROWS) {
      this.position.y = newY;
    }
  }

  /**
   * Draws the player as a circle on the canvas.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
   * @returns {void}
   */
  draw(ctx: CanvasRenderingContext2D): void {
    drawCircle(ctx, this.position, this.radius, this.color);
  }
}

/**
 * Represents a 2D vector with x and y components.
 */
class Vector2 {
  x: number;
  y: number;

  /**
   * Constructs a new Vector2 instance.
   * @param {number} x - The x-coordinate of the vector.
   * @param {number} y - The y-coordinate of the vector.
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Adds another Vector2 to this vector.
   * @param {Vector2} other - The other vector to add.
   * @returns {void}
   */
  add(other: Vector2): void {
    this.x += other.x;
    this.y += other.y;
  }

  /**
   * Returns an array representation of the vector.
   * @returns {[number, number]} An array containing the x and y components of the vector.
   */
  array(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Normalizes the vector (scales it to unit length).
   * @returns {Vector2} A new normalized vector.
   */
  normalize(): Vector2 {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length > 0) {
      return new Vector2(this.x / length, this.y / length);
    }
    return new Vector2(0, 0);
  }
}

/**
 * Manages input from either the keyboard or the mouse.
 */
class InputManager {
  private type: InputManagerTypes;
  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();
  private mousePosition: Vector2 = new Vector2(0, 0);

  /**
   * Constructs a new InputManager instance.
   * @param {InputManagerTypes} [type='keyboard'] - The type of input to manage ('keyboard' or 'mouse').
   */
  constructor(type: InputManagerTypes = 'keyboard') {
    this.type = type;
    if (type === 'keyboard') {
      document.addEventListener("keydown", this.onKeyDown.bind(this));
      document.addEventListener("keyup", this.onKeyUp.bind(this));
    }
    if (type === 'mouse') {
      document.addEventListener("mousedown", this.onMouseDown.bind(this));
      document.addEventListener("mouseup", this.onMouseUp.bind(this));
      document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }
  }

  /**
   * Handles the keydown event for keyboard input.
   * @param {KeyboardEvent} event - The keydown event.
   * @returns {void}
   */
  private onKeyDown(event: KeyboardEvent): void {
    if (this.type === 'keyboard') {
      this.keys.add(event.key.toLowerCase());
    }
  }

  /**
   * Handles the keyup event for keyboard input.
   * @param {KeyboardEvent} event - The keyup event.
   * @returns {void}
   */
  private onKeyUp(event: KeyboardEvent): void {
    if (this.type === 'keyboard') {
      this.keys.delete(event.key.toLowerCase());
    }
  }

  /**
   * Handles the mousedown event for mouse input.
   * @param {MouseEvent} event - The mousedown event.
   * @returns {void}
   */
  private onMouseDown(event: MouseEvent): void {
    if (this.type === 'mouse') {
      this.mouseButtons.add(event.button);
    }
  }

  /**
   * Handles the mouseup event for mouse input.
   * @param {MouseEvent} event - The mouseup event.
   * @returns {void}
   */
  private onMouseUp(event: MouseEvent): void {
    if (this.type === 'mouse') {
      this.mouseButtons.delete(event.button);
    }
  }

  /**
   * Handles the mousemove event for mouse input.
   * @param {MouseEvent} event - The mousemove event.
   * @returns {void}
   */
  private onMouseMove(event: MouseEvent): void {
    if (this.type === 'mouse') {
      this.mousePosition = new Vector2(event.offsetX, event.offsetY);
    }
  }

  /**
   * Returns the current mouse position.
   * @returns {Vector2} The current mouse position as a Vector2.
   */
  getMousePosition(): Vector2 {
    return this.mousePosition;
  }

  /**
   * Checks if a specific mouse button is pressed.
   * @param {number} button - The mouse button to check (0 for left, 1 for middle, 2 for right).
   * @returns {boolean} True if the button is pressed, false otherwise.
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  /**
   * Checks if a specific key is pressed.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is pressed, false otherwise.
   */
  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }
}

class Wall {
  position: Vector2;
  width: number;
  height: number;
  color: string;

  constructor(position: Vector2, width: number, height: number, color: string = "gray") {
    this.position = position;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(...this.position.array(), this.width, this.height);
    ctx.restore();
  }
}

/**
 * Draws a line on the canvas between two points.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {Vector2} p1 - The starting point of the line.
 * @param {Vector2} p2 - The ending point of the line.
 * @param {string} [color="white"] - The color of the line. Default is white.
 * @param {number} [lineWidth=1] - The width of the line. Default is 1.
 * @returns {void}
 */
function drawLine(
  ctx: CanvasRenderingContext2D,
  p1: Vector2,
  p2: Vector2,
  color: string = "white",
  lineWidth: number = 1
): void {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.moveTo(...p1.array());
  ctx.lineTo(...p2.array());
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a circle on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {Vector2} p - The center point of the circle.
 * @param {number} radius - The radius of the circle.
 * @param {string} [color="white"] - The color of the circle. Default is white.
 * @returns {void}
 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  p: Vector2,
  radius: number,
  color: string = "white"
): void {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(...p.array(), radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a grid on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {string} [color="#303030"] - The color of the grid lines. Default is #303030.
 * @returns {void}
 */
function drawGrid(ctx: CanvasRenderingContext2D, color: string = "#303030"): void {
  for (let x = 0; x <= GRID_COLS; ++x) {
    drawLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), color, 0.1);
  }
  for (let y = 0; y <= GRID_ROWS; y++) {
    drawLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y), color, 0.1);
  }
}

/**
 * Clears the canvas and executes the provided drawing function.
 * @param {CanvasRenderingContext2D | null} ctx - The 2D rendering context of the canvas, or null if not available.
 * @param {(ctx: CanvasRenderingContext2D) => void} drawFn - The function responsible for drawing on the canvas.
 * @returns {void}
 */
function updateLayer(
  ctx: CanvasRenderingContext2D | null,
  drawFn: (ctx: CanvasRenderingContext2D) => void
): void {
  if (ctx === null) {
    return;
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawFn(ctx);
}

/**
 * Draws the current frame rate (FPS) on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @param {number} frameCount - The current frame count to display.
 * @returns {void}
 */
function drawFPS(ctx: CanvasRenderingContext2D, frameCount: number): void {
  const metrics = ctx.measureText(`FPS: ${frameCount}`);
  if (metrics && ctx) {
    const fontHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.fillText(
      `FPS: ${frameCount}`,
      ctx.canvas.width - metrics.width - 10,
      fontHeight + 10,
      100
    );
  }
}

/**
 * Updates the frame rate (FPS) display on the canvas and logs the current FPS to the console.
 * Resets the frame count every second.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the UI canvas where the FPS will be drawn.
 * @param {number} lastFPS - The timestamp of the last FPS update.
 * @param {number} frameCount - The current count of frames rendered since the last FPS update.
 * @returns {{ lastFPS: number, frameCount: number }} An object containing the updated lastFPS timestamp and the reset frameCount.
 */
function updateFPS(ctx: CanvasRenderingContext2D, lastFPS: number, frameCount: number): { lastFPS: number; frameCount: number; } {
  if (performance.now() > lastFPS + 1000) {
    lastFPS = performance.now();
    drawFPS(ctx, frameCount);
    console.log(`[t-game]: FPS: ${frameCount}`);
    frameCount = 0;
  }
  return { lastFPS, frameCount };
}

/**
 * Handles player input and calculates the movement vector based on the currently pressed keys.
 * Normalizes the movement vector if it has a non-zero length.
 *
 * @param {Player} player - The player object whose movement speed is considered.
 * @param {InputManager} inputManager - The input manager instance to check for key presses.
 * @param {number} dt - The delta time since the last frame, used to scale movement.
 * @returns {Vector2} The normalized movement vector based on player input, or a zero vector if no keys are pressed.
 */
function handleInput(player: Player, inputManager: InputManager, dt: number): Vector2 {
  let movement: Vector2 = new Vector2(0, 0);
  if (inputManager.isKeyPressed("w") || inputManager.isKeyPressed("arrowup")) movement.add(new Vector2(0, -player.speed * dt));
  if (inputManager.isKeyPressed("s")  || inputManager.isKeyPressed("arrowdown")) movement.add(new Vector2(0, player.speed * dt));
  if (inputManager.isKeyPressed("a")  || inputManager.isKeyPressed("arrowleft")) movement.add(new Vector2(-player.speed * dt, 0));
  if (inputManager.isKeyPressed("d")  || inputManager.isKeyPressed("arrowright")) movement.add(new Vector2(player.speed * dt, 0));

  return movement.x !== 0 || movement.y !== 0 ? movement.normalize() : new Vector2(0, 0);
}

/**
 * Initializes the main canvases for the game (background, objects, events, and UI).
 * Sets the dimensions of each canvas and retrieves their 2D rendering contexts.
 *
 * @returns {{ bgCtx: CanvasRenderingContext2D, objCtx: CanvasRenderingContext2D, evtCtx: CanvasRenderingContext2D, uiCtx: CanvasRenderingContext2D }} 
 * An object containing the 2D rendering contexts for each of the main canvases.
 * @throws {Error} If any of the canvases cannot be found or if their 2D context is not supported.
 */
function initCanvas(): {
  bgCtx: CanvasRenderingContext2D;
  objCtx: CanvasRenderingContext2D;
  evtCtx: CanvasRenderingContext2D;
  uiCtx: CanvasRenderingContext2D;
} {
  const gameBackground = document.getElementById("background") as HTMLCanvasElement | null;
  const gameObjects = document.getElementById("objects") as HTMLCanvasElement | null;
  const gameEvents = document.getElementById("events") as HTMLCanvasElement | null;
  const gameUi = document.getElementById("ui") as HTMLCanvasElement | null;

  if (
    gameBackground === null ||
    gameObjects === null ||
    gameEvents === null ||
    gameUi === null
  ) {
    throw new Error("One or more canvases not found");
  }

  gameBackground.width = 800;
  gameBackground.height = 800;
  gameObjects.width = 800;
  gameObjects.height = 800;
  gameEvents.width = 800;
  gameEvents.height = 800;
  
  const bgCtx = gameBackground.getContext("2d");
  const objCtx = gameObjects.getContext("2d");
  const evtCtx = gameEvents.getContext("2d");
  const uiCtx = gameUi.getContext("2d");
  
  if (bgCtx === null || objCtx === null || evtCtx === null || uiCtx === null) {
    throw new Error("2D context is not supported on one or more canvases");
  }

  [bgCtx, objCtx, evtCtx].forEach((ctx) => {
    ctx.scale(ctx.canvas.width / GRID_COLS, ctx.canvas.height / GRID_ROWS);
  });

  return { bgCtx, objCtx, evtCtx, uiCtx };
}

/**
 * Initializes the background of the game by clearing the canvas and drawing
 * a filled rectangle along with a grid.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas where the background will be drawn.
 * @returns {void}
 */
function initBackground(ctx: CanvasRenderingContext2D): void {
  updateLayer(ctx, (ctx) => {
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(ctx);
  });
}


/**
 * Initializes a new player instance and draws it on the specified canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas where the player will be drawn.
 * @returns {Player} The newly created Player instance.
 */
function initPlayer(ctx: CanvasRenderingContext2D): Player {
  const player = new Player(new Vector2(0.5, 0.5), 0.2, "lightgreen", 0.05);
  player.draw(ctx);
  return player;
}


(() => {
  const { bgCtx, objCtx, evtCtx, uiCtx } = initCanvas();
  const player = initPlayer(objCtx);
  const inputManager = new InputManager("keyboard");

  initBackground(bgCtx);

  let lastTime = performance.now();
  let lastFPS = performance.now();
  let frameCount = 0;

  function gameLoop(currentTime: number) {
    if (!GAMERUN) return;

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    ({ lastFPS, frameCount } = updateFPS(uiCtx, lastFPS, frameCount));
    frameCount++;

    const movement = handleInput(player, inputManager, dt);
    player.move(movement);

    updateLayer(objCtx, (ctx) => {
      player.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
  }

  GAMERUN = true;
  gameLoop(performance.now());
})();

