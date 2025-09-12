const express = require("express");
const db = require("../db");
const { authenticate, authorizeRole } = require("../middleware/auth");

const router = express.Router();

router.post("/:slug/upgrade", authenticate, authorizeRole("Admin"), (req, res) => {
  const { slug } = req.params;
  db.run("UPDATE tenants SET plan = 'PRO' WHERE slug = ?", [slug], function (err) {
    if (this.changes === 0) return res.status(404).json({ error: "Tenant not found" });
    res.json({ message: `Tenant ${slug} upgraded to PRO` });
  });
});

module.exports = router;
