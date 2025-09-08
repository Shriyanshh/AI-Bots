// server.js

import express from 'express';
import cors from 'cors';
import { run } from "./bot.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let taskQueue = {};


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
