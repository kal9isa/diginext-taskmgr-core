const express = require('express')
const router = express.Router()
const db = require('../db')

// Create a new board
router.post('/', (req, res) => {
  const { title, workspace } = req.body
  const query = 'INSERT INTO Boards (title,  workspace) VALUES (?, ?)'

  db.db.run(query, [title, workspace], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ id: this.lastID, title, workspace })
  })
})

// Create a new column in board
router.post('/:id/column/', (req, res) => {
  const { id: boardId } = req.params // Read boardId from URL parameter

  const { title, position } = req.body // Read title and position from the request body

  const query =
    'INSERT INTO Columns (title, boardId, position) VALUES (?, ?, ?)'

  db.db.run(query, [title, boardId, position], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.status(201).json({ id: this.lastID, title, boardId, position })
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
// TODO remove boardId from column data
router.get('/:id', (req, res) => {
  const { id } = req.params

  const boardQuery = 'SELECT * FROM Boards WHERE id = ?'
  const columnsQuery =
    'SELECT * FROM Columns WHERE boardId = ? ORDER BY position'
  const tasksQuery = `
    SELECT t.id, t.title AS name, t.dueDate, 
      GROUP_CONCAT(u.username) AS assignees, 
      t.column AS columnId
      FROM Tasks t
      LEFT JOIN UserTaskAssignments uta ON t.id = uta.taskId
      LEFT JOIN Users u ON uta.userId = u.id
      WHERE t.column = ?
      GROUP BY t.id
  `

  // Fetch the board data
  db.db.get(boardQuery, [id], (err, board) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    // Fetch columns for the board
    db.db.all(columnsQuery, [id], (err, columns) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      board.columns = columns // Attach columns to the board

      // Fetch tasks for the board
      db.db.all(tasksQuery, [id], (err, tasks) => {
        if (err) {
          return res.status(500).json({ error: err.message })
        }

        // Process tasks to convert the assignees string into an array
        tasks = tasks.map((task) => ({
          ...task,
          assignees: task.assignees ? task.assignees.split(',') : [], // Convert to array
        }))

        // Attach tasks to the board
        board.tasks = tasks
        res.status(200).json(board)
      })
    })
  })
})

// Update a board by ID
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { title, workspace } = req.body
  const query = 'UPDATE Boards SET title = ?, workspace = ? WHERE id = ?'

  db.db.run(query, [title, workspace, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Board not found' })
    }
    res.status(200).json({ id, title, workspace })
  })
})

// Update a column's title in a specific board
router.put('/:id/column/', (req, res) => {
  const { id: boardId } = req.params
  const { title, columnId } = req.body

  // Check if the title is provided
  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const query = 'UPDATE Columns SET title = ? WHERE id = ? AND boardId = ?'

  db.db.run(query, [title, columnId, boardId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ error: 'Column not found or does not belong to this board' })
    }
    res
      .status(200)
      .json({ message: 'Column title updated successfully', columnId, title })
  })
})

// Update column order in a specific board
router.put('/:id/columns', (req, res) => {
  const { id: boardId } = req.params
  const columns = req.body.columns // Expecting an array of { id, title, position }

  if (!Array.isArray(columns) || columns.length === 0) {
    return res.status(400).json({ error: 'Invalid column data' })
  }

  const updateQuery =
    'UPDATE Columns SET title = ?, position = ? WHERE id = ? AND boardId = ?'
  const queries = []

  // Prepare the queries for updating multiple columns
  columns.forEach((column) => {
    const { id, title, position } = column
    queries.push(
      new Promise((resolve, reject) => {
        db.db.run(updateQuery, [title, position, id, boardId], function (err) {
          if (err) {
            return reject(err)
          }
          resolve(this.changes) // Return number of rows affected
        })
      })
    )
  })

  // Execute all updates in parallel
  Promise.all(queries)
    .then((results) => {
      // Check if no columns were updated
      const totalChanges = results.reduce((sum, changes) => sum + changes, 0)
      if (totalChanges === 0) {
        return res.status(404).json({ error: 'No columns were updated' })
      }
      res.status(200).json({
        message: 'Columns updated successfully',
        updated: totalChanges,
      })
    })
    .catch((err) => {
      res.status(500).json({ error: err.message })
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

// Delete a column in a specific board
router.delete('/:id/column/:columnId', (req, res) => {
  const { id, columnId } = req.params
  const query = 'DELETE FROM Columns WHERE id = ? AND boardId = ?'

  db.db.run(query, [columnId, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ error: 'Column not found or does not belong to this board' })
    }
    res.status(200).json({ message: 'Column deleted successfully' })
  })
})

module.exports = router
