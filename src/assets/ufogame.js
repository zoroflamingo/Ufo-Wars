let isGameActive = false;
let isMissileActive = false;
const startButton = document.getElementById("btnStart");
const ufo = document.getElementById("imgUFOGame");
let ufoPositionX = 0;
const missile = document.getElementById("imgMisGame");
let misPositionY = 0;
let misPositionX = window.innerWidth / 2;
let isMovingRight = false;
let isMovingLeft = false;
let misSpeed = 2;
let timer;
let seconds = 60; 
let timerDisplay = document.getElementById("timer");
let score = 0;
const scoreDisplay = document.getElementById("score");
let ufos = [];
let ufosCount = 1;
const titleContainer = document.getElementById('header');
const titleHeight = window.innerHeight - titleContainer.offsetHeight; 
const ufoContainer = document.getElementById("ufoContainer");

// Initialize event listeners and load preferences when the page is ready

document.addEventListener("DOMContentLoaded", () => {
   
    // For the submit button in preferences page (if it exists)

    if (window.location.pathname.includes("play.html")) {
        document.addEventListener("keydown", (event) => {
            if (event.code === "Space" && !isMissileActive && startButton.disabled) {
                isMissileActive = true;
                moveMissile();
            }
            else 
            {
                if (event.code === "ArrowRight") 
                {
                    isMovingRight = true;
                } 
                else if (event.code === "ArrowLeft") 
                {
                    isMovingLeft = true
                } 
            }
        document.addEventListener("keyup", (event) => {
            if (event.code === "ArrowRight") 
            {
                isMovingRight = false;
            } 
            else if (event.code === "ArrowLeft") 
            {
                isMovingLeft = false;
            } 
            })
        });
    }

    loadPreferences();
});

// Loads and applies user preferences for game timer and UFO count.


// Initializes and starts the game. Resets score, creates UFOs 
// based on user preferences, and starts the countdown timer.

function startGame() 
{
    ufoContainer.innerHTML = "";  // Clear any existing UFOs before creating new ones
    missile.style.display = "block";
    seconds = parseInt(localStorage.getItem("gameTimer") || 60, 10);
    misPositionY = 0;
    misPositionX = window.innerWidth / 2;
    missile.style.transform = `translateY(${misPositionY}px) translateX(${misPositionX}px)`;
    score = 0;
    scoreDisplay.textContent = score;
    createOrReplaceUfo(ufosCount);
    console.log("Game started!");
    startButton.disabled = true;
    isGameActive = true;
    timerDisplay.textContent = seconds;
    timer = setInterval(updateTimer, 1000);
    requestAnimationFrame(moveUfo);
    requestAnimationFrame(smoothMoveMissile);
}

function stopGame() 
{
    console.log("Game stopped!");
    startButton.disabled = false;
    isGameActive = false;
    ufoPositionX = 0;
    clearInterval(timer);
    finalScore();
}

// Moves each UFO randomly within a specified area.
// Ensures UFOs don't overlap with the title div.

function moveUfo() {
    if (isGameActive) {
        ufos.forEach((ufo) => {
            const currentLeft = parseFloat(ufo.style.left || 0);

            // Move UFO to the right if direction is 1, or left if direction is -1
            const newLeft = currentLeft + (ufo.direction * 2);  // Move UFO by 2px in its direction
            ufo.style.left = `${newLeft}px`;

            // Reset position if the UFO goes off screen (adjust as needed)
            if (newLeft > window.innerWidth) {
                ufo.style.left = `-${ufo.offsetWidth}px`;  // Move UFO back to the left side
            } else if (newLeft < -ufo.offsetWidth) {
                ufo.style.left = `${window.innerWidth}px`;  // Move UFO back to the right side
            }
        });

        requestAnimationFrame(moveUfo);  // Keep the UFOs moving
    }
}

function smoothMoveMissile() {
    if (!isMissileActive && isGameActive) {
        if (isMovingRight) {
            misPositionX += 5;  // Adjust speed as desired
        }
        if (isMovingLeft) {
            misPositionX -= 5;
        }

        // Constrain missile within screen bounds
        misPositionX = Math.max(0, Math.min(misPositionX, window.innerWidth - missile.offsetWidth));

        // Update missile position
        missile.style.transform = `translate(${misPositionX}px, ${misPositionY}px)`;
    }

    // Continue the animation loop
    requestAnimationFrame(smoothMoveMissile);
}

// Moves the missile upwards and checks for collisions.
// If it hits a UFO, updates score and triggers explosion.
// If it misses, reduces score and removes missile from the screen.

function moveMissile()
{
    if(isMissileActive)
    {
        misPositionY -= misSpeed;
        missile.style.transform = `translateY(${misPositionY}px) translateX(${misPositionX}px)`;

        if (detectCollision()) 
        {
            isMissileActive = false;
            updateScore("increase");
        }
        else if (misPositionY < -titleHeight) 
        {
            misPositionY = 0;
            isMissileActive = false;
            missile.style.transform = `translateY(${misPositionY}px) translateX(${misPositionX}px)`;
            updateScore("decrease");
        }
        else
        {
            requestAnimationFrame(moveMissile);
        }
    }
}

// Checks if the missile collides with any UFO on the screen.
// If collision detected, triggers explosion and updates the score.

function detectCollision() {
    const missileRect = missile.getBoundingClientRect();
    for (const ufo of ufos) {
        const ufoRect = ufo.getBoundingClientRect();

        if (
            missileRect.left < ufoRect.right &&
            missileRect.right > ufoRect.left &&
            missileRect.top < ufoRect.bottom &&
            missileRect.bottom > ufoRect.top
        ) {
            triggerExplosion(ufo);  // Pass the collided UFO to the explosion function
            replaceHitUfo(ufo);
            missile.style.display = "none";
            return true;  // Exit the function as soon as a collision is detected
        }
    }
    return false;  // Return false if no collision is detected
}

// Creates and displays an explosion animation at the specified UFO's location.

function triggerExplosion(collidedUfo) {
    const explosion = document.getElementById("explosion");
    const ufoRect = collidedUfo.getBoundingClientRect();

    explosion.style.left = `${(ufoRect.left + ufoRect.right) / 2}px`;
    explosion.style.top = `${(ufoRect.top + ufoRect.bottom) / 2}px`;
    explosion.style.display = "block";

    setTimeout(() => {
        explosion.style.display = "none";
        resetMissile();
    }, 500);
}

function replaceHitUfo(hitUfo) {
    // Remove the hit UFO from the DOM
    hitUfo.remove();
    createOrReplaceUfo();
}

function createOrReplaceUfo(count = 1) {
    const ufoTemplate = document.getElementById("imgUFOGame");  // Reference the existing UFO element

    // Fixed values  
    const ufoHeight = 50;    // Assuming each UFO is 50px tall, adjust as needed
    const maxTop = window.innerHeight - ufoHeight*3; 
    const minTop = titleContainer.offsetHeight + ufoHeight;  // UFOs start just below the title div

    // If count > 1, we are creating new UFOs, otherwise replacing a hit UFO
    for (let i = 0; i < count; i++) {
        const clonedUfo = ufoTemplate.cloneNode(true);  // Clone the existing UFO element
        clonedUfo.style.position = "absolute";
        clonedUfo.style.left = `${Math.random() * window.innerWidth}px`;  // Set a random position (you can adjust this logic)
        
        // Random position for the top, within the specified range
        const ufoTop = `${minTop + Math.random() * (maxTop - minTop)}px`;
        clonedUfo.style.top = ufoTop;

        // Generate a unique ID by combining the index with a timestamp or unique counter
        clonedUfo.id = `ufo-${Date.now()}-${i}`;  // This ensures each UFO has a unique ID
        clonedUfo.direction = Math.random() < 0.5 ? 1 : -1;  // Randomly choose left or right
        clonedUfo.speed = Math.random() * 3 + 1;  // Set random speed for the UFO

        // Add the cloned UFO to the container and store it in the array
        ufoContainer.appendChild(clonedUfo);
        ufos.push(clonedUfo);  // Store the UFO in the ufos array

        console.log(`UFO ${i} position: left=${clonedUfo.style.left}, top=${clonedUfo.style.top}`);
    }
}

function resetMissile() {
    misPositionY = 0;
    missile.style.transform = `translateY(${misPositionY}px) translateX(${misPositionX}px)`;
    isMissileActive = false;
    missile.style.display = "block";
}

function updateScore(action)
{
    if (action === "increase") 
    {
        score += 100;  
        console.log("yessir");
    } 
    else if (action === "decrease") 
    {
        score -= 25;  
    }
    scoreDisplay.textContent = score;
}

function updateTimer() 
{
    if (isGameActive && seconds > 0) 
    {
        seconds--;
        timerDisplay.textContent = seconds;
    } 
    else if (seconds === 0) 
    {       
        stopGame();
        timerDisplay.textContent = "Time's up!";
    }
}

function finalScore() 
{
    const savedTimer = parseInt(localStorage.getItem("gameTimer"), 10) || 60;
    const savedUfoCount = parseInt(localStorage.getItem("ufoCount"), 10) || 1;

    if (savedTimer === 120) 
    {
        score /= 2;
    } 
    else if (savedTimer === 180) 
    {
        score /= 3;
    }
    score -= 50 * (savedUfoCount - 1);

    scoreDisplay.textContent = score;  // Ensure the final score is shown
    console.log("Final Score:", score);
}

// Logs in the user by sending credentials to the server and 
// saving the token to local storage upon success.

