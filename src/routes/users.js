const express = require('express')
const router = express.Router()
const db = require('../db')

// Create a new user
router.post('/', (req, res) => {
  const { username } = req.body
  const query = 'INSERT INTO Users (username) VALUES (?)'

  db.db.run(query, [username], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ id: this.lastID, username })
  })
})

// Read all users
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Users'

  db.db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(rows)
  })
})

// Read a single user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM Users WHERE id = ?'

  db.db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(row)
  })
})

// Update a user by ID
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { username } = req.body
  const query = 'UPDATE Users SET username = ? WHERE id = ?'

  db.db.run(query, [username, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ id, username })
  })
})

// Delete a user by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM Users WHERE id = ?'

  db.db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ message: 'User deleted successfully' })
  })
})

module.exports = router
