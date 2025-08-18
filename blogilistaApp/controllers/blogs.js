const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

// Haku
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

// Lisäys
blogsRouter.post("/", async (request, response) => {
  const body = request.body;

  // --- Token haetaan headerista ---
  const authorization = request.get("authorization");
  let token = null;
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    token = authorization.substring(7);
  }

  if (!token) {
    return response.status(401).json({ error: "token missing" });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return response.status(401).json({ error: "token invalid" });
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  // --- Haetaan käyttäjä ---
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

// Poisto
blogsRouter.delete("/:id", async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Muokkaus
blogsRouter.put("/:id", async (request, response, next) => {
  try {
    const { title, author, url, likes } = request.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes },
      { new: true, runValidators: true, context: "query" }
    );

    if (updatedBlog) {
      response.json(updatedBlog);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
