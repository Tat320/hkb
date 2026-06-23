const scenes = [
  {
    id: "entry",
    date: "1941.12",
    title: "武工隊入界",
    location: "新界",
    focus: "newTerritories",
    route: ["newTerritories", "shaTin"],
    body:
      "香港戰役爆發後，廣東人民抗日游擊隊第三、第五大隊派出武工隊進入新界，先清匪、做宣傳，再號召村民保衛家鄉。呢一步係港九大隊敵後網絡嘅起點。",
    stats: [
      ["行動", "入新界、清匪、宣傳"],
      ["目的", "建立根據地與村民聯絡"],
      ["時代", "香港淪陷初期"],
    ],
  },
  {
    id: "founding",
    date: "1942.02.03",
    title: "黃毛應村成立",
    location: "西貢黃毛應村",
    focus: "wongMoYing",
    route: ["newTerritories", "wongMoYing", "saiKung"],
    body:
      "1942 年 2 月 3 日，幾支進入香港的武工隊統一整合，在西貢黃毛應村成立港九大隊。西貢之後成為大本營，亦有赤徑、沙角尾等基地協調聯絡。",
    stats: [
      ["成立日", "1942-02-03"],
      ["核心基地", "西貢山區"],
      ["隊員", "多為本地居民"],
    ],
  },
  {
    id: "strike",
    date: "1944.01-1944.02",
    title: "沙田短槍隊與啟德襲擊",
    location: "沙田 / 啟德",
    focus: "shaTin",
    route: ["wongMoYing", "shaTin", "kaiTak"],
    body:
      "黃冠芳、劉黑仔帶領嘅沙田短槍隊喺獅子山下、茶果嶺、牛池灣、大灘海、窩塘等地多次襲擊日軍；1944 年初更偷襲啟德機場，炸毀飛機一架，迫使掃蕩新界嘅日軍後撤。",
    stats: [
      ["戰術", "短槍伏擊"],
      ["地點", "沙田、獅子山、啟德"],
      ["效果", "擾亂掃蕩與防務"],
    ],
  },
  {
    id: "sea",
    date: "1944",
    title: "海上中隊與情報網",
    location: "維港 / 海上",
    focus: "harbour",
    route: ["saiKung", "harbour"],
    body:
      "海上中隊先後經歷多次海戰，繳獲敵船、擊沉敵船，亦設立中環半山觀察點，24 小時監視維港日軍艦艇和軍事設施動向，提供持續情報支援。",
    stats: [
      ["能力", "海上游擊與偵察"],
      ["情報", "維港觀測與通報"],
      ["成果", "擾亂敵方補給與調度"],
    ],
  },
  {
    id: "rescue",
    date: "1944.02-1945",
    title: "營救盟軍與文化人士",
    location: "西貢 / 內地轉運",
    focus: "saiKung",
    route: ["harbour", "saiKung", "wongMoYing"],
    body:
      "港九大隊同前身武工隊亦營救過留港文化人士、英軍戰俘同美軍飛行員。Donald W. Kerr 同 J. Egan 先後獲救，港九大隊嘅情報與營救工作亦獲盟軍高度評價。",
    stats: [
      ["人物", "Kerr、Egan 等"],
      ["成果", "脫險、護送、轉運"],
      ["價值", "支援盟軍抗敵"],
    ],
  },
];

const pointMap = {
  newTerritories: { x: 27, y: 29, label: "新界" },
  wongMoYing: { x: 46, y: 34, label: "黃毛應村" },
  shaTin: { x: 39, y: 40, label: "沙田" },
  kaiTak: { x: 52, y: 57, label: "啟德" },
  saiKung: { x: 64, y: 49, label: "西貢" },
  harbour: { x: 71, y: 61, label: "維港" },
};

const timeline = document.getElementById("timeline");
const sceneTitle = document.getElementById("sceneTitle");
const sceneDate = document.getElementById("sceneDate");
const sceneBody = document.getElementById("sceneBody");
const sceneStats = document.getElementById("sceneStats");
const focusRing = document.getElementById("focusRing");
const locationTag = document.getElementById("locationTag");
const routeLine = document.getElementById("routeLine");
const progressBar = document.getElementById("progressBar");
const playToggle = document.getElementById("playToggle");
const jumpSources = document.getElementById("jumpSources");
const notesPanel = document.getElementById("notesPanel");
const closeNotes = document.getElementById("closeNotes");
const boot = document.getElementById("boot");
const bootMsg = document.getElementById("bootMsg");
const mapStage = document.getElementById("mapStage");
const points = [...document.querySelectorAll(".point")];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) {
  document.documentElement.classList.add("no-motion");
}

let activeIndex = 0;
let autoplay = true;
let startAt = performance.now();
let progress = 0;
const sceneDuration = 9000;

function formatDateLabel(dateText) {
  if (dateText.includes("-")) return dateText.replace("-", " → ");
  return dateText;
}

function buildRoute(ids) {
  return ids
    .map((id, index) => {
      const point = pointMap[id];
      const coords = `${point.x * 10},${point.y * 7.2}`;
      return `${index === 0 ? "M" : "L"} ${coords}`;
    })
    .join(" ");
}

function setMapFocus(pointId) {
  const point = pointMap[pointId];
  if (!point) return;

  const x = point.x;
  const y = point.y;
  focusRing.style.left = `${x}%`;
  focusRing.style.top = `${y}%`;
  locationTag.style.left = `${x}%`;
  locationTag.style.top = `${y}%`;
  locationTag.textContent = point.label;

  points.forEach((el) => {
    el.classList.toggle("is-active", el.dataset.point === pointId);
    const p = pointMap[el.dataset.point];
    el.style.setProperty("--x", p.x);
    el.style.setProperty("--y", p.y);
  });
}

function renderTimeline() {
  timeline.innerHTML = "";

  scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.className = "timeline-btn";
    button.type = "button";
    button.dataset.index = String(index);
    button.innerHTML = `
      <span class="date">${scene.date}</span>
      <span class="title">${scene.title}</span>
      <span class="desc">${scene.location}</span>
    `;
    button.addEventListener("click", () => {
      autoplay = true;
      playToggle.textContent = "自動導覽：開";
      setScene(index, true);
    });
    timeline.appendChild(button);
  });
}

function renderScene(index) {
  const scene = scenes[index];
  sceneTitle.textContent = scene.title;
  sceneDate.textContent = formatDateLabel(scene.date);
  sceneBody.textContent = scene.body;

  sceneStats.innerHTML = scene.stats
    .map(
      ([label, value]) => `
        <li><strong>${label}</strong><span>${value}</span></li>
      `,
    )
    .join("");

  routeLine.setAttribute("d", buildRoute(scene.route));
  setMapFocus(scene.focus);

  document.querySelectorAll(".timeline-btn").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
  });
}

function setScene(index, restartClock = false) {
  activeIndex = (index + scenes.length) % scenes.length;
  renderScene(activeIndex);
  if (restartClock) {
    startAt = performance.now();
    progress = 0;
  }
}

function nextScene() {
  setScene(activeIndex + 1, true);
}

function updateBoot() {
  bootMsg.textContent = "載入資料與導覽場景…";
  window.setTimeout(() => {
    boot.classList.add("is-hidden");
  }, 650);
}

function updatePlayButton() {
  playToggle.textContent = autoplay ? "自動導覽：開" : "自動導覽：停";
  playToggle.setAttribute("aria-pressed", String(autoplay));
}

function animate(now) {
  if (autoplay && !prefersReducedMotion) {
    progress = Math.min(1, (now - startAt) / sceneDuration);
    progressBar.style.width = `${progress * 100}%`;
    if (progress >= 1) {
      nextScene();
    }
  } else {
    progressBar.style.width = `${progress * 100}%`;
  }

  requestAnimationFrame(animate);
}

timeline.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    setScene(activeIndex + 1, true);
  }
  if (event.key === "ArrowLeft") {
    setScene(activeIndex - 1, true);
  }
});

playToggle.addEventListener("click", () => {
  autoplay = !autoplay;
  if (autoplay) {
    startAt = performance.now() - progress * sceneDuration;
  }
  updatePlayButton();
});

jumpSources.addEventListener("click", () => {
  notesPanel.classList.toggle("is-open");
  notesPanel.setAttribute("aria-hidden", String(!notesPanel.classList.contains("is-open")));
});

closeNotes.addEventListener("click", () => {
  notesPanel.classList.remove("is-open");
  notesPanel.setAttribute("aria-hidden", "true");
});

document.addEventListener("click", (event) => {
  if (!notesPanel.contains(event.target) && !jumpSources.contains(event.target)) {
    notesPanel.classList.remove("is-open");
    notesPanel.setAttribute("aria-hidden", "true");
  }
});

mapStage.addEventListener("pointermove", (event) => {
  const rect = mapStage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  mapStage.style.setProperty("--mx", `${(x - 0.5) * 24}px`);
  mapStage.style.setProperty("--my", `${(y - 0.5) * 24}px`);
  mapStage.style.transform = `translate3d(var(--mx, 0px), var(--my, 0px), 0) rotateX(${(0.5 - y) * 2.5}deg) rotateY(${(x - 0.5) * 2.5}deg)`;
});

mapStage.addEventListener("pointerleave", () => {
  mapStage.style.transform = "";
});

document.querySelectorAll(".point").forEach((pointEl) => {
  const point = pointMap[pointEl.dataset.point];
  pointEl.style.setProperty("--x", point.x);
  pointEl.style.setProperty("--y", point.y);
});

renderTimeline();
setScene(0, false);
updatePlayButton();
updateBoot();
requestAnimationFrame(animate);
