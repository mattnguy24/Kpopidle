let answer = {
    "name": "Jennie",
    "group": "BLACKPINK",
    "label": "YG",
    "gender": "Female",
    "date_of_birth": "01-16-1996",
    "height": 163,
    "debut": 2016
};

const idolURL = 'https://zf4mlb0ylh.execute-api.us-east-1.amazonaws.com/production/idols';
fetch(idolURL)
    .then(response => {
      if (response.ok)
      {
        idols = response.json();
      }
      else
      {throw new Error ('API request failed');}
    })


let startTime = null;
let timerInterval = null;
const suggestionBox = document.querySelector(".suggestions");
const inputBox = document.getElementById("game-search");

const box1 = document.getElementById("box1");
const box2 = document.getElementById("box2");
const box3 = document.getElementById("box3");
const box4 = document.getElementById("box4");
const box5 = document.getElementById("box5");
const box6 = document.getElementById("box6");
const box7 = document.getElementById("box7");
const box8 = document.getElementById("box8");
let boxNum = 0;
let selected = [];
let answered = false;
inputBox.onkeyup = function () {
  let result = [];
  let input = inputBox.value;
  if (input.length) {
    result = idols.filter((idol) => {
      return idol.name.toLowerCase().includes(input.toLowerCase());
    });
  }
  display(result);
};

function display(result) {
  const content = result
    .map((idol) => {
      return `<li class="suggestions-item">${idol.name}</li>`;
    })
    .join("");
  suggestionBox.innerHTML = content;

  document.querySelectorAll(".suggestions-item").forEach((item) => {
    item.addEventListener("click", () => {
      const idol = idols.find((i) => i.name === item.textContent);
      if (idol && boxNum < 8 && !selected.includes(idol) && !answered) {
        showIdolData(idol, boxNum);
        boxNum++;
        suggestionBox.innerHTML = "";
        inputBox.value = "";
      }
    });
  });
}

function calculate_age(dateOfBirth) {
  const today = new Date();
  const dob = dateOfBirth.split('-');
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
  idol.debut == answer.debut) {
  answered = true;
  stopTimer();
}
  selected.push(idol);
}

function getHints(guess, answer) {
  const hints = {};

  ["name", "group", "label", "gender"].forEach((key) => {
    hints[key] = guess[key] === answer[key] ? "✅" : "🔴";
  });
  if (calculate_age(guess.date_of_birth) == calculate_age(answer.date_of_birth)) {
    hints.age = "✅";
  } else {
    const ageDifference = calculate_age(answer.date_of_birth) - calculate_age(guess.date_of_birth);
    if (ageDifference > 2) {
      hints.age = "🔴⬆️";
    } else if (ageDifference < -2) {
      hints.age = "🔴⬇️";
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
      hints.height = "🔴⬆️";
    } else if (heightDifference < -2) {
      hints.height = "🔴⬇️";
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
      hints.debut = "🔴⬆️";
    } else if (debutDifference < -2) {
      hints.debut = "🔴⬇️";
    } else if (debutDifference > 0) {
      hints.debut = "🟡⬆️";
    } else if (debutDifference < 0) {
      hints.debut = "🟡⬇️";
    }
  }
  return hints;
}

startTime = Date.now();
timerInterval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}, 1000);


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