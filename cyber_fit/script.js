const door = document.getElementById('door');
const frontdoor = document.getElementById('frontdoor');
const passRateDisplay = document.getElementById('pass-rate');
const pivotTopLeft = document.getElementById('top-hinge'); // Top-left pivot point
const pivotBottomLeft = document.getElementById('bottom-hinge'); // Bottom-left pivot point
const pivotFrontTopLeft = document.getElementById('front-top-hinge'); // Top-left pivot point
const pivotFrontBottomLeft = document.getElementById('front-bottom-hinge'); // Bottom-left pivot point


let clickCount = 0; // Initialize the click count
let gameCount = 0; // Initialize the game count
let inspecCount = 0; // Initialize the perfect count
let playerScore = 0; // player score
let timeLimit = 180; // 3 minutes in seconds
let timerInterval;
let doorZoffset = 0;
let frontdoorZoffset = 0;
let passRate = 0;
const quality_factor = 6;
let quality_percent = 50;
let playerName = "Player 1";

// randomize placement of door
function getRandomOffset() {
    const randomPercentage = Math.floor(Math.random() * 100);
    if (randomPercentage < quality_percent) {
        return 0;
    } else {
        return Math.floor(Math.random() * quality_factor) - quality_factor / 2;
    }
}

function getRandomZOffset() {
    const randomPercentage = Math.floor(Math.random() * 100);
    if (randomPercentage < quality_percent) {
        return 0;
    } else {
        return Math.floor(Math.random() * 3) - 1;
    }
}


// Function to update the countdown timer display
function updateTimer() {
    const minutes = Math.floor(timeLimit / 60);
    const seconds = timeLimit % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.getElementById('timer').innerText = `${formattedTime}`;
}

// restart game
function restartGame() {
	quality_percent = 90;
	resetPivotPoints();
	resetClickCount();
	updateDoor();
    updateFrontDoor();
	startTimer();
	resetScore();
	resetStats();
	hideControls(false);
}

// Function to start or restart the game timer
function startTimer() {
    clearInterval(timerInterval); // Clear any existing intervals
    timeLimit = 180; // Reset time limit
    updateTimer(); // Initial display of timer
    timerInterval = setInterval(() => {
        if (timeLimit > 0) {
            timeLimit--;
            updateTimer();
        } else {
            showPopup("Game Over! Time's up!");
            // shipit();
		
            clearInterval(timerInterval);
            // reload scores
            loadHighScores();
            // Add game over logic here
            
            // Reset the game after a brief delay
            setTimeout(() => {
               restartGame();
            }, 2000); // Adjust the delay (in milliseconds) as needed
        }
    }, 1000); // Update every 1 second
}

function moveContainer() {
      var car = document.getElementById('car');
      // Move off-screen to the left and then disappear
      car.style.transform = 'translateX(-100%)';
      setTimeout(function() {
        car.style.display = 'none';
      }, 500); // Change the time as needed (here, 500ms = 0.5 seconds)
      // Reappear off-screen to the right and then move back to the original position
      setTimeout(function() {
        car.style.transform = 'translateX(200%)'; // Move off-screen to the right
        car.style.display = 'block';
        setTimeout(function() {
          car.style.transform = 'translateX(0)'; // Move back to the original position
	  setTimeout(function() {
		hideControls(false);
	  }, 500); // Change the time as needed (here, 500ms = 0.5 seconds)
        }, 50); // A small delay for repositioning
      }, 1500); // Change the time as needed (here, 1500ms = 1.5 seconds)
}

function updateScore(add) {
    playerScore += add;
    document.getElementById('player-score').innerText = `Score: ${playerScore}`;
}

function updateClickCount() {
    document.getElementById('click-count').innerText = `Moves: ${clickCount}`;
}

function resetClickCount() {
    clickCount = 0;
    updateClickCount();
}

function resetScore() {
    playerScore = 0;
    updateScore(0); // Reusing the updateScore function for consistency
}

function resetStats() {
    inspecCount = 0;
    gameCount = 0;
    updatePassRateDisplay();
    updateGameCountDisplay();
}

function updatePassRateDisplay() {
    document.getElementById('pass-rate').innerText = `Pass: ${inspecCount}%`;
}

function updateGameCountDisplay() {
    document.getElementById('game-count').innerText = `Sent: ${gameCount}`;
}


function resetPivotPoints() {
    const randomOffset = getRandomOffset();
    const randomZOffset = getRandomZOffset();

    pivotTopLeft.style.left = randomOffset + 'px';
    pivotBottomLeft.style.left = randomOffset + 'px';

    pivotFrontTopLeft.style.left = randomOffset + 'px';
    pivotFrontBottomLeft.style.left = randomOffset + 'px';

    doorZoffset = randomZOffset;
    frontdoorZoffset = randomZOffset;
}


function calculateAngle(pivot1, pivot2) {
    const getRect = pivot => pivot.getBoundingClientRect();

    const { top: top1, left: left1 } = getRect(pivot1);
    const { top: top2, left: left2 } = getRect(pivot2);

    const deltaY = top2 - top1;
    const deltaX = left2 - left1;

    let angleInDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    angleInDegrees = (angleInDegrees + 360) % 360; // Use modulo to keep the angle within 0 to 360 degrees
    const correctedAngle = (angleInDegrees - 90) % 360;

    return correctedAngle;
}


function hideControls(hidden) {
    const elementsToHide = [
        'send-it-button',
        'move-top-left-left', 'move-top-left-right',
        'move-bottom-left-left', 'move-bottom-left-right',
        'move-top-up', 'move-bottom-down',
        'front-move-top-left-left', 'front-move-top-left-right',
        'front-move-bottom-left-left', 'front-move-bottom-left-right',
        'front-move-top-up', 'front-move-bottom-down'
    ];

    elementsToHide.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.visibility = hidden ? 'hidden' : 'visible';
        }
    });
}


function percentageToHsl(percentage, hue0, hue1) {
    var hue = (percentage * (hue1 - hue0)) + hue0;
    return 'hsl(' + hue + ', 100%, 50%)';
}

function shipit() {
    quality_percent = Math.max(quality_percent - 1, 0);

    console.log(`quality_percent: ${quality_percent}`);

    hideControls(true);

    moveContainer();
    const angle = calculateAngle(pivotTopLeft, pivotBottomLeft);
    const frontangle = calculateAngle(pivotFrontTopLeft, pivotFrontBottomLeft);
    
    const leftBoxDistanceX = parseFloat(pivotTopLeft.style.left) || 0;
    const rightBoxDistanceX = parseFloat(pivotBottomLeft.style.left) || 0;
    const frontLeftBoxDistanceX = parseFloat(pivotFrontTopLeft.style.left) || 0;
    const frontRightBoxDistanceX = parseFloat(pivotFrontBottomLeft.style.left) || 0;

    const quality_score = Math.abs(leftBoxDistanceX) + Math.abs(rightBoxDistanceX) +
                          Math.abs(frontLeftBoxDistanceX) + Math.abs(frontRightBoxDistanceX) +
                          Math.abs(angle) + Math.abs(frontangle) + 
			  Math.abs(doorZoffset) + Math.abs(frontdoorZoffset);

    console.log(`quality_score: ${quality_score.toFixed(2)}`);
    
    let points = 0;
    gameCount++;
    document.getElementById('game-count').innerText = `Sent: ${gameCount}`;

    if (quality_score === 0) {
        points = 100 - clickCount;
	showPopup(`EXCELLENT FIT! ${points}`);
        inspecCount++;
    } else if (quality_score <= 1) {
        points = 50 - clickCount;
        showPopup(`GOOD FIT! ${points}`);
        inspecCount++;
    } else if (quality_score <= 2) {
        points = 10 - clickCount;
        showPopup(`OK FIT! ${points}`);
        inspecCount++;
    } else if (quality_score > 2 && quality_score < 3) {
        points = 1 - clickCount;
        showPopup(`POOR FIT! ${points}`);
    } else {
        points = 0 - (clickCount + 10);
        showPopup(`BAD FIT! ${points}`);
    }

    passRate = (inspecCount / gameCount) * 100;
    const color = percentageToHsl(inspecCount / gameCount, 0, 120);
    passRateDisplay.innerText = `Pass: ${passRate.toFixed(0)}%`;
    passRateDisplay.style.color = color;

    updateScore(points);
    resetPivotPoints();
    resetClickCount();
    updateDoor();
    updateFrontDoor();
}

document.getElementById('send-it-button').addEventListener('click', () => {
	shipit();
});


// Function to update the position and angle of the door between pivot points
function updateDoor() {
    const pivotTopLeftY = parseFloat(pivotTopLeft.style.top) || 0;
    const pivotTopLeftX = parseFloat(pivotTopLeft.style.left) || 0;
    const pivotBottomLeftX = parseFloat(pivotBottomLeft.style.left) || 0;    
    const angle = calculateAngle(pivotTopLeft, pivotBottomLeft);
    
    
    door.style.transformOrigin = "46% 65%"
    door.style.transform = `rotate(${angle}deg)`;
    door.style.left = ((pivotTopLeftX / 2)  + (pivotBottomLeftX / 2)) + 'px';
    door.style.top = (pivotTopLeftY + doorZoffset) + 'px';
    // console.log(`doorZoffset: ${doorZoffset.toFixed(2)}`);
}

function updateFrontDoor() {
    const pivotFrontTopLeftY = parseFloat(pivotFrontTopLeft.style.top) || 0;
    const pivotFrontTopLeftX = parseFloat(pivotFrontTopLeft.style.left) || 0;
    const pivotFrontBottomLeftX = parseFloat(pivotFrontBottomLeft.style.left) || 0;    
    const angle = calculateAngle(pivotFrontTopLeft, pivotFrontBottomLeft);
    
    
    frontdoor.style.transformOrigin = "27% 65%"
    frontdoor.style.transform = `rotate(${angle}deg)`;
    frontdoor.style.left = ((pivotFrontTopLeftX / 2)  + (pivotFrontBottomLeftX / 2)) + 'px';
    frontdoor.style.top = (pivotFrontTopLeftY + frontdoorZoffset) + 'px';
    // console.log(`doorZoffset: ${doorZoffset.toFixed(2)}`);
}

function showPopup(msg) {
    var popup = document.getElementById('popupText');
    popup.innerText = msg;
    popup.style.display = 'block';
    setTimeout(function() {
        popup.style.display = 'none';
    }, 2000); // Change 2000 to the desired duration in milliseconds (here, 2000ms = 2 seconds)
}

// Function to move the pivot points in the X direction
function movePivotPointX(pivot, deltaX) {
    const currentX = parseFloat(pivot.style.left) || 0;
    const newX = currentX + deltaX;
    pivot.style.left = newX + 'px';
    updateDoor();
    updateFrontDoor();
}

// Event listeners for moving pivot points in the X direction using the buttons
document.getElementById('move-top-left-left').addEventListener('click', () => {
    movePivotPointX(pivotTopLeft, -1); // Move the top-left pivot point to the left
    clickCount++;
    updateClickCount();
});

document.getElementById('move-top-left-right').addEventListener('click', () => {
    movePivotPointX(pivotTopLeft, 1); // Move the top-left pivot point to the right
    clickCount++;
    updateClickCount();
});

document.getElementById('move-bottom-left-left').addEventListener('click', () => {
    movePivotPointX(pivotBottomLeft, -1); // Move the bottom-left pivot point to the left
    clickCount++;
    updateClickCount();
});

document.getElementById('move-bottom-left-right').addEventListener('click', () => {
    movePivotPointX(pivotBottomLeft, 1); // Move the bottom-left pivot point to the right
    clickCount++;
    updateClickCount();
});
document.getElementById('move-top-up').addEventListener('click', () => {
    doorZoffset = doorZoffset - 1;
    updateDoor();
    clickCount++;
    updateClickCount();
});
document.getElementById('move-bottom-down').addEventListener('click', () => {
    doorZoffset = doorZoffset + 1;
    updateDoor();
    clickCount++;
    updateClickCount();
});


// front door
document.getElementById('front-move-top-left-left').addEventListener('click', () => {
    movePivotPointX(pivotFrontTopLeft, -1); // Move the top-left pivot point to the left
    clickCount++;
    updateClickCount();
});

document.getElementById('front-move-top-left-right').addEventListener('click', () => {
    movePivotPointX(pivotFrontTopLeft, 1); // Move the top-left pivot point to the right
    clickCount++;
    updateClickCount();
});

document.getElementById('front-move-bottom-left-left').addEventListener('click', () => {
    movePivotPointX(pivotFrontBottomLeft, -1); // Move the bottom-left pivot point to the left
    clickCount++;
    updateClickCount();
});

document.getElementById('front-move-bottom-left-right').addEventListener('click', () => {
    movePivotPointX(pivotFrontBottomLeft, 1); // Move the bottom-left pivot point to the right
    clickCount++;
    updateClickCount();
});
document.getElementById('front-move-top-up').addEventListener('click', () => {
    frontdoorZoffset = frontdoorZoffset - 1;
    updateFrontDoor();
    clickCount++;
    updateClickCount();
});
document.getElementById('front-move-bottom-down').addEventListener('click', () => {
    frontdoorZoffset = frontdoorZoffset + 1;
    updateFrontDoor();
    clickCount++;
    updateClickCount();
});





// Function to load and display high scores from localStorage
function loadHighScores() {
    try {
        const raw = localStorage.getItem('cyber_fit_high_scores');
        const scores = raw ? JSON.parse(raw) : [];
        displayHighScores(scores);
    } catch (error) {
        console.error('Failed to load high scores:', error);
        displayHighScores([]);
    }
}

// Function to load and refresh high scores from localStorage
function loadAndRefreshHighScores() {
    try {
        const raw = localStorage.getItem('cyber_fit_high_scores');
        const scores = raw ? JSON.parse(raw) : [];
        refreshHighScores(scores);
    } catch (error) {
        console.error('Failed to load high scores:', error);
        refreshHighScores([]);
    }
}

// Function to display high scores in HTML
function displayHighScores(scores) {
    var scoresContainer = document.getElementById('highScores');
    scoresContainer.innerHTML = 'Top 10 High Scores:<p/>';

    scores.forEach(function(score, index) {
        var scoreItem = document.createElement('p');
        scoreItem.textContent = (index + 1) + '. ' + score.name + ' - ' + score.score + ' - Sent: ' + score.count + ' Pass: ' + score.passrate + '%';
        scoresContainer.appendChild(scoreItem);
    });

    // only submit score if there are less than 10 scores or if score is higher than lowest score
    if (scores.length < 10 || (scores.length > 0 && playerScore > scores[scores.length - 1].score)) {
        submitPlayerScore();
    }
}

// Function to display high scores in HTML (refresh)
function refreshHighScores(scores) {
    var scoresContainer = document.getElementById('highScores');
    scoresContainer.innerHTML = 'Top 10 High Scores:<p/>';

    scores.forEach(function(score, index) {
        var scoreItem = document.createElement('p');
        scoreItem.textContent = (index + 1) + '. ' + score.name + ' - ' + score.score + ' - Sent: ' + score.count + ' Pass: ' + score.passrate + '%';
        scoresContainer.appendChild(scoreItem);
    });
}

// Function to handle form submission
async function submitPlayerScore() {
    var playerName = document.getElementById('playerName').value;
    if (playerName.trim() !== '') {
        await updatePlayerScore(playerScore, playerName);
    }
}

// Function to update player's score locally in localStorage
async function updatePlayerScore(score, playerName) {
    try {
        const raw = localStorage.getItem('cyber_fit_high_scores');
        const scores = raw ? JSON.parse(raw) : [];

        scores.push({ name: playerName, score: score, count: gameCount, passrate: passRate });
        // sort descending by score
        scores.sort((a, b) => b.score - a.score);
        // keep top 10
        if (scores.length > 10) scores.splice(10);

        localStorage.setItem('cyber_fit_high_scores', JSON.stringify(scores));
        console.log('Score saved locally.');

        // refresh display
        loadAndRefreshHighScores();

    } catch (error) {
        console.error('Error updating score locally:', error);
    }
}

var inputField = document.getElementById('playerName');
var validationMessage = document.getElementById('validationMessage');

inputField.addEventListener('input', function() {
    var userInput = inputField.value;
    var regexPattern = /^[a-zA-Z0-9\s]+$/;

    if (regexPattern.test(userInput)) {
        validationMessage.textContent = '';
    } else {
        validationMessage.textContent = ' Invalid Name! ';
    }
});


function startGame() {
    // Retrieve the player's name from the input field
    playerName = document.getElementById('playerName').value;

    // Check if the player entered a name
    if (playerName.trim() === "") {
        alert("Please enter your name before starting the game.");
    }    
        
    document.getElementById('startgame').style.visibility = 'hidden';
    
    resetPivotPoints();
    updateDoor();
    updateFrontDoor();
    startTimer();
    resetStats();
    resetScore();
    resetClickCount();
    loadAndRefreshHighScores();
}
    