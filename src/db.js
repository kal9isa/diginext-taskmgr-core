const sqlite3 = require('sqlite3').verbose()

class Database {
  constructor() {
    if (!Database.instance) {
      this.db = new sqlite3.Database('./db/task-manager.sqlite')
      // this.setupTables()
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
        baseCol TEXT NOT NULL,
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
        status TEXT,
        timeEstimate INTEGER,
        timeSpent INTEGER,
        board INTEGER NOT NULL,
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

  setupTables() {
    this.db.serialize(() => {
      this.setupUsersTable()
      this.setupWorkspacesTable()
      this.setupBoardsTable()
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
