<template>
  <div class="game">
    <h1>Puzzle Game</h1>

    <div class="stats">
      <p>Moves: {{ moves }}</p>
      <p>Time: {{ time }}s</p>
    </div>

    <div class="controls">
      <select v-model="gridSize" @change="resetGame">
        <option :value="3">Easy</option>
        <option :value="4">Medium</option>
        <option :value="5">Hard</option>
      </select>

      <button @click="shuffle">Shuffle / Restart</button>
    </div>

    <div
      class="board"
      :style="{ gridTemplateColumns: `repeat(${gridSize}, 80px)` }"
    >
      <div
        v-for="(tile, index) in tiles"
        :key="index"
        class="tile"
        @click="moveTile(index)"
      >
        {{ tile }}
      </div>
    </div>

    <!-- LEADERBOARD -->
    <div class="leaderboard">
      <h2>Leaderboard</h2>

      <div v-for="(s, i) in leaderboard" :key="i">
        {{ i + 1 }}. {{ s.playerName }} - {{ s.score }} ({{ s.difficulty }})
      </div>
    </div>

    <!-- WIN POPUP -->
    <div v-if="showWin" class="win-overlay">
      <div class="win-box">
        <h2>🎉 You Win!</h2>
        <p>Moves: {{ moves }}</p>
        <p>Time: {{ time }}s</p>

        <button @click="restartGame">Play Again</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const gridSize = ref(3);
const tiles = ref([]);
const moves = ref(0);
const time = ref(0);
const leaderboard = ref([]);
const showWin = ref(false);

let timer = null;

/* ---------------- GAME SETUP ---------------- */

function generateTiles() {
  const total = gridSize.value * gridSize.value;
  tiles.value = Array.from({ length: total - 1 }, (_, i) => i + 1);
  tiles.value.push("");
  shuffle();
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    time.value++;
  }, 1000);
}

function shuffle() {
  tiles.value = [...tiles.value].sort(() => Math.random() - 0.5);
  moves.value = 0;
  time.value = 0;
  clearInterval(timer);
  timer = null;
}

/* ---------------- GAME LOGIC ---------------- */

function checkWin() {
  const total = gridSize.value * gridSize.value;
  const win = Array.from({ length: total - 1 }, (_, i) => i + 1);
  win.push("");

  if (JSON.stringify(tiles.value) === JSON.stringify(win)) {
    clearInterval(timer);

    saveScore();
    loadLeaderboard();

    showWin.value = true;
  }
}

function moveTile(index) {
  const emptyIndex = tiles.value.indexOf("");

  const row = Math.floor(index / gridSize.value);
  const col = index % gridSize.value;

  const emptyRow = Math.floor(emptyIndex / gridSize.value);
  const emptyCol = emptyIndex % gridSize.value;

  const canMove =
    (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
    (col === emptyCol && Math.abs(row - emptyRow) === 1);

  if (canMove) {
    [tiles.value[index], tiles.value[emptyIndex]] =
      [tiles.value[emptyIndex], tiles.value[index]];

    moves.value++;
    startTimer();
    checkWin();
  }
}

/* ---------------- BACKEND ---------------- */

async function saveScore() {
  await fetch("http://localhost:5000/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerName: "Player1",
      score: Math.max(1000 - time.value * 10 - moves.value * 5, 0),
      moves: moves.value,
      time: time.value,
      difficulty:
        gridSize.value === 3
          ? "Easy"
          : gridSize.value === 4
          ? "Medium"
          : "Hard",
    }),
  });
}

async function loadLeaderboard() {
  const res = await fetch("http://localhost:5000/api/scores");
  leaderboard.value = await res.json();
}

/* ---------------- EXTRA ---------------- */

function resetGame() {
  generateTiles();
}

function restartGame() {
  showWin.value = false;
  generateTiles();
  moves.value = 0;
  time.value = 0;
}

/* ---------------- AUTO LOAD ---------------- */

onMounted(() => {
  generateTiles();
  loadLeaderboard();
});
</script>

<style>
.game {
  text-align: center;
  font-family: "Segoe UI", Arial, sans-serif;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
}

h1 {
  font-size: 36px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  font-size: 18px;
}

.controls {
  margin: 20px 0;
}

select,
button {
  padding: 10px 16px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  margin: 5px;
  cursor: pointer;
}

button {
  background: #3b82f6;
  color: white;
}

button:hover {
  background: #2563eb;
}

select {
  background: #1f2937;
  color: white;
}

.board {
  display: grid;
  gap: 8px;
  justify-content: center;
  margin: 30px auto;
  padding: 20px;
  width: fit-content;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.tile {
  width: 80px;
  height: 80px;
  background: #334155;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 22px;
  border-radius: 12px;
}

.tile:hover {
  transform: scale(1.05);
}

.leaderboard {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.06);
  width: 300px;
  margin: auto;
  border-radius: 15px;
}

/* WIN POPUP */
.win-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.win-box {
  background: #1e293b;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
}
</style>