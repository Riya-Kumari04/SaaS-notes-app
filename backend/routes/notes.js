const express = require("express");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Create Note
router.post("/", authenticate, (req, res) => {
  const { content } = req.body;
  const { tenant_id, id: user_id } = req.user;

  // Check tenant plan + note count
  db.get("SELECT plan FROM tenants WHERE id = ?", [tenant_id], (err, tenant) => {
    if (tenant.plan === "FREE") {
      db.get("SELECT COUNT(*) as count FROM notes WHERE tenant_id = ?", [tenant_id], (err, row) => {
        if (row.count >= 3) {
          return res.status(403).json({ error: "Free plan limit reached. Upgrade to Pro." });
        }
        insertNote();
      });
    } else {
      insertNote();
    }
  });

  function insertNote() {
    db.run(
      "INSERT INTO notes (tenant_id, user_id, content) VALUES (?, ?, ?)",
      [tenant_id, user_id, content],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, content });
      }
    );
  }
});

// List Notes
router.get("/", authenticate, (req, res) => {
  const { tenant_id } = req.user;
  db.all("SELECT * FROM notes WHERE tenant_id = ?", [tenant_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get Single Note
router.get("/:id", authenticate, (req, res) => {
  const { tenant_id } = req.user;
  db.get("SELECT * FROM notes WHERE id = ? AND tenant_id = ?", [req.params.id, tenant_id], (err, note) => {
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  });
});

// Update Note
router.put("/:id", authenticate, (req, res) => {
  const { tenant_id } = req.user;
  const { content } = req.body;

  db.run(
    "UPDATE notes SET content = ? WHERE id = ? AND tenant_id = ?",
    [content, req.params.id, tenant_id],
    function (err) {
      if (this.changes === 0) return res.status(404).json({ error: "Note not found" });
      res.json({ message: "Note updated" });
    }
  );
});

// Delete Note
router.delete("/:id", authenticate, (req, res) => {
  const { tenant_id } = req.user;
  db.run("DELETE FROM notes WHERE id = ? AND tenant_id = ?", [req.params.id, tenant_id], function (err) {
    if (this.changes === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  });
});

module.exports = router;
