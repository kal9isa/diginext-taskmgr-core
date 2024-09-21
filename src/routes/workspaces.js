const express = require('express')
const router = express.Router()
const db = require('../db')

// Create a new workspace
router.post('/', (req, res) => {
  const { title, owner } = req.body
  const query = 'INSERT INTO Workspaces (title, owner) VALUES (?, ?)'

  db.db.run(query, [title, owner], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ id: this.lastID, title, owner })
  })
})

// Read all workspaces
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Workspaces'

  db.db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(200).json(rows)
  })
})

// Read a single workspace by ID
// TODO id, name of all boards in it
router.get('/:id', (req, res) => {
  const { id } = req.params

  // First, retrieve the workspace
  const workspaceQuery = 'SELECT * FROM Workspaces WHERE id = ?'

  db.db.get(workspaceQuery, [id], (err, workspace) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    // Now, retrieve the boards associated with this workspace
    const boardsQuery = 'SELECT id, title FROM Boards WHERE workspace = ?'

    db.db.all(boardsQuery, [id], (err, boards) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      // Respond with both workspace and boards
      res.status(200).json({
        workspace,
        boards,
      })
    })
  })
})

// Update a workspace by ID
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { title, owner } = req.body
  const query = 'UPDATE Workspaces SET title = ?, owner = ? WHERE id = ?'

  db.db.run(query, [title, owner, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workspace not found' })
    }
    res.status(200).json({ id, title, owner })
  })
})

// Delete a workspace by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const query = 'DELETE FROM Workspaces WHERE id = ?'

  db.db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workspace not found' })
    }
    res.status(200).json({ message: 'Workspace deleted successfully' })
  })
})

module.exports = router
