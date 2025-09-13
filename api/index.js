import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ Example Notes endpoint
app.get("/api/notes", (req, res) => {
  res.json([{ id: 1, title: "First note" }]);
});

// ❌ Remove: app.listen(3000, ...)
export default app;
