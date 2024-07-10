// TODO: Add Google/Apple Maps links to restaurant
// TODO: Display remaining choices in a bracket instead of a list

const inputSection = document.getElementById("inputSection");
const bracketSection = document.getElementById("bracketSection");
const inputsContainer = document.getElementById("inputs");
const bracketContainer = document.getElementById("bracket");
const startButton = document.getElementById("startBracket");
const remainingChoicesDiv = document.getElementById("remainingChoices");
const timerDiv = document.getElementById("timer");

let choices = [];
let currentMatchup = [];
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

  inputSection.style.display = "none";
  bracketSection.style.display = "block";

  runRandomMatchup();
}

function runRandomMatchup() {
  if (choices.length === 1) {
    bracketContainer.innerHTML = `<h2>The Munch Madness Champion is: ${choices[0]}!</h2>`;
    remainingChoicesDiv.textContent = "";
    timerDiv.style.display = "none";
    return;
  }

  // Randomly select two choices
  const index1 = Math.floor(Math.random() * choices.length);
  let index2 = Math.floor(Math.random() * (choices.length - 1));
  if (index2 >= index1) index2++;

  currentMatchup = [choices[index1], choices[index2]];

  bracketContainer.innerHTML = "";
  const matchup = document.createElement("div");
  matchup.className = "matchup";

  const choiceElement1 = createChoiceElement(currentMatchup[0]);
  const choiceElement2 = createChoiceElement(currentMatchup[1]);

  matchup.appendChild(choiceElement1);
  matchup.appendChild(choiceElement2);
  bracketContainer.appendChild(matchup);

  updateRemainingChoices();
  startTimer();
}

function createChoiceElement(choice) {
  const element = document.createElement("div");
  element.className = "choice";
  element.textContent = choice;
  element.onclick = () => advanceChoice(choice);
  return element;
}

function advanceChoice(winner, isRandom = false) {
  clearInterval(timer);
  choices = choices.filter(
    (choice) => choice !== currentMatchup[0] && choice !== currentMatchup[1]
  );
  choices.push(winner);

  if (isRandom) {
    bracketContainer.innerHTML = `<h2>Time's up! ${winner} was randomly chosen to advance.</h2>`;
    setTimeout(() => runRandomMatchup(), 2000); // Wait 2 seconds before next matchup
  } else {
    runRandomMatchup();
  }
}

function updateRemainingChoices() {
  const otherChoices = choices.filter(
    (choice) => !currentMatchup.includes(choice)
  );
  remainingChoicesDiv.textContent =
    otherChoices.length > 0
      ? `Remaining choices: ${otherChoices.join(", ")}`
      : "";
}

function startTimer() {
  timeLeft = 24;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft === 0) {
      clearInterval(timer);
      const randomChoice = Math.random() < 0.5 ? 0 : 1;
      advanceChoice(currentMatchup[randomChoice], true);
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
