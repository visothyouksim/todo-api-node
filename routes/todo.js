const { Router } = require("express");
const { getDb, saveDb } = require("../database/database");

const router = Router();

// POST /todos
router.post("/", async (req, res) => {
  const { title, description = null, status = "pending" } = req.body;
  if (!title) {
    return res.status(422).json({ detail: "title is required" });
  }
  const db = await getDb();
  db.run("INSERT INTO todos (title, description, status) VALUES (?, ?, ?)", [title, description, status]);
  const id = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
  const row = db.exec("SELECT * FROM todos WHERE id = ?", [id]);
  saveDb();
  res.status(201).json(toObj(row));
});

// GET /todos
router.get("/", async (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const db = await getDb();
  const rows = db.exec("SELECT * FROM todos LIMIT ? OFFSET ?", [limit, skip]);
  res.json(toArray(rows));
});

// GET /todos/search — must be before /:id
router.get("/search/all", async (req, res) => {
  const q = req.query.q || "";
  const db = await getDb();
  // Safe parameterized query — no eval, no SQL injection
  const results = db.exec("SELECT * FROM todos WHERE title LIKE ?", [`%${q}%`]);
  res.json(toArray(results));
});

// GET /todos/:id
router.get("/:id", async (req, res) => {
  const db = await getDb();
  const rows = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!rows.length || !rows[0].values.length) {
    return res.status(404).json({ detail: "Todo not found" });
  }
  res.json(toObj(rows));
});

// PUT /todos/:id
router.put("/:id", async (req, res) => {
  const db = await getDb();
  const existing = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!existing.length || !existing[0].values.length) {
    return res.status(404).json({ detail: "Todo not found" });
  }

  const old = toObj(existing);
  const title = req.body.title ?? old.title;
  const description = req.body.description ?? old.description;
  const status = req.body.status ?? old.status;

  db.run("UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ?", [
    title, description, status, req.params.id,
  ]);
  const rows = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  saveDb();
  res.json(toObj(rows));
});

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const db = await getDb();
  const existing = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id]);
  if (!existing.length || !existing[0].values.length) {
    return res.status(404).json({ detail: "Todo not found" });
  }
  db.run("DELETE FROM todos WHERE id = ?", [req.params.id]);
  saveDb();
  res.json({ detail: "Todo deleted" });
});

// Helpers
function toObj(rows) {
  const cols = rows[0].columns;
  const vals = rows[0].values[0];
  const obj = {};
  cols.forEach((c, i) => (obj[c] = vals[i]));
  return obj;
}

function toArray(rows) {
  if (!rows.length) return [];
  const cols = rows[0].columns;
  return rows[0].values.map((vals) => {
    const obj = {};
    cols.forEach((c, i) => (obj[c] = vals[i]));
    return obj;
  });
}

module.exports = router;
