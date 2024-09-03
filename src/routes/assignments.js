const express = require('express')
const router = express.Router()
const db = require('../db')

// Assign a user to a task
router.post('/', (req, res) => {
  const { taskId, userId } = req.body
  const query = 'INSERT INTO UserTaskAssignments (taskId, userId) VALUES (?, ?)'

  db.db.run(query, [taskId, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ taskId, userId })
  })
})

// Get all user assignments for a task
router.get('/task/:taskId', (req, res) => {
  const { taskId } = req.params
  const query = `
    SELECT Users.id, Users.username
    FROM UserTaskAssignments
    JOIN Users ON UserTaskAssignments.userId = Users.id
    WHERE UserTaskAssignments.taskId = ?
  `

  db.db.all(query, [taskId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(rows)
  })
})

// Get all tasks assigned to a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params
  const query = `
    SELECT Tasks.id, Tasks.title, Tasks.description
    FROM UserTaskAssignments
    JOIN Tasks ON UserTaskAssignments.taskId = Tasks.id
    WHERE UserTaskAssignments.userId = ?
  `

  db.db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(rows)
  })
})

// Remove a user assignment from a task
router.delete('/', (req, res) => {
  const { taskId, userId } = req.body
  const query =
    'DELETE FROM UserTaskAssignments WHERE taskId = ? AND userId = ?'

  db.db.run(query, [taskId, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Assignment not found' })
    }
    res.status(200).json({ message: 'Assignment removed successfully' })
  })
})

module.exports = router
