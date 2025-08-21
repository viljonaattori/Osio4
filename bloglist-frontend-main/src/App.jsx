import { useState, useEffect, useRef } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";
import BlogForm from "./components/BlogForm";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const blogFormRef = useRef();
  const sortedBlogs = [...blogs].sort(
    (a, b) => (b.likes ?? 0) - (a.likes ?? 0)
  ); // Like järjestys

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLike = async (blog) => {
    // backendille kkoko objecti
    const payload = {
      user: blog.user?.id || blog.user,
      likes: (blog.likes ?? 0) + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
    };

    const updated = await blogService.update(blog.id, payload);

    setBlogs((prev) =>
      prev.map((b) => (b.id === blog.id ? { ...updated, user: blog.user } : b))
    );
  };

  // apufunktio viestien näyttämiseen
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 5000);
  };

  // sisäänkirjautuminen
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem("loggedBlogAppUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
      showMessage(`Welcome ${user.name}`, "success");
    } catch (err) {
      showMessage("wrong credentials", "error");
    }
  };

  // uloskirjautuminen
  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogAppUser");
    setUser(null);
    blogService.setToken(null);
    showMessage("Logged out", "success");
  };

  // uuden blogin luonti
  const addBlog = async ({ title, author, url }) => {
    // pikkuruinen validointi
    if (!title?.trim() || !author?.trim() || !url?.trim()) {
      showMessage("all fields are required", "error");
      return;
    }

    try {
      const returnedBlog = await blogService.create({ title, author, url });
      setBlogs((prev) => prev.concat(returnedBlog));
      showMessage(
        `a new blog '${returnedBlog.title}' by ${returnedBlog.author} added`,
        "success"
      );
      // sulje lomake onnistumisen jälkeen
      blogFormRef.current?.toggleVisibility();
    } catch (error) {
      showMessage("blogin lisäys epäonnistui", "error");
    }
  };

  // Poisto
  const handleRemove = async (blog) => {
    const ok = window.confirm(`Remove blog ${blog.title} by ${blog.author}?`);
    if (!ok) return;

    try {
      await blogService.remove(blog.id);
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
      showMessage(`removed '${blog.title}' by ${blog.author}`, "success");
    } catch (e) {
      showMessage("blogin poisto epäonnistui", "error");
    }
  };

  // login-lomake
  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );

  if (user === null) {
    return (
      <div>
        <h2>Login to application</h2>
        <Notification message={message} type={messageType} />
        {loginForm()}
      </div>
    );
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message} type={messageType} />
      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="new blog" ref={blogFormRef}>
        <BlogForm onCreate={addBlog} />
      </Togglable>

      {sortedBlogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          onLike={handleLike}
          onRemove={handleRemove}
          currentUser={user}
        />
      ))}
    </div>
  );
};

export default App;
