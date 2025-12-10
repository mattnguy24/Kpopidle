const url = "https://api.kpopidle.com/prod/";
let idols = [];
let answer;
let winRate;
let averageGuesses;
let averageTime;
let silhouette;
let headshot;
let startTime = null;
let timerInterval = null;
let today = {};
const path = window.location.pathname;
let gameDate = getPSTDate();
let urlDate = getUrlDate();
if (urlDate && urlDate !== gameDate) {
  gameDate = urlDate;
}

document.getElementById('selectedDate').innerText = gameDate;
const calendarInput = document.getElementById('date-selector');
calendarInput.placeholder = gameDate;

let boxNum = 0;
let selected = [];
let answered = false;

loadData().then(() => {
  const statsTable = document.getElementById("game-stats");
  preloadImage(silhouette);
  preloadImage(headshot);
  startTimer(today["time"]);
  for (i = 0; i < today["selected"].length; ++i) {
    showIdolData(
      idols.find((j) => j.idol_id === today["selected"][i]),
      boxNum
    );
    boxNum++;
    if (answered || boxNum == 8) {
      stopTimer();
      showImage(headshot);
      const answerText = document.createElement("p");
      answerText.textContent = `Today's answer was: ${answer.name} from ${answer.group}!`;
      answerText.style.fontWeight = "bold";
      answerText.style.marginTop = "10px";
      idolImage.appendChild(answerText);
      silhouetteButton.disabled = true;
    }
  }
  statsTable.innerHTML = `<strong>${gameDate} Guess Stats:<br></strong>
  <strong>Win Rate:</strong> ${(Number(winRate) * 100).toFixed(2)}%<br>
  <strong>Average Guesses Used:</strong> ${Number(averageGuesses).toFixed(
    2
  )}<br>
  <strong>Average Time:</strong> ${formatSecondsToMinutesAndSeconds(
    averageTime
  )}`;
});

const suggestionBox = document.querySelector(".suggestions");
const inputBox = document.getElementById("game-search");
const silhouetteButton = document.getElementById("silhouette-button");
const idolImage = document.getElementById("idol-image");
const img = document.getElementById("idol-img");
const box1 = document.getElementById("box1");
const box2 = document.getElementById("box2");
const box3 = document.getElementById("box3");
const box4 = document.getElementById("box4");
const box5 = document.getElementById("box5");
const box6 = document.getElementById("box6");
const box7 = document.getElementById("box7");
const box8 = document.getElementById("box8");

silhouetteButton.addEventListener("click", () => {
  if (idolImage.style.display === "block") {
    idolImage.style.display = "none";
    idolImage.innerHTML = "";
  } else {
    showImage(silhouette);
  }
});

inputBox.onkeyup = function () {
  let result = [];
  let input = inputBox.value;
  if (input.length) {
    result = idols.filter((idol) => {
      return (
        idol.name.toLowerCase().includes(input.toLowerCase()) ||
        idol.group.toLowerCase().includes(input.toLowerCase())
      );
    });
    result.sort((a, b) => a.name.localeCompare(b.name));
  }
  display(result);
};

function display(result) {
  const content = result
    .map((idol) => {
      return `<li class="suggestions-item" data-id="${idol.idol_id}">${idol.name} (${idol.group})</li>`;
    })
    .join("");
  suggestionBox.innerHTML = content;

  document.querySelectorAll(".suggestions-item").forEach((item) => {
    item.addEventListener("click", () => {
      const selectedId = Number(item.getAttribute("data-id"));
      const idol = idols.find((i) => i.idol_id === selectedId);
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (idol && boxNum < 8 && !selected.includes(idol) && !answered) {
        showIdolData(idol, boxNum);
        boxNum++;
        suggestionBox.innerHTML = "";
        inputBox.value = "";
        storeGame(selectedId, elapsedSeconds);
      }

      if (answered || boxNum == 8) {
        stopTimer();
        try {
          const results = {
            correct: answered,
            time: elapsedSeconds,
            game_date: gameDate,
            guesses: boxNum,
          };
          showImage(headshot);
          const answerText = document.createElement("p");
          answerText.textContent = `Today's answer was: ${answer.name} from ${answer.group}!`;
          answerText.style.fontWeight = "bold";
          answerText.style.marginTop = "10px";
          idolImage.appendChild(answerText);
          silhouetteButton.disabled = true;
          if (!today["uploaded"]) {
            upload_stats(results);
            today["uploaded"] = true;
          }
        } catch (error) {
          throw new Error("Error: " + error);
        }
      }
    });
  });
}

function calculate_age(dateOfBirth) {
  const today = new Date();
  const dob = dateOfBirth.split("-");
  const birthDate = new Date(dob[2], dob[0] - 1, dob[1]);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}

function showIdolData(idol, rowIndex) {
  const table = document.getElementById("guess-table");
  const row = table.rows[rowIndex];
  const hints = getHints(idol, answer);
  row.innerHTML = `
    <td>${idol.name} ${hints.name}</td>
    <td>${idol.group} ${hints.group}</td>
    <td>${idol.label} ${hints.label}</td>
    <td>${idol.gender} ${hints.gender}</td>
    <td>${calculate_age(idol.date_of_birth)} ${hints.age}</td>
    <td>${idol.height} ${hints.height}</td>
    <td>${idol.debut} ${hints.debut}</td>
  `;
  if (
    idol.name == answer.name &&
    idol.group == answer.group &&
    idol.label == answer.label &&
    idol.gender == answer.gender &&
    calculate_age(idol.date_of_birth) == calculate_age(answer.date_of_birth) &&
    idol.height == answer.height &&
    idol.debut == answer.debut
  ) {
    answered = true;
  }
  selected.push(idol);
}

function getHints(guess, answer) {
  const hints = {};

  ["name", "group", "label", "gender"].forEach((key) => {
    hints[key] = guess[key] === answer[key] ? "✅" : "❌";
  });
  if (
    calculate_age(guess.date_of_birth) == calculate_age(answer.date_of_birth)
  ) {
    hints.age = "✅";
  } else {
    const ageDifference =
      calculate_age(answer.date_of_birth) - calculate_age(guess.date_of_birth);
    if (ageDifference > 2) {
      hints.age = "❌⬆️";
    } else if (ageDifference < -2) {
      hints.age = "❌⬇️";
    } else if (ageDifference > 0) {
      hints.age = "🟡⬆️";
    } else if (ageDifference < 0) {
      hints.age = "🟡⬇️";
    }
  }

  if (guess.height == answer.height) {
    hints.height = "✅";
  } else {
    const heightDifference = answer.height - guess.height;
    if (heightDifference > 2) {
      hints.height = "❌⬆️";
    } else if (heightDifference < -2) {
      hints.height = "❌⬇️";
    } else if (heightDifference > 0) {
      hints.height = "🟡⬆️";
    } else if (heightDifference < 0) {
      hints.height = "🟡⬇️";
    }
  }

  if (guess.debut == answer.debut) {
    hints.debut = "✅";
  } else {
    const debutDifference = answer.debut - guess.debut;
    if (debutDifference > 2) {
      hints.debut = "❌⬆️";
    } else if (debutDifference < -2) {
      hints.debut = "❌⬇️";
    } else if (debutDifference > 0) {
      hints.debut = "🟡⬆️";
    } else if (debutDifference < 0) {
      hints.debut = "🟡⬇️";
    }
  }
  return hints;
}

function startTimer(initialElapsed = 0) {
  startTime = Date.now() - initialElapsed * 1000;
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function setPopUp(openBtnId, popupId, closeBtnId) {
  const openBtn = document.getElementById(openBtnId);
  const popup = document.getElementById(popupId);
  const closeBtn = document.getElementById(closeBtnId);

  openBtn.addEventListener("click", () => popup.classList.add("open"));
  closeBtn.addEventListener("click", () => popup.classList.remove("open"));
}

setPopUp("open-about", "about", "close-about");
setPopUp("open-stats", "stats", "close-stats");
setPopUp("open-help", "help", "close-help");
setPopUp("open-previous", "previous", "close-previous");
setPopUp("open-disclaimer", "disclaimer", "close-disclaimer");
setPopUp("open-privacy", "privacy", "close-privacy");

const prevDateSelection = document.getElementById("date-selector");
const dateSelection = document.getElementById("date-submit");
dateSelection.addEventListener("click", () => {
  changeDate(prevDateSelection.value);
});

async function fetchIdols() {
  const response = await fetch(url + "list");
  if (!response.ok) {
    throw new Error("Failed to fetch idols");
  }
  return await response.json();
}

async function checkAnswer() {
  const response = await fetch(url + "check_answer", {
    method: "POST",
    body: JSON.stringify({ date: gameDate }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to check answer");
  }
  return await response.json();
}

async function loadData() {
  try {
    idols = await fetchIdols();
    const dailyGameStats = await checkAnswer();
    answer = idols.find((idol) => idol.idol_id === dailyGameStats.correct_id);
    averageGuesses = dailyGameStats.averageGuesses;
    averageTime = dailyGameStats.averageTime;
    winRate = dailyGameStats.winRate;
    silhouette = dailyGameStats.silhouette;
    headshot = dailyGameStats.headshot;
    loadGame();
  } catch (error) {
    console.error("Error:", error);
  }
}

async function upload_stats(stats) {
  const response = await fetch(url + "upload_stats", {
    method: "PUT",
    body: JSON.stringify(stats),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to upload stats");
  }
}

function formatSecondsToMinutesAndSeconds(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function showImage(imageURL) {
  idolImage.innerHTML = "";
  const img = document.createElement("img");
  img.src = imageURL;
  img.alt = "Idol Image";
  idolImage.appendChild(img);
  idolImage.style.display = "block";
}

function storeGame(selectedId, elapsedTime) {
  const games = JSON.parse(localStorage.getItem("kpopidleGames")) || {};
  today["selected"].push(selectedId);
  today["time"] = elapsedTime;
  games[gameDate] = today;
  localStorage.setItem("kpopidleGames", JSON.stringify(games));
}

function loadGame() {
  const storedGames = localStorage.getItem("kpopidleGames");
  const allGames = storedGames ? JSON.parse(storedGames) : {};
  today = allGames[gameDate] || { selected: [], time: 0, uploaded: false };
}

function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

function changeDate(date) {
  return window.location.assign(`/history/${date}`);
}

document.addEventListener("DOMContentLoaded", () => {
  const helpPopup = document.getElementById("help");
  if (helpPopup) {
    helpPopup.classList.add("open");
  }
});

function getPSTDate() {
  const now = new Date();

  // Convert to Pacific Time using Intl API
  const pstString = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // Convert back into a Date object in PST context
  const pstDate = new Date(pstString);

  // Format YYYY-MM-DD
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0');
  const day = String(pstDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function getUrlDate() {
    if (path.startsWith("/history/")) {
        const date = path.split("/")[2];
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
    }
    return null;
}