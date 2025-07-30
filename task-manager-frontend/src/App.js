import React, { useState, useEffect } from "react";

const API = "http://localhost:3000/api";

function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.msg || "Registered successfully! You can now log in.");
        setUsername("");
        setPassword("");
        // Optionally after register, prompt to login:
        onRegisterSuccess();
      } else {
        setMsg(data.msg || "Registration failed");
      }
    } catch {
      setMsg("Error connecting to server");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
      {msg && <p style={{ color: msg.includes("success") ? "green" : "red" }}>{msg}</p>}
    </form>
  );
}

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        onLoginSuccess(data.token);
      } else {
        setMsg(data.msg || "Login failed");
      }
    } catch {
      setMsg("Error connecting to server");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </form>
  );
}

function TaskManager({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  // Load tasks on mount and token change
  useEffect(() => {
    if (!token) return;
    const loadTasks = async () => {
      try {
        const res = await fetch(`${API}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if(res.status === 401) {
            onLogout();
          }
          setMsg("Failed to load tasks");
          return;
        }
        const data = await res.json();
        setTasks(data);
      } catch {
        setMsg("Error loading tasks");
      }
    };
    loadTasks();
  }, [token, onLogout]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMsg("Title required");
      return;
    }
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        setMsg("Error adding task");
        return;
      }
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setTitle("");
      setDescription("");
      setMsg("Task added");
    } catch {
      setMsg("Error connecting to server");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setMsg("Failed to delete task");
        return;
      }
      setTasks((prev) => prev.filter((task) => task._id !== id));
      setMsg("Task deleted");
    } catch {
      setMsg("Error deleting task");
    }
  };

  return (
    <div>
      <button onClick={() => { localStorage.removeItem("token"); onLogout(); }}>
        Logout
      </button>
      <h2>My Tasks</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {tasks.map((task) => (
          <li key={task._id} style={{ marginBottom: 8 }}>
            <b>{task.title}</b> - {task.status}
            {task.description && <div>{task.description}</div>}
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Task Manager</h1>
      {!token ? (
        <>
          {showRegister ? (
            <Register onRegisterSuccess={() => setShowRegister(false)} />
          ) : (
            <Login onLoginSuccess={(t) => setToken(t)} />
          )}
          <p style={{ marginTop: "10px" }}>
            {showRegister ? (
              <>
                Have an account?{" "}
                <button onClick={() => setShowRegister(false)}>Login</button>
              </>
            ) : (
              <>
                No account?{" "}
                <button onClick={() => setShowRegister(true)}>Register</button>
              </>
            )}
          </p>
        </>
      ) : (
        <TaskManager token={token} onLogout={() => setToken("")} />
      )}
    </div>
  );
}

export default App;
