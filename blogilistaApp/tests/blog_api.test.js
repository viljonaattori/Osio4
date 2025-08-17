const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Blog = require("../models/blog");

const api = supertest(app);

const initialBlogs = [
  { title: "First", author: "Matti", url: "http://eka", likes: 1 },
  { title: "Second", author: "Pertti", url: "http://toka", likes: 2 },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
});

test("GET /api/blogs palauttaa JSONia", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("GET /api/blogs palauttaa oikean määrän blogeja", async () => {
  const res = await api.get("/api/blogs");
  assert.equal(res.body.length, initialBlogs.length);
});

test("blogien tunnistekenttä on nimeltään id", async () => {
  const res = await api.get("/api/blogs");

  const blogs = res.body;

  blogs.forEach((blog) => {
    // varmistetaan että id on olemassa
    assert.ok(blog.id);
    // ja ettei _id näy
    assert.equal(blog._id, undefined);
  });
});

test("kahden blogin lisääminen kasvattaa blogien määrää kahdella", async () => {
  const newBlogs = [
    {
      title: "Testiblogi 1",
      author: "Testaaja Vili",
      url: "http://testi1.fi",
      likes: 10,
    },
    {
      title: "Testiblogi 2",
      author: "Testaaja Vili",
      url: "http://testi2.fi",
      likes: 20,
    },
  ];

  const blogsAtStart = await api.get("/api/blogs");

  for (const blog of newBlogs) {
    await api
      .post("/api/blogs")
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  }

  const blogsAtEnd = await api.get("/api/blogs");
  assert.equal(
    blogsAtEnd.body.length,
    blogsAtStart.body.length + newBlogs.length
  );

  const titles = blogsAtEnd.body.map((b) => b.title);
  assert(titles.includes("Testiblogi 1"));
  assert(titles.includes("Testiblogi 2"));
});

// Muokkaus testi
test("blogin poistaminen onnistuu", async () => {
  // hae kaikki blogit ennen poistoa
  const blogsAtStart = await api.get("/api/blogs");
  const blogToDelete = blogsAtStart.body[0]; // poistetaan ensimmäinen

  // tee delete-pyyntö
  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  // hae blogit uudelleen
  const blogsAtEnd = await api.get("/api/blogs");

  // varmistetaan poisto
  assert.equal(blogsAtEnd.body.length, blogsAtStart.body.length - 1);

  const ids = blogsAtEnd.body.map((b) => b.id);
  assert(!ids.includes(blogToDelete.id));
});

test("blogin likejen päivittäminen onnistuu", async () => {
  const blogsAtStart = await api.get("/api/blogs");
  const blogToUpdate = blogsAtStart.body[0];

  const updatedBlogData = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1,
  };

  const res = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlogData)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  // tarkistetaan, että tykkäykset kasvoi yhdellä
  assert.equal(res.body.likes, blogToUpdate.likes + 1);
});

after(async () => {
  await mongoose.connection.close();
});
