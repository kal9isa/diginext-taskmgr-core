const sqlite3 = require('sqlite3').verbose()
const { promisify } = require('util')

class Database {
  constructor() {
    if (!Database.instance) {
      this.db = new sqlite3.Database('./db/task-manager.sqlite')
      this.run = promisify(this.db.run.bind(this.db))
      this.get = promisify(this.db.get.bind(this.db))
      this.all = promisify(this.db.all.bind(this.db))
      this.setupTables()
      Database.instance = this
    }

    return Database.instance
  }

  async setupUsersTable() {
    await this.db.run(`
      DROP TABLE IF EXISTS Users;
      CREATE TABLE Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP);
    );`)
  }

  async setupWorkspacesTable() {
    await this.db.run(`
      DROP TABLE IF EXISTS Workspaces;
      CREATE TABLE Workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
        owner INTEGER NOT NULL,
        FOREIGN KEY (owner) REFERENCES Users(id) ON DELETE CASCADE
      );`)
  }

  async setupBoardsTable() {
    await this.db.run(`
      DROP TABLE IF EXISTS Boards;
      CREATE TABLE Boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
        baseCol TEXT NOT NULL,
        workspace INTEGER NOT NULL,
        FOREIGN KEY (workspace) REFERENCES Workspaces(id) ON DELETE CASCADE
      );`)
  }

  async setupTasksTable() {
    await this.db.run(`
      DROP TABLE IF EXISTS Tasks;
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

  async setupUserTaskAssgn() {
    await this.db.run(`
      DROP TABLE IF EXISTS UserTaskAssignments;
      CREATE TABLE UserTaskAssignments (
      taskId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
      PRIMARY KEY (taskId, userId)
    );`)
  }

  async setupUserTaskAssignments() {
    await this.db.run(`
      DROP TABLE IF EXISTS TaskActions;
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

  async setupTables() {
    try {
      await this.setupUsersTable()
      await this.setupWorkspacesTable()
      await this.setupBoardsTable()
      await this.setupTasksTable()
      await this.setupUserTaskAssignments()
      await this.setupTaskActions()
      console.log('All tables have been set up successfully.')
    } catch (err) {
      console.error('Error setting up tables:', err.message)
    }
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  // Example query method
  //   query(sql, params = []) {
  //     return new Promise((resolve, reject) => {
  //       this.db.all(sql, params, (err, rows) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve(rows);
  //         }
  //       });
  //     });
  //   }
}

const instance = new Database()
// Ensures the singleton pattern is preserved
Object.freeze(instance)

module.exports = instance
