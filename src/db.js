const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')

class Database {
  constructor() {
    if (!Database.instance) {
      const dbPath = './db/task-manager.sqlite'
      const dbFolder = './db'

      // Ensure the db folder exists
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder)
      }

      // Check if the '--setup' flag is passed as a console argument
      const runSetup = process.argv.includes('--setup')

      // If the --setup flag is passed, remove the existing database file
      if (runSetup && fs.existsSync(dbPath)) {
        console.log('Removing existing database...')
        fs.unlinkSync(dbPath) // Remove the previous db file
      }

      // Initialize the database connection
      this.db = new sqlite3.Database(dbPath)

      if (runSetup || !fs.existsSync(dbPath)) {
        console.log('Setting up tables...')
        this.setupTables()
      } else {
        console.log('Database already exists, skipping table setup.')
      }

      Database.instance = this
    }

    return Database.instance
  }

  setupUsersTable() {
    this.db.run(`
      CREATE TABLE Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP);
    );`)
  }

  setupWorkspacesTable() {
    this.db.run(`
      CREATE TABLE Workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
        owner INTEGER NOT NULL,
        FOREIGN KEY (owner) REFERENCES Users(id) ON DELETE CASCADE
      );`)
  }

  setupBoardsTable() {
    this.db.run(`
      CREATE TABLE Boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
        workspace INTEGER NOT NULL,
        FOREIGN KEY (workspace) REFERENCES Workspaces(id) ON DELETE CASCADE
      );`)
  }

  setupTasksTable() {
    this.db.run(`
      CREATE TABLE Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
        dueDate DATETIME,
        priority TEXT,
        timeEstimate INTEGER,
        timeSpent INTEGER,
        column INTEGER NOT NULL,
        board INTEGER NOT NULL,
        FOREIGN KEY (column) REFERENCES Columns(id) ON DELETE CASCADE
        FOREIGN KEY (board) REFERENCES Boards(id) ON DELETE CASCADE
      );`)
  }

  setupUserTaskAssignments() {
    this.db.run(`
      CREATE TABLE UserTaskAssignments (
        taskId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        PRIMARY KEY (taskId, userId)
      );`)
  }

  setupTaskActions() {
    this.db.run(`
      CREATE TABLE TaskActions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        action TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      );`)
  }

  setupColumnsTable() {
    this.db.run(`
      CREATE TABLE Columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        boardId INTEGER NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (boardId) REFERENCES Boards(id) ON DELETE CASCADE
      );
    `)
  }

  setupTables() {
    this.db.serialize(() => {
      this.setupUsersTable()
      this.setupWorkspacesTable()
      this.setupBoardsTable()
      this.setupColumnsTable()
      this.setupTasksTable()
      this.setupUserTaskAssignments()
      this.setupTaskActions()
    })
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
}

const instance = new Database()
// Ensures the singleton pattern is preserved
Object.freeze(instance)

module.exports = instance
