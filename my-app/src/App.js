import logo from './logo.svg';
import './App.css';
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const callBackend = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hello");
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p>Lethbridge iGem</p>

        <button onClick={callBackend}>
          Test backend
        </button>

        {message && <p>{message}</p>}

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
