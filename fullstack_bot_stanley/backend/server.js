// server.js

import express from 'express';
import cors from 'cors';
import { run } from "./bot.js";
import { registerUser, loginUser, verifyToken, getUserById } from "./auth.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let taskQueue = {};

// Authentication endpoints
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const user = await registerUser(email, password, username);
    res.json({ 
      success: true, 
      user,
      message: 'Account created successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    res.json({ 
      success: true, 
      user,
      token,
      userId: user.id,
      username: user.username,
      message: 'Login successful' 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Middleware to verify authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }

  req.user = user;
  next();
}


app.post('/start', async (req, res) => {
  const { id, url } = req.body;
  const task = {
    id,
    url,
    stopRunning: false
  };
  taskQueue[id] = task;
  
  try {
      await run(url, id); 
      console.log(`Task ${id} is done running`);
      delete taskQueue[id];
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      delete taskQueue[id];
    }
});

app.delete('/delete', (req, res) => {
  const { id } = req.body;
  const taskToDelete = taskQueue[id];
  if (taskToDelete) {
    taskToDelete.stopRunning = true;
    res.json({ success: true });
  }
  else {
    console.log("task in /delete wasnt found")
  }
});

app.post('/task/status', (req, res) => {
  const { id } = req.body;
  //const task = Object.values(taskQueue).find(task => task.url === url);
  const task = taskQueue[id];
  if (task) {
    res.json({ success: true, taskStatus: task.stopRunning });
  } else {
    res.status(404).json({ success: false, error: 'Task not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
