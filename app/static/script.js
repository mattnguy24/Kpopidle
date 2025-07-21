let answer = {
  name: "Jenny",
  group: "BLACKPINK",
  label: "YG",
  gender: "Female",
  age: 28,
  height: 163,
  debut: 2016,
};

const idols = [
  {
    name: "Jenny",
    group: "BLACKPINK",
    label: "YG",
    gender: "Female",
    age: 28,
    height: 163,
    debut: 2016,
  },
  {
    name: "Jisoo",
    group: "BLACKPINK",
    label: "YG",
    gender: "Female",
    age: 29,
    height: 162,
    debut: 2016,
  },
  {
    name: "Jungkook",
    group: "BTS",
    label: "HYBE",
    gender: "Male",
    age: 26,
    height: 178,
    debut: 2013,
  },
  {
    name: "V",
    group: "BTS",
    label: "HYBE",
    gender: "Male",
    age: 28,
    height: 179,
    debut: 2013,
  },
  {
    name: "RM",
    group: "BTS",
    label: "HYBE",
    gender: "Male",
    age: 29,
    height: 181,
    debut: 2013,
  },
  {
    name: "G-Dragon",
    group: "BIGBANG",
    label: "YG",
    gender: "Male",
    age: 35,
    height: 177,
    debut: 2006,
  },
  {
    name: "J-Hope",
    group: "BTS",
    label: "HYBE",
    gender: "Male",
    age: 30,
    height: 177,
    debut: 2013,
  },
  {
    name: "Taeyang",
    group: "BIGBANG",
    label: "YG",
    gender: "Male",
    age: 35,
    height: 173,
    debut: "2006",
  },
  {
    name: "T.O.P",
    group: "BIGBANG",
    label: "YG",
    gender: "Male",
    age: 37,
    height: 181,
    debut: 2006,
  },
  {
    name: "Chaewon",
    group: "LE SSERAFIM",
    label: "HYBE",
    gender: "Female",
    age: 23,
    height: 163,
    debut: 2022,
  },
];
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
      if (idol && boxNum < 8 && !selected.includes(idol)) {
        showIdolData(idol, boxNum);
        boxNum++;
        suggestionBox.innerHTML = "";
        inputBox.value = "";
      }
    });
  });
}

function showIdolData(idol, rowIndex) {
  const table = document.getElementById("guess-table");
  const row = table.rows[rowIndex];
  if (idol == answer) {
    answered = true;
    boxNum = 9;
  }
  row.innerHTML = `
    <td>${idol.name}</td>
    <td>${idol.group}</td>
    <td>${idol.label}</td>
    <td>${idol.gender}</td>
    <td>${idol.age}</td>
    <td>${idol.height}</td>
    <td>${idol.debut}</td>
  `;
  selected.push(idol);
}

function getHints(guess, answer) {
  const hints = {};

  ["name", "group", "label", "gender"].forEach((key) => {
    hints[key] = guess[key] === answer[key] ? "✅" : "🔴";
  });
  if (guess.age == answer.age) {
    feedback.age == "✅";
  } else {
    const ageDifference = answer.age - guess.age;
    if (ageDifference > 2) {
      hints[age] = "🔴⬆️";
    } else if (ageDifference < -2) {
      hints[age] = "🔴⬇️";
    } else if (ageDifference > 0) {
      hints[age] = "🟡⬆️";
    } else if (ageDifference > 0) {
      hints[age] = "🟡⬇️";
    }
  }

  if (guess.height == answer.height) {
    feedback.age == "✅";
  } else {
    const heightDifference = answer.age - guess.age;
    if (heightDifference > 2) {
      hints[height] = "🔴⬆️";
    } else if (heightDifference < -2) {
      hints[height] = "🔴⬇️";
    } else if (heightDifference > 0) {
      hints[height] = "🟡⬆️";
    } else if (heightDifference > 0) {
      hints[height] = "🟡⬇️";
    }
  }
}
