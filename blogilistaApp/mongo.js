require("dotenv").config();
const mongoose = require("mongoose");
const Blog = require("./models/blog");

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
    return Blog.find({});
  })
  .then((blogs) => {
    blogs.forEach((blog) => {
      console.log(blog);
    });
    return mongoose.connection.close();
  })
  .catch((error) => {
    console.error("error:", error.message);
    mongoose.connection.close();
  });
