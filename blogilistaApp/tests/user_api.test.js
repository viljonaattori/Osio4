const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/users");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const user = new User({ username: "root", passwordHash: "sekret" });
  await user.save();
});

test("epäkelpo käyttäjä (liian lyhyt salasana) HYLÄTTY", async () => {
  const newUser = {
    username: "validuser",
    name: "Test User",
    password: "pw",
  };

  const res = await api.post("/api/users").send(newUser).expect(400);
  assert.match(res.body.error, /password must be at least 3/i);

  const usersAtEnd = await User.find({});
  assert.equal(usersAtEnd.length, 1);
});

test("epäkelpo käyttäjä (duplikaatti username) HYLÄTTY", async () => {
  const newUser = {
    username: "root",
    name: "Duplicate User",
    password: "secret123",
  };

  const res = await api.post("/api/users").send(newUser).expect(400);
  assert.match(res.body.error, /unique/i);

  const usersAtEnd = await User.find({});
  assert.equal(usersAtEnd.length, 1); // vain root on tallessa
});

after(async () => {
  await mongoose.connection.close();
});
