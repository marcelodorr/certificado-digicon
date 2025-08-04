import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ConfigDialog.css";

const ConfigDialog = ({ onClose }) => {
  const [server, setServer] = useState("");
  const [database, setDatabase] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // Ao abrir, busca config do backend
  useEffect(() => {
    axios
      .get("https://localhost:7105/api/DbConfig")
      .then((res) => {
        const connectionString = res.data.defaultConnection || ""; // <- ajuste aqui
        const regex =
          /Server=([^;]+);Database=([^;]+);User Id=([^;]+);Password=([^;]+);?/i;

        const match = connectionString.match(regex);

        if (match) {
          setServer(match[1]);
          setDatabase(match[2]);
          setUser(match[3]);
          setPassword(match[4]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar configuração:", err);
      });
  }, []);

  const handleSave = async () => {
    const connectionString = `Server=${server};Database=${database};User Id=${user};Password=${password};Encrypt=True;TrustServerCertificate=True;`;

    try {
      const response = await fetch(
        "https://localhost:7105/api/DbConfig/update-connection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ defaultConnection: connectionString }),
        }
      );

      if (response.ok) {
        alert("Conexão salva com sucesso!");
        onClose();
      } else {
        const error = await response.json();
        console.error("Erro ao salvar conexão:", error);
        alert("Erro ao salvar conexão.");
      }
    } catch (err) {
      console.error("Erro de rede:", err);
      alert("Erro de rede ao tentar salvar.");
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h3>Configuração de Conexão</h3>
        <input
          type="text"
          placeholder="Servidor"
          value={server}
          onChange={(e) => setServer(e.target.value)}
        />
        <input
          type="text"
          placeholder="Banco de Dados"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
        />
        <input
          type="text"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="dialog-buttons">
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigDialog;
