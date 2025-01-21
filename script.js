// Select DOM elements
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const generateMazeButton = document.getElementById('generate-maze');
const solveMazeButton = document.getElementById('solve-maze');

// Maze and player configuration
let maze = [];
let mazeSize = parseInt(45);
let cellSize = canvas.width / mazeSize;
let player = { x: 0, y: 0 };

// Helper function to shuffle directions
function shuffleDirections() {
    const directions = [
        [0, -1], // Up
        [0, 1],  // Down
        [-1, 0], // Left
        [1, 0],  // Right
    ];
    for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    return directions;
}

// Check if a cell is within bounds
function isInBounds(x, y) {
    return x > 0 && y > 0 && x < mazeSize - 1 && y < mazeSize - 1;
}

// Recursive function to carve the maze
function carveMaze(x, y) {
    const directions = shuffleDirections();
    for (let [dx, dy] of directions) {
        const nx = x + dx * 2; // Skip two cells in the chosen direction
        const ny = y + dy * 2;

        if (isInBounds(nx, ny) && maze[ny][nx] === 1) {
            // Carve the wall between the current cell and the next cell
            maze[y + dy][x + dx] = 0;
            maze[ny][nx] = 0;

            // Recurse from the new cell
            carveMaze(nx, ny);
        }
    }
}

// Generate the maze using recursive backtracking
function generateMaze(size) {
    mazeSize = size;
    cellSize = canvas.width / mazeSize;
    maze = Array.from({ length: size }, () => Array(size).fill(1)); // Start with walls

    const startX = 1, startY = 1; // Starting cell
    maze[startY][startX] = 0; // Open the start cell

    carveMaze(startX, startY); // Begin recursive carving

    maze[size - 2][size - 2] = 0; // Open an exit at the bottom-right
    player = { x: 1, y: 1 }; // Reset player position
    drawMaze();
}

// Draw the maze on the canvas
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < mazeSize; row++) {
        for (let col = 0; col < mazeSize; col++) {
            ctx.fillStyle = maze[row][col] === 1 ? '#000' : '#fff';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Draw the goal
    ctx.fillStyle = 'red';
    ctx.fillRect((mazeSize - 2) * cellSize, (mazeSize - 2) * cellSize, cellSize, cellSize);

    // Draw the player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);
}

// Check if player reached the goal
function checkGoal() {
    if (player.x === mazeSize - 2 && player.y === mazeSize - 2) {
        alert('You finished the maze!');
        generateMaze(mazeSize);
    }
}

// Handle player movement
function movePlayer(direction) {
    const { x, y } = player;
    if (direction === 'ArrowUp' && y > 0 && maze[y - 1][x] === 0) player.y--;
    if (direction === 'ArrowDown' && y < mazeSize - 1 && maze[y + 1][x] === 0) player.y++;
    if (direction === 'ArrowLeft' && x > 0 && maze[y][x - 1] === 0) player.x--;
    if (direction === 'ArrowRight' && x < mazeSize - 1 && maze[y][x + 1] === 0) player.x++;
    drawMaze();
    checkGoal();
}

function solveMaze() {
    const queue = [];
    const visited = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(false));
    const parent = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(null));

    const startX = 1, startY = 1;
    const endX = mazeSize - 2, endY = mazeSize - 2;

    // Start BFS from the player position
    queue.push([startX, startY]);
    visited[startY][startX] = true;

    // Directions for movement
    const directions = [
        [0, -1], // Up
        [0, 1],  // Down
        [-1, 0], // Left
        [1, 0],  // Right
    ];

    while (queue.length > 0) {
        const [x, y] = queue.shift();

        // Check if we've reached the goal
        if (x === endX && y === endY) {
            drawSolutionPath(parent, endX, endY);
            return;
        }

        // Explore neighbors
        for (let [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy;
            if (isInBounds(nx, ny) && maze[ny][nx] === 0 && !visited[ny][nx]) {
                queue.push([nx, ny]);
                visited[ny][nx] = true;
                parent[ny][nx] = [x, y]; // Track the path
            }
        }
    }

    alert('No solution found!');
}

// Draw the solution path
function drawSolutionPath(parent, endX, endY) {
    let x = endX, y = endY;

    ctx.fillStyle = 'yellow'; // Path color
    while (x !== 1 || y !== 1) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        [x, y] = parent[y][x];
    }
}


// Event listeners
generateMazeButton.addEventListener('click', () => {
    generateMaze(mazeSize);
});

solveMazeButton.addEventListener('click', solveMaze);

document.addEventListener('keydown', (e) => {
    movePlayer(e.key);
});

// Initial setup
generateMaze(mazeSize);
