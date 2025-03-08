let game = document.getElementById("game");

let pressedKeys = {}
addEventListener("keydown", (e) => {
    pressedKeys[e.code] = true;
})
addEventListener("keyup", (e) => {
    pressedKeys[e.code] = false;
})

const getFPS = () =>
    new Promise(resolve =>
        requestAnimationFrame(t1 =>
            requestAnimationFrame(t2 => resolve(1000 / (t2 - t1)))
        )
    )

let fps
getFPS().then(f => {
    // noinspection JSCheckFunctionSignatures
    fps = Math.ceil(f)
    halfFps = fps / 2;
});

function collisionCheck(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

function runStart(elem) {
    setTimeout(()=>{elem.hidden = true;}, 500)
    setTimeout(startGame, 500)
}

let epilepsy = null;

function startGame() {
    {
        let data = localStorage.getItem("epilepsy")
        if (data) {
            epilepsy = Boolean(Number(data))
        }
    }
    if (epilepsy === null) {
        epilepsy = confirm("Before we start, just one question. (This wont be asked again). Do you have epilepsy? OK for yes. Cancel for NO")
        localStorage.setItem("epilepsy", epilepsy?"1":"0")
    }

    setupGame();
    startAnimation1()
}

let runner = document.getElementById("runner_running");
let ground = document.getElementById("ground");

let gameIsOver = false;
let gameRunning = false;

function onFullScreenChange(){
    if (gameIsOver) {
        return;
    }

    let pos = parseInt(runner.style.top);

    // noinspection GrazieInspection
    if (document.fullscreenElement){
        // We just entered fullscreen
        // We will have to move the runner down to the ground again

        // Move until in ground
        while (!collisionCheck(runner, ground)) {
            pos++;
            runner.style.top = pos + "px";
        }
        // Move out of ground
        pos--;
        runner.style.top = pos + "px";

    } else {
        // We just exited fullscreen
        // We will have to raise the runner up to the ground again

        // Move out of ground
        while (collisionCheck(runner, ground)) {
            pos--;
            runner.style.top = pos + "px";
        }
    }
}

function fixRunnerPosition(){
    let pos = parseInt(runner.style.top);

    while (!collisionCheck(runner, ground)) {
        pos++;
        runner.style.top = pos + "px";
    }
    while (collisionCheck(runner, ground)) {
        pos--;
        runner.style.top = pos + "px";
    }
}

let runnerPos;

function setupGame(){
    game.requestFullscreen().then(()=>{
        document.getElementById("fs").hidden = false;
        setTimeout(()=>{game.addEventListener("fullscreenchange", onFullScreenChange)}, 100);
    })
    ground.hidden = false;
    runner.style.top = "-10px"
    runner.hidden = false;
    gameRunning = true;
    game.focus();
}

function startAnimation1(pos) {
    if (!pos) {pos = -10}

    let collide = collisionCheck(runner, ground)

    console.log("Colliding? ", collide)

    if (collide) {
        runnerPos = pos;
        gameLoop();
        return;
    }

    pos+=3;
    runner.style.top = pos + "px";

    setTimeout(startAnimation1, 10, pos);
}

let lastFrameRequest;

let clearOnGameOver = [];


let speed = 2.25;

function gameLoop() {
    lastFrameRequest = window.requestAnimationFrame(onFrame)

    // Increase speed every 30 seconds
    clearOnGameOver.push(setInterval(()=>{
        console.log("Speeding up.")
        speed++;
    }, 30000));
}


function onFrame() {
    manageKeys();
    shiftLeft();
    manageObstacles();
    manageJump();
    checkCollisions();

    if (!gameIsOver) {
        // Rerequest the frame
        lastFrameRequest = window.requestAnimationFrame(onFrame);
    }
}

function gameOver(){
    let GO = document.getElementById("gameOver");
    function evil() {
        GO.style.backgroundColor = "#" + Math.floor(Math.random()*16777215).toString(16)
    }

    gameIsOver = true;
    gameRunning = false;

    for (const toClear of clearOnGameOver) {
        clearInterval(toClear);
    }

    window.cancelAnimationFrame(lastFrameRequest);
    document.getElementById("fs").hidden = true;
    document.getElementById("ng").hidden = false;
    game.hidden = true;
    GO.hidden = false;
    if (!epilepsy) {
        setInterval(evil, 10);
    }

}

function manageKeys(){
    if (pressedKeys["ArrowUp"] || pressedKeys["Space"]){
        jump();
    }
}

let obstacles = [];

function manageObstacles() {

    addNewObstacles();
    removeOldObstacles();
}

function addNewObstacles() {
    let html_obstacles = document.getElementById("obstacles");
    function addSpike() {
        let spike = document.createElement("img");
        spike.classList.add("spike");
        spike.src = "assets/spike.png";
        spike.style.left = "2000px";
        console.log("Adding an obstacle!")
        html_obstacles.appendChild(spike);
        obstacles.push(spike);
    }

    if (obstacles.length === 0){
        addSpike();
    }
}

function removeOldObstacles() {
    let i = obstacles.length;
    while (i--){
        let obstacle = obstacles[i];

        let rect = obstacle.getBoundingClientRect();
        if (rect.right < 0) {
            console.log("Purging an obstacle!")
            obstacle.remove();
            obstacles.splice(i, 1);
        }
    }
}


function checkCollisions() {
    for (const obstacle of obstacles) {
        if (collisionCheck(runner, obstacle)) {
            gameOver();
            return
        }
    }
}


function shiftLeft() {
    for (const obstacle of obstacles) {
        let currentShift = parseInt(obstacle.style.left)
        obstacle.style.left = currentShift-speed + "px"
    }
}

/* Jump Status:
 *  0 - Not Jumping
 *  1-refresh rate up
 *  refresh rate-refresh rate*1.5 still
 *  refresh rate*1.5-refresh rate*2.5 down
 */
let jumpStatus = 0;

let halfFps;

function jump() {
    console.log("Trying to jump.");
    // Dont jump while jumping
    if (jumpStatus === 0) {
        jumpStatus++;
    }
}

function manageJump() {
    if (jumpStatus === 0) {
        return
    }
    console.log("Managing jump")
    if (jumpStatus <= fps) {
        // Up
        runnerPos -= 225 / fps
        runner.style.top = runnerPos + "px"

        console.log("Going up: " + runnerPos + "px")
    } else if (jumpStatus <= fps*1.5) {
    } else if (jumpStatus <= fps*2.5) {
        runnerPos += 225 / fps
        runner.style.top = runnerPos + "px"

        console.log("Going down: " + runnerPos + "px")
    } else {
        console.log("Jump over.")
        // Fix the runner's position
        //fixRunnerPosition();
        // Will be increased back to 0
        jumpStatus = -1;
    }
    jumpStatus++;
}

function doTouchscreenStuff(){
    if (gameRunning) {
        jump();
    }
}