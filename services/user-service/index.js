const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5002;

// In-memory users
let users = [];

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "user-service is running" });
});

// Get users
app.get("/users", (req, res) => {
  res.json(users);
});

// Add user
app.post("/users", (req, res) => {
  const { name } = req.body;

  const newUser = {
    id: Date.now(),
    name,
  };

  users.push(newUser);
  res.json(newUser);
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter((user) => user.id !== id);

  res.json({ message: "User deleted" });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
