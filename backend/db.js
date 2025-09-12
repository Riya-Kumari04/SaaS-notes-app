const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

// Initialize schema
db.serialize(() => {
  db.run(`CREATE TABLE tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'FREE'
  )`);

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('Admin', 'Member')),
    tenant_id INTEGER,
    FOREIGN KEY(tenant_id) REFERENCES tenants(id)
  )`);

  db.run(`CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER,
    user_id INTEGER,
    content TEXT,
    FOREIGN KEY(tenant_id) REFERENCES tenants(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Seed tenants
  db.run(`INSERT INTO tenants (name, slug, plan) VALUES ('Acme', 'acme', 'FREE')`);
  db.run(`INSERT INTO tenants (name, slug, plan) VALUES ('Globex', 'globex', 'FREE')`);

  // Seed users (password is 'password')
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync("password", 8);

  db.run(`INSERT INTO users (email, password, role, tenant_id) VALUES ('admin@acme.test', ?, 'Admin', 1)`, [hash]);
  db.run(`INSERT INTO users (email, password, role, tenant_id) VALUES ('user@acme.test', ?, 'Member', 1)`, [hash]);
  db.run(`INSERT INTO users (email, password, role, tenant_id) VALUES ('admin@globex.test', ?, 'Admin', 2)`, [hash]);
  db.run(`INSERT INTO users (email, password, role, tenant_id) VALUES ('user@globex.test', ?, 'Member', 2)`, [hash]);
});

module.exports = db;
