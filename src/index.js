const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const db = require('./db')
const userRoutes = require('./routes/users')

const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json())

app.use('/users', userRoutes)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
})

process.on('SIGINT', async () => {
  await db.close()
  console.log('Shutting down the process!')
  process.exit()
})
