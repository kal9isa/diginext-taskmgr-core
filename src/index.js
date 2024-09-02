const express = require('express')
const cors = require('cors')
const db = require('./src/db')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
})

process.on('SIGINT', async () => {
  await db.close()
  console.log('Shutting down the process!')
  process.exit()
})
