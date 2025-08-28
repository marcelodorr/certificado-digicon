import React, { useState, useEffect } from "react";
import api from "../services/api"; // ✅ usa cliente centralizado
import "./ConfigDialog.css";

const ConfigDialog = ({ onClose }) => {
  const [server, setServer] = useState("");
  const [database, setDatabase] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // Ao abrir, busca config do backend
  useEffect(() => {
    api
      .get("/api/DbConfig")
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
      await api.post("/api/DbConfig/update-connection", {
        defaultConnection: connectionString,
      });

      alert("Conexão salva com sucesso!");
      onClose();
    } catch (err) {
      console.error("Erro ao salvar conexão:", err);
      alert("Erro ao salvar conexão.");
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
