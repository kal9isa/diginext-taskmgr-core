const express = require('express')
const router = express.Router()
const db = require('../db')

// Create a new board
router.post('/', (req, res) => {
  const { title, baseCol, workspace } = req.body
  const query =
    'INSERT INTO Boards (title, baseCol, workspace) VALUES (?, ?, ?)'

  db.db.run(query, [title, baseCol, workspace], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ id: this.lastID, title, baseCol, workspace })
  })
})

// Read all boards
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Boards'

  db.db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(rows)
  })
})

// Read a single board by ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT * FROM Boards WHERE id = ?'

  db.db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!row) {
      return res.status(404).json({ error: 'Board not found' })
    }
    res.status(200).json(row)
  })
})

// Update a board by ID
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { title, baseCol, workspace } = req.body
  const query =
    'UPDATE Boards SET title = ?, baseCol = ?, workspace = ? WHERE id = ?'

  db.db.run(query, [title, baseCol, workspace, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Board not found' })
    }
    res.status(200).json({ id, title, baseCol, workspace })
  })
})

// Delete a board by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM Boards WHERE id = ?'

  db.db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Board not found' })
    }
    res.status(200).json({ message: 'Board deleted successfully' })
  })
})

module.exports = router
