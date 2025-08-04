import React, { useState } from "react";
import logo from "../assets/digicon_logo.png";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/Login/autenticar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Login OK
        onLogin();
      } else {
        // Login falhou
        setError("Usuário ou senha incorretos.");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");

    try {
      const response = await fetch("/api/Login/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      if (response.ok) {
        setRegisterMessage("Usuário criado com sucesso!");
        setNewUsername("");
        setNewPassword("");
        setTimeout(() => {
          setShowDialog(false);
          setRegisterMessage("");
        }, 1500);
      } else {
        setRegisterMessage("Erro ao criar usuário.");
      }
    } catch (err) {
      setRegisterMessage("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img src={logo} alt="Digicon Logo" className="login-logo" />
        <h2>QUALITY MANAGEMENT SYSTEM</h2>
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
        <button type="submit" className="button-login">
          Login
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <button
          type="button"
          className="button-cancelar"
          onClick={() => setShowDialog(true)}
        >
          Criar Usuário
        </button>
      </form>
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Criar Novo Usuário</h3>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Novo Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Nova Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit" className="create-button">
                Cadastrar
              </button>
              <button type="button" onClick={() => setShowDialog(false)}>
                Cancelar
              </button>
              {registerMessage && (
                <p style={{ marginTop: "10px", color: "green" }}>
                  {registerMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
