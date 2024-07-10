// TODO: Add Google/Apple Maps links to restaurant
// TODO: Display remaining choices in a bracket instead of a list
// TODO: In a group of people choosing, add animation using Three.js 
// TODO: where you have to flick a ball in to cast your vote

const inputSection = document.getElementById("inputSection");
const bracketSection = document.getElementById("bracketSection");
const inputsContainer = document.getElementById("inputs");
const bracketContainer = document.getElementById("bracket");
const startButton = document.getElementById("startBracket");
const timerDiv = document.getElementById("timer");

let choices = [];
let currentRound = 16;
let currentMatchupIndex = 0;
let timer;
let timeLeft;

// Create 16 input fields
for (let i = 0; i < 16; i++) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Choice ${i + 1}`;
  inputsContainer.appendChild(input);
}

startButton.addEventListener("click", startBracket);

function startBracket() {
  choices = Array.from(inputsContainer.children)
    .map((input) => input.value.trim())
    .filter((choice) => choice !== "");

  if (choices.length < 2) {
    alert("Please enter at least 2 choices.");
    return;
  }

  // Pad the choices array to 16 if less than 16 choices are entered
  while (choices.length < 16) {
    choices.push("");
  }

  inputSection.style.display = "none";
  bracketSection.style.display = "block";

  initializeBracket();
  runNextMatchup();
}

function initializeBracket() {
  const round16 = document.querySelector(".round-16");
  round16.innerHTML = "";
  for (let i = 0; i < 16; i += 2) {
    const matchup = document.createElement("div");
    matchup.className = "matchup";
    matchup.innerHTML = `
            <div class="choice" onclick="advanceChoice(${i})">${
      choices[i] || "TBD"
    }</div>
            <div class="choice" onclick="advanceChoice(${i + 1})">${
      choices[i + 1] || "TBD"
    }</div>
        `;
    round16.appendChild(matchup);
  }
}

function runNextMatchup() {
  if (currentRound === 1) {
    document.querySelector(".round-1 .choice").classList.add("active");
    timerDiv.style.display = "none";
    return;
  }

  const currentRoundDiv = document.querySelector(`.round-${currentRound}`);
  const matchups = currentRoundDiv.querySelectorAll(".matchup");
  const currentMatchup = matchups[currentMatchupIndex];

  // Reset all choices to inactive
  document
    .querySelectorAll(".choice")
    .forEach((choice) => choice.classList.remove("active"));

  // Set current choices to active
  currentMatchup
    .querySelectorAll(".choice")
    .forEach((choice) => choice.classList.add("active"));

  startTimer();
}

function advanceChoice(index) {
  clearInterval(timer);
  const currentRoundDiv = document.querySelector(`.round-${currentRound}`);
  const nextRoundDiv = document.querySelector(`.round-${currentRound / 2}`);
  const matchups = currentRoundDiv.querySelectorAll(".matchup");
  const currentMatchup = matchups[currentMatchupIndex];
  const winningChoice = currentMatchup.querySelectorAll(".choice")[index % 2];

  // Move the winning choice to the next round
  if (!nextRoundDiv.children[Math.floor(currentMatchupIndex / 2)]) {
    const newMatchup = document.createElement("div");
    newMatchup.className = "matchup";
    nextRoundDiv.appendChild(newMatchup);
  }
  const nextMatchup =
    nextRoundDiv.children[Math.floor(currentMatchupIndex / 2)];
  if (!nextMatchup.children[currentMatchupIndex % 2]) {
    const newChoice = document.createElement("div");
    newChoice.className = "choice";
    newChoice.onclick = () => advanceChoice(currentMatchupIndex);
    nextMatchup.appendChild(newChoice);
  }
  nextMatchup.children[currentMatchupIndex % 2].textContent =
    winningChoice.textContent;

  currentMatchupIndex++;
  if (currentMatchupIndex >= matchups.length) {
    currentRound /= 2;
    currentMatchupIndex = 0;
  }

  runNextMatchup();
}

function startTimer() {
  timeLeft = 24;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft === 0) {
      clearInterval(timer);
      const randomChoice = Math.floor(Math.random() * 2);
      advanceChoice(currentMatchupIndex * 2 + randomChoice);
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDiv.textContent = timeLeft;
  if (timeLeft <= 5) {
    timerDiv.style.color = "#e74c3c";
  } else {
    timerDiv.style.color = "#2c3e50";
  }
}
