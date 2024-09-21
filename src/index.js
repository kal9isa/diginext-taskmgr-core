const express = require('express')
const cors = require('cors')

const db = require('./db')
const userRoutes = require('./routes/users')
const workspaceRoutes = require('./routes/workspaces')
const boardRoutes = require('./routes/boards')
const taskRoutes = require('./routes/tasks')
const taskAssignmentsRoutes = require('./routes/assignments')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use('/users', userRoutes)
app.use('/workspaces', workspaceRoutes)
app.use('/boards', boardRoutes)
app.use('/tasks', taskRoutes)
app.use('/assignments', taskAssignmentsRoutes)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
})

process.on('SIGINT', async () => {
  await db.close()
  console.log('Shutting down the process!')
  process.exit()
})
