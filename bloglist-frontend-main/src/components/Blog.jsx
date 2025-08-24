// components/Blog.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const Blog = ({ blog, onLike, onRemove, currentUser }) => {
  const [expanded, setExpanded] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const canRemove = (() => {
    if (!currentUser || !blog.user) return false;
    if (typeof blog.user === "string") {
      return blog.user === currentUser.id;
    }
    return (
      blog.user.id === currentUser.id ||
      blog.user.username === currentUser.username
    );
  })();

  return (
    <div className="blog" style={blogStyle}>
      <div>
        {blog.title} {blog.author}{" "}
        <button
          className="toggle-btn"
          data-testid="toggle-view"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "hide" : "view"}
        </button>
      </div>

      {expanded && (
        <div className="blog-details">
          <div className="blog-url">{blog.url}</div>
          <div className="blog-likes" data-testid="likes-count">
            likes {blog.likes ?? 0}{" "}
            <button
              className="like-btn"
              data-testid="like-button"
              onClick={() => onLike(blog)}
            >
              like
            </button>
          </div>
          <div className="blog-user">{blog.user?.name ?? "unknown"}</div>

          {canRemove && (
            <button
              className="remove-btn"
              data-testid="remove-button"
              onClick={() => onRemove(blog)}
              style={{ marginTop: 6 }}
            >
              remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string,
    likes: PropTypes.number,
    user: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string,
      }),
      PropTypes.string,
    ]),
  }).isRequired,
  onLike: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default Blog;
