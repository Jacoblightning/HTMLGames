const impossibleButton = document.getElementById('impossibleMode');
const missCount        = document.getElementById('misscount');
const highScore        = document.getElementById('HS');
const lowScore         = document.getElementById('LS');


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
}

let misses = 0;
//let skip = false;

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
    //if (skip){
    //    skip = false;
    //    return;
    //}

    if (impossibleButton.checked) {
        actuallyMoveIt(elem);
    } else {
        setTimeout(actuallyMoveIt, 50, elem);
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
    //skip = true;
}