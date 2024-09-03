const express = require('express')
const router = express.Router()
const db = require('../db') // Your db.js file

// Create a new task
router.post('/', (req, res) => {
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    timeEstimate,
    timeSpent,
    board,
  } = req.body
  const query = `INSERT INTO Tasks (title, description, dueDate, priority, status, timeEstimate, timeSpent, board) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

  db.db.run(
    query,
    [
      title,
      description,
      dueDate,
      priority,
      status,
      timeEstimate,
      timeSpent,
      board,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res
        .status(201)
        .json({
          id: this.lastID,
          title,
          description,
          dueDate,
          priority,
          status,
          timeEstimate,
          timeSpent,
          board,
        })
    }
  )
})

// Read all tasks
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Tasks'

  db.db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(rows)
  })
})

// Read a single task by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM Tasks WHERE id = ?'

  db.db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.status(200).json(row)
  })
})

// Update a task by ID
router.put('/:id', (req, res) => {
  const { id } = req.params
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    timeEstimate,
    timeSpent,
    board,
  } = req.body
  const query = `UPDATE Tasks 
                 SET title = ?, description = ?, dueDate = ?, priority = ?, status = ?, timeEstimate = ?, timeSpent = ?, board = ? 
                 WHERE id = ?`

  db.db.run(
    query,
    [
      title,
      description,
      dueDate,
      priority,
      status,
      timeEstimate,
      timeSpent,
      board,
      id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' })
      }
      res
        .status(200)
        .json({
          id,
          title,
          description,
          dueDate,
          priority,
          status,
          timeEstimate,
          timeSpent,
          board,
        })
    }
  )
})

// Delete a task by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM Tasks WHERE id = ?'

  db.db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.status(200).json({ message: 'Task deleted successfully' })
  })
})

module.exports = router
