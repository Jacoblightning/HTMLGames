const impossibleButton = document.getElementById('impossibleMode');
const missCount        = document.getElementById('misscount');
const highScore        = document.getElementById('HS');
const lowScore         = document.getElementById('LS');

const difficultyName = document.getElementById('difficulty');

const difficultyData = [500, 250, 150, 100, 50, 15];
const difficultyNames = ["Ultra Baby", "Baby", "Easy", "Medium", "Hard", "Superhuman"]
let diffIndex = 0;


let scores = {"HS":-1, "LS":0}
{
    let stored_scores = localStorage.getItem("scores");
    if (stored_scores) {
        scores = JSON.parse(stored_scores);

        if (highScore.HS !== -1){
            highScore.innerHTML = scores.HS;
        }
        lowScore.innerHTML  = scores.LS;

    }

    let scored_diff = localStorage.getItem("difficulty");
    if (scored_diff) {
        diffIndex = Number(scored_diff);
    }
}

difficultyName.innerHTML = difficultyNames[diffIndex];



let misses = 0;
let currentWait = null;

function recalcMisses() {
    missCount.innerHTML = misses;
    if (scores.LS < misses) {
        lowScore.innerHTML = misses;
        scores.LS = misses;
    }
}

function saveScore() {
    localStorage.setItem("scores", JSON.stringify(scores));
}

function onUpdate(){
    recalcMisses();
    saveScore();
}

function actuallyMoveIt(elem) {
    elem.style.left = ((Math.random() * 80) + 10) + "%"
    elem.style.top = ((Math.random() * 80) + 10) + "%"

    misses++;
    onUpdate();
}

function iLikeToMoveItMoveIt(elem) {
    if (impossibleButton.checked) {
        actuallyMoveIt(elem);
    } else {
        currentWait = setTimeout(actuallyMoveIt, difficultyData[diffIndex], elem);
    }
}

function winSequence() {
    let miss = misses
    if (scores.HS > misses || scores.HS === -1) {
        highScore.innerHTML = misses;
        scores.HS = misses;
    }
    misses = 0;
    onUpdate();
    alert('Congratulations!!!\nIt took you '+miss+' tries!');
    if (miss <= 3){
        alert("You have mastered this difficulty!");
        diffIndex++;
        difficultyName.innerHTML = difficultyNames[diffIndex];
        localStorage.setItem("difficulty", diffIndex)
    }
    clearTimeout(currentWait)
}

function resetStats(){
    localStorage.clear();
    location.reload();
}