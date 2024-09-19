// Copyright (c) 2024 kiba
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const GRID_ROWS = 10;
const GRID_COLS = 10;
let GAMERUN = false;
let FPS = 60;
let frameDuration = 1000 / FPS;

class Player {
  position: Vector2;
  radius: number;
  color: string;
  speed: number;

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

  move(direction: Vector2) {
    const normalizedDirection = direction.normalize();
    const deltaX = normalizedDirection.x * this.speed;
    const deltaY = normalizedDirection.y * this.speed;

    const newX = this.position.x + deltaX;
    const newY = this.position.y + deltaY;

    if (newX >= 0 && newX <= GRID_COLS) {
      this.position.x = newX;
    }
    if (newY >= 0 && newY <= GRID_ROWS) {
      this.position.y = newY;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    drawCircle(ctx, this.position, this.radius, this.color);
  }
}
class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2) {
    this.x += other.x;
    this.y += other.y;
  }

  array(): [number, number] {
    return [this.x, this.y];
  }

  normalize(): Vector2 {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length > 0) {
      return new Vector2(this.x / length, this.y / length);
    }
    return new Vector2(0, 0);
  }
}

type InputManagerTypes = 'keyboard' | 'mouse';

class InputManager {
  private type: InputManagerTypes;
  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();
  private mousePosition: Vector2 = new Vector2(0, 0);


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

  private onKeyDown(event: KeyboardEvent) {
    if (this.type === 'keyboard') {
      this.keys.add(event.key.toLowerCase());
    }
  }
  
  private onKeyUp(event: KeyboardEvent) {
    if (this.type === 'keyboard') {
      this.keys.delete(event.key.toLowerCase());
    }
  }
  
  private onMouseDown(event: MouseEvent) {
    if (this.type === 'mouse') {
      this.mouseButtons.add(event.button);
    }
  }
  
  private onMouseUp(event: MouseEvent) {
    if (this.type === 'mouse') {
      this.mouseButtons.delete(event.button);
    }
  }
  
  private onMouseMove(event: MouseEvent) {
    if (this.type === 'mouse') {
      this.mousePosition = new Vector2(event.offsetX, event.offsetY);
    }
  }  

  getMousePosition(): Vector2 {
    return this.mousePosition;
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }


  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  p1: Vector2,
  p2: Vector2,
  color: string = "white",
  lineWidth: number = 1
) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.moveTo(...p1.array());
  ctx.lineTo(...p2.array());
  ctx.stroke();
  ctx.restore();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  p: Vector2,
  radius: number,
  color: string = "white"
) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(...p.array(), radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D, color: string = "#303030") {
  for (let x = 0; x <= GRID_COLS; ++x) {
    drawLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), color, 0.1);
  }
  for (let y = 0; y <= GRID_ROWS; y++) {
    drawLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y), color, 0.1);
  }
}

function updateLayer(
  ctx: CanvasRenderingContext2D | null,
  drawFn: (ctx: CanvasRenderingContext2D) => void
) {
  if (ctx === null) {
    return;
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawFn(ctx);
}

function drawFPS(ctx: CanvasRenderingContext2D, frameCount: number) {
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

const bgCtx = gameBackground.getContext("2d");
const objCtx = gameObjects.getContext("2d");
const evtCtx = gameEvents.getContext("2d");
const uiCtx = gameUi.getContext("2d");

if (bgCtx === null || objCtx === null || evtCtx === null || uiCtx === null) {
  throw new Error("2D context is not supported on one or more canvases");
}

(async () => {
  gameBackground.width = 800;
  gameBackground.height = 800;
  gameObjects.width = 800;
  gameObjects.height = 800;
  gameEvents.width = 800;
  gameEvents.height = 800;

  [bgCtx, objCtx, evtCtx].forEach((ctx) => {
    ctx.scale(ctx.canvas.width / GRID_COLS, ctx.canvas.height / GRID_ROWS);
  });

  let player1 = new Player(new Vector2(0.5, 0.5), 0.2, "lightgreen", 0.05);
  player1.draw(objCtx);

  updateLayer(bgCtx, (ctx) => {
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(bgCtx);
  });

  let lastTime = performance.now();
  let lastFPS = performance.now();
  let frameCount = 0;

  const inputManager = new InputManager("keyboard");
  let paused = false;
  let lastPausePressed = false

  function gameLoop(currentTime: number) {
    if (!GAMERUN) return;

    const pausePressed = inputManager.isKeyPressed("Escape");
    
    if (pausePressed && !lastPausePressed) {
        paused = !paused;
        console.log(`[t-game]: Game ${paused ? "Paused" : "Resumed"}`);
    }

    if (paused) {
      requestAnimationFrame(gameLoop)
      return;
    }

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (currentTime > lastFPS + 1000) {
      lastFPS = currentTime;
      if (uiCtx) drawFPS(uiCtx, frameCount);
      console.log(`[t-game]: FPS: ${frameCount}`);
      frameCount = 0;
    }
    frameCount++;

    let movement: Vector2 = new Vector2(0, 0);
    if (inputManager.isKeyPressed("w")) movement.add(new Vector2(0, -player1.speed * dt));
    if (inputManager.isKeyPressed("s")) movement.add(new Vector2(0, player1.speed * dt));
    if (inputManager.isKeyPressed("a")) movement.add(new Vector2(-player1.speed * dt, 0));
    if (inputManager.isKeyPressed("d")) movement.add(new Vector2(player1.speed * dt, 0));

    if (movement.x !== 0 || movement.y !== 0) movement.normalize();

    player1.move(movement);
    console.log(`[t-game]: Player Movement: ${movement.array()}`);

    updateLayer(objCtx, (ctx) => {
      player1.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
  }

  GAMERUN = true;
  gameLoop(performance.now());
})();
