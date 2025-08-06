import React, { useState } from "react";
import logo from "../assets/digicon_logo.png";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "", // 'success', 'error', etc.
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://localhost:7105/api/Login/authenticate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ User: username, Password: password }),
        }
      );

      if (response.ok) {
        // Login OK
        onLogin();
        setAlert({
          open: true,
          message: "Login realizado com sucesso!",
          severity: "success",
        });
      } else {
        // Login falhou
        //setError("Usuário ou senha incorretos.");
        setAlert({
          open: true,
          message: "Usuário ou senha incorretos.",
          severity: "error",
        });
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
      setAlert({
        open: true,
        message: "Erro ao conectar ao servidor.",
        severity: "error",
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");

    try {
      const response = await fetch("http://localhost:7105/api/Login/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
        }),
      });

      if (response.ok) {
        //setRegisterMessage("Usuário criado com sucesso!");
        setNewUsername("");
        setNewPassword("");
        setAlert({
          open: true,
          message: "Usuário criado com sucesso!",
          severity: "success",
        });

        setTimeout(() => {
          setShowDialog(false);
          setRegisterMessage("");
        }, 1500);
      } else {
        setRegisterMessage("Erro ao criar usuário.");
        setAlert({
          open: true,
          message: "Erro ao criar usuário.",
          severity: "error",
        });
      }
    } catch (err) {
      setRegisterMessage("Erro ao conectar ao servidor.");
      setAlert({
        open: true,
        message: "Erro ao conectar ao servidor.",
        severity: "error",
      });
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

      {/* Snackbar para exibir alertas */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000} // Tempo de exibição do alerta
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          <AlertTitle>
            {alert.severity === "success" ? "Sucesso" : "Erro"}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
