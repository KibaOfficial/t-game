// Copyright (c) 2024 kiba
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const GRID_ROWS = 10;
const GRID_COLS = 10;

class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    array(): [number, number] {
        return [this.x, this.y];
    }
}

function drawLine(
    ctx: CanvasRenderingContext2D,
    p1: Vector2,
    p2: Vector2,
    color: string = 'white',
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
    color: string = 'white'
) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(...p.array(), radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

(() => {
    const game = document.getElementById("game") as (HTMLCanvasElement | null);

    if (game === null) {
        throw new Error('Canvas with the id `game` not found');
    }
    game.width = 800;
    game.height = 800;
    const ctx = game.getContext("2d");
    if (ctx === null) {
        throw new Error("2D context is not supported");
    }
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.scale(ctx.canvas.width / GRID_COLS, ctx.canvas.height / GRID_ROWS);

    for (let x = 0; x <= GRID_COLS; ++x) {
        drawLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), '#303030', 0.1);
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
        drawLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y), '#303030', 0.1);
    }

    let player1 = new Vector2(0.5, 0.5);
    const playerRadius = 0.2;
    const playerColor = 'lightgreen';

    function updateContext(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "#181818";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        for (let x = 0; x <= GRID_COLS; ++x) {
            drawLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS), '#303030', 0.1);
        }
        for (let y = 0; y <= GRID_ROWS; y++) {
            drawLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y), '#303030', 0.1);
        }
        console.log(`[t-game]: Player Pos: ${player1.array()}`)
        drawCircle(ctx, player1, playerRadius, playerColor);
    }

    document.addEventListener('keydown', (event) => {
        const speed = 0.5;
        switch (event.key) {
            case 'w':
            case 'W':
                if (player1.y - speed >= 0) player1.y -= speed;
                console.log('[t-game]: Movement `Up`');
                break;
            case 'a':
            case 'A':
                if (player1.x - speed >= 0) player1.x -= speed;
                console.log('[t-game]: Movement `Left`');
                break;
            case 's':
            case 'S':
                if (player1.y + speed <= GRID_ROWS) player1.y += speed;
                console.log('[t-game]: Movement `Down`');
                break;
            case 'd':
            case 'D':
                if (player1.x + speed <= GRID_COLS) player1.x += speed;
                console.log('[t-game]: Movement `Right`');
                break;
        }
        updateContext(ctx);
    });
    
})()