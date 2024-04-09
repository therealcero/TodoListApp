const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());

const port = 5000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'surya',
  password: 'root',
  database: 'todolist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(express.json());

// Route to handle adding a new task
app.post('/tasks', async (req, res) => {
    try {
      const { task, username } = req.body;
  
      // Insert the new task and username into the database
      const connection = await pool.getConnection();
      await connection.query('INSERT INTO listoftask (task, username) VALUES (?, ?)', [task, username]);
      connection.release();
      res.send('Task added successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

// Route to fetch existing tasks
app.get('/tasks/:username', async (req, res) => {
    try {
      const { username } = req.params;
  
      // Fetch tasks from the database for the specified username
      const connection = await pool.getConnection();
      const [tasks] = await connection.query('SELECT * FROM listoftask WHERE username = ?', [username]);
      connection.release();
      
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

// Route to handle deleting a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Delete the task from the database
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM listoftask WHERE id = ?', [taskId]);
    connection.release();
    
    res.send('Task deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle user registration
app.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Insert the user data into the database
      const connection = await pool.getConnection();
      await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    //   await connection.query('CREATE TABLE ? (id INT AUTO_INCREMENT PRIMARY KEY,task VARCHAR(255) NOT NULL);', [username]);
      connection.release();
      
      res.send('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // Route to handle user login
app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Fetch user from the database based on the provided username
      const connection = await pool.getConnection();
      const [users] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
      connection.release();
  
      // Check if a user with the provided username exists
      if (users.length === 0) {
        return res.status(401).send('Invalid username or password');
      }
  
      // Check if the password matches the one stored in the database
      const user = users[0];
      if (password !== user.password) {
        return res.status(401).send('Invalid username or password');
      }
  
      // Authentication successful
      res.json({ message: 'Login successful', username });
  
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
