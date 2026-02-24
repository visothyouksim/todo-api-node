const request = require("supertest");
const app = require("../app");

describe("Health & Root", () => {
  test("GET /health returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  test("GET / returns welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });
});

describe("Todos CRUD", () => {
  let createdId;

  test("POST /todos - creates a todo", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ title: "Test todo", description: "A description", status: "pending" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test todo");
    expect(res.body.id).toBeDefined();
    createdId = res.body.id;
  });

  test("POST /todos - fails without title", async () => {
    const res = await request(app).post("/todos").send({ description: "No title" });
    expect(res.status).toBe(422);
    expect(res.body.detail).toBe("title is required");
  });

  test("POST /todos - uses default status pending", async () => {
    const res = await request(app).post("/todos").send({ title: "No status" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  test("GET /todos - returns list", async () => {
    const res = await request(app).get("/todos");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /todos - supports skip and limit", async () => {
    const res = await request(app).get("/todos?skip=0&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });

  test("GET /todos/:id - returns a todo", async () => {
    const res = await request(app).get(`/todos/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  test("GET /todos/:id - returns 404 for unknown id", async () => {
    const res = await request(app).get("/todos/99999");
    expect(res.status).toBe(404);
    expect(res.body.detail).toBe("Todo not found");
  });

  test("PUT /todos/:id - updates a todo", async () => {
    const res = await request(app)
      .put(`/todos/${createdId}`)
      .send({ title: "Updated title", status: "done" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated title");
    expect(res.body.status).toBe("done");
  });

  test("PUT /todos/:id - returns 404 for unknown id", async () => {
    const res = await request(app).put("/todos/99999").send({ title: "X" });
    expect(res.status).toBe(404);
  });

  test("GET /todos/search/all - searches todos", async () => {
    const res = await request(app).get("/todos/search/all?q=Updated");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /todos/search/all - returns all on empty query", async () => {
    const res = await request(app).get("/todos/search/all");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("DELETE /todos/:id - deletes a todo", async () => {
    const res = await request(app).delete(`/todos/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.detail).toBe("Todo deleted");
  });

  test("DELETE /todos/:id - returns 404 for unknown id", async () => {
    const res = await request(app).delete("/todos/99999");
    expect(res.status).toBe(404);
  });

  test("DELETE /todos/:id - confirms deletion with GET", async () => {
    const create = await request(app).post("/todos").send({ title: "To delete" });
    const id = create.body.id;
    await request(app).delete(`/todos/${id}`);
    const res = await request(app).get(`/todos/${id}`);
    expect(res.status).toBe(404);
  });
});
