const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err));

// Schema
const ScoreSchema = new mongoose.Schema({
  playerName: String,
  score: Number,
  moves: Number,
  time: Number,
  difficulty: String,
  date: { type: Date, default: Date.now }
});

const Score = mongoose.model("Score", ScoreSchema);

// Save score
app.post("/api/scores", async (req, res) => {
  const newScore = new Score(req.body);
  await newScore.save();
  res.json({ message: "Score saved" });
});

// Get leaderboard
app.get("/api/scores", async (req, res) => {
  const difficulty = req.query.difficulty;

  const filter = difficulty ? { difficulty } : {};

  const scores = await Score.find(filter)
    .sort({ score: -1 })
    .limit(10);

  res.json(scores);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});