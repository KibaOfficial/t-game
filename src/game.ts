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
    speed: number
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
      this.x /= length;
      this.y /= length;
    }
    return this;
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
    ctx.fillText(
      `FPS: ${frameCount}`,
      ctx.canvas.width - metrics.width - 10,
      fontHeight + 10,
      100
    );
  }
}

const gameBackground = document.getElementById(
  "background"
) as HTMLCanvasElement | null;
const gameObjects = document.getElementById(
  "objects"
) as HTMLCanvasElement | null;
const gameEvents = document.getElementById(
  "events"
) as HTMLCanvasElement | null;
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

let moveUp = false;
let moveDown = false;
let moveLeft = false;
let moveRight = false;

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
    case "W":
      moveUp = true;
      console.log("[t-game]: `keydown` Movement `Up`");
      break;
    case "a":
    case "A":
      moveLeft = true;
      console.log("[t-game]: `keydown` Movement `Left`");
      break;
    case "s":
    case "S":
      moveDown = true;
      console.log("[t-game]: `keydown` Movement `Down`");
      break;
    case "d":
    case "D":
      moveRight = true;
      console.log("[t-game]: `keydown` Movement `Right`");
      break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "w":
    case "W":
      moveUp = false;
      console.log("[t-game]: `keyup` Movement `Up`");
      break;
    case "a":
    case "A":
      moveLeft = false;
      console.log("[t-game]: `keyup` Movement `Left`");
      break;
    case "s":
    case "S":
      moveDown = false;
      console.log("[t-game]: `keyup` Movement `Down`");
      break;
    case "d":
    case "D":
      moveRight = false;
      console.log("[t-game]: `keyup` Movement `Right`");
      break;
  }
});

let speed: number;

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

  function gameLoop(currentTime: number) {
    if (!GAMERUN) return;
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
    if (moveUp) movement.add(new Vector2(0, -player1.speed * dt));
    if (moveDown) movement.add(new Vector2(0, player1.speed * dt));
    if (moveLeft) movement.add(new Vector2(-player1.speed * dt, 0));
    if (moveRight) movement.add(new Vector2(player1.speed * dt, 0));

    if (movement.x !== 0 || movement.y !== 0) movement.normalize();

    // movement.x *= player1.speed;
    // movement.y *= player1.speed;

    player1.move(movement);
    console.log(`[t-game]: Player Movement: ${movement.array()}`);

    updateLayer(objCtx, (ctx) => {
      player1.draw(ctx);
    });

    if (dt > frameDuration) {
      requestAnimationFrame(gameLoop);
    } else {
      setTimeout(() => requestAnimationFrame(gameLoop), frameDuration - dt);
    }
  }

  GAMERUN = true;
  gameLoop(performance.now());
})();
