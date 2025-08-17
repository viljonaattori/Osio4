const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (!blogs || blogs.length === 0) return null;
  const fav = blogs.reduce(
    (max, b) => (b.likes > max.likes ? b : max),
    blogs[0]
  );

  return { title: fav.title, author: fav.author, likes: fav.likes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};

module.exports = {
  dummy,
  totalLikes,
};
