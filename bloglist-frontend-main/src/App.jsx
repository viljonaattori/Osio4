import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Notification from "./components/Notification";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

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
  const addBlog = async (event) => {
    event.preventDefault();

    // käyttäjä ei voi lisätä tyhjiä kenttiä
    if (!newTitle.trim() || !newAuthor.trim() || !newUrl.trim()) {
      showMessage("all fields are required", "error");
      return;
    }
    try {
      const newBlog = {
        title: newTitle,
        author: newAuthor,
        url: newUrl,
      };
      const returnedBlog = await blogService.create(newBlog);
      setBlogs(blogs.concat(returnedBlog));
      setNewTitle("");
      setNewAuthor("");
      setNewUrl("");
      showMessage(
        `a new blog '${returnedBlog.title}' by ${returnedBlog.author} added`,
        "success"
      );
    } catch (error) {
      showMessage("blogin lisäys epäonnistui", "error");
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

  // blog-lomake
  const blogForm = () => (
    <form onSubmit={addBlog}>
      <div>
        title:
        <input
          value={newTitle}
          onChange={({ target }) => setNewTitle(target.value)}
        />
      </div>
      <div>
        author:
        <input
          value={newAuthor}
          onChange={({ target }) => setNewAuthor(target.value)}
        />
      </div>
      <div>
        url:
        <input
          value={newUrl}
          onChange={({ target }) => setNewUrl(target.value)}
        />
      </div>
      <button type="submit">create</button>
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

      <h3>create new</h3>
      {blogForm()}

      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default App;
