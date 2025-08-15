const { test, describe } = require("node:test");
const assert = require("node:assert");
const listHelper = require("../utils/list_helper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  assert.strictEqual(result, 1);
});

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
  ];

  const listWithManyBlogs = [
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    },
    {
      _id: "5a422aa71b54a676234123fd",
      title: "Blog two",
      author: "Helsingin avoin yliopisto",
      url: "https://fullstackopen.com/osa4/sovelluksen_rakenne_ja_testauksen_alkeet",
      likes: 6,
      __v: 0,
    },
    {
      _id: "5a422aa71b54a67623424f57",
      title: "Blog three",
      author: "Helsingin avoin yliopisto",
      url: "https://github.com/fullstack-hy2020/part3-notes-backend/blob/part3-7/models/note.js",
      likes: 12,
      __v: 0,
    },
  ];

  test("when list has only one blog equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });

  test("of a bigger list is calculated right", () => {
    const result = listHelper.totalLikes(listWithManyBlogs);
    assert.strictEqual(result, 23);
  });
});
