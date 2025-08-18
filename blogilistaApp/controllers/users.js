const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/users"); // ✅ huom! jos tiedosto on users.js

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "password must be at least 3 characters long",
    });
  }

  // Käyttäjä tunnusta ei tarvitse tarkastaa, koska sen pituus on määritelty models/users, ei voi olla alle 3 merkkiä.
  // Myös käyttäjä nimen unique on lisätty sinne

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    console.error("User creation error:", error);

    if (error.name === "ValidationError") {
      return response.status(400).json({ error: error.message });
    }

    if (error.code === 11000) {
      return response.status(400).json({ error: "username must be unique" });
    }

    response.status(500).json({ error: "something went wrong" });
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  });
  response.json(users);
});

module.exports = usersRouter;
