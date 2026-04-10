const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

// In-memory data (NO DATABASE)
let tasks = [];

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "task-service is running" });
});

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Add task
app.post("/tasks", (req, res) => {
  const task = {
    id: Date.now(),
    title: req.body.title,
    status: req.body.status || "pending",
    date: req.body.date || new Date().toLocaleDateString(),
    assignedTo: req.body.assignedTo || "",
  };

  tasks.push(task);
  res.json(task);
});
// Delete task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter((task) => task.id !== id);

  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => {
  console.log(`Task Service running on port ${PORT}`);
});
