import React, { useEffect, useState } from "react";
import "./App.css";
import OperacoesPanel from "./components/OperacoesPanel";
import NormasPanel from "./components/NormasPanel";
import ClientePanel from "./components/ClientePanel";
import Home from "./components/Home";
import Login from "./components/Login";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaCog } from "react-icons/fa";
import ConfigDialog from "./components/ConfigDialog";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [showConfig, setShowConfig] = useState(false);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [painelAberto, setPainelAberto] = useState(null);
  const [moduloAberto, setModuloAberto] = useState(null);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [confirmarLogout, setConfirmarLogout] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPainelAberto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCadastro = () => setCadastroAberto(!cadastroAberto);
  const openPanel = (panel) => {
    setPainelAberto(panel);
    setModuloAberto(null);
  };
  const closeAllPanels = () => setPainelAberto(null);
  const abrirModulo = (modulo) => {
    setModuloAberto(modulo);
    setPainelAberto(null);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const confirmarESair = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    setPainelAberto(null);
    setModuloAberto(null);
    setCadastroAberto(false);
    setConfirmarLogout(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  if (!isAuthenticated) return <Login onLogin={handleLoginSuccess} />;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">digicon</div>

        <nav className="main-nav">
          <div
            className={`nav-item ${cadastroAberto ? "active" : ""}`}
            onClick={toggleCadastro}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === "Enter" && toggleCadastro()}
          >
            Cadastro
            <i
              className={`fas fa-chevron-${cadastroAberto ? "down" : "right"}`}
            ></i>
          </div>

          {cadastroAberto && (
            <div className="submenu">
              <div
                className="nav-subitem"
                onClick={() => openPanel("operacoes")}
              >
                Cadastro de Operações
              </div>
              <div className="nav-subitem" onClick={() => openPanel("normas")}>
                Cadastro de Normas
              </div>
              <div
                className="nav-subitem"
                onClick={() => openPanel("clientes")}
              >
                Cadastro de Clientes
              </div>
            </div>
          )}
        </nav>

        {/* Botão logout fixado no rodapé da sidebar */}
        <div className="sidebar-footer">
          <button
            className="btn-logout"
            onClick={() => setConfirmarLogout(true)}
            aria-label="Sair do sistema"
          >
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="config-button"
            title="Configurações"
          >
            <FaCog size={18} />
          </button>
          {showConfig && <ConfigDialog onClose={() => setShowConfig(false)} />}
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        {/* Painéis laterais */}
        {painelAberto && (
          <div className="overlay" onClick={closeAllPanels}>
            <div className="sidepanel" onClick={(e) => e.stopPropagation()}>
              <div className="sidepanel-header">
                <button
                  onClick={closeAllPanels}
                  className="close-sidepanel-button"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="sidepanel-body">
                {painelAberto === "operacoes" && <OperacoesPanel />}
                {painelAberto === "normas" && <NormasPanel />}
                {painelAberto === "clientes" && <ClientePanel />}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {!moduloAberto && (
          <section className="dashboard-tiles">
            {["Gerador de Certificado de Qualidade"].map((label, i) => (
              <div
                key={i}
                className="tile"
                onClick={() => abrirModulo("home")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && abrirModulo("home")}
              >
                <div className="tile-icon">
                  <i className="fas fa-home fa-3x"></i>
                </div>
                <div className="tile-label">{label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Módulo Home */}
        {moduloAberto === "home" && (
          <div className="module-container">
            <button
              onClick={() => setModuloAberto(null)}
              className="btn-back"
              aria-label="Voltar ao dashboard"
            >
              <span className="icon-back">←</span> Voltar
            </button>
            <Home />
          </div>
        )}

        {/* Rodapé */}
        <footer className="app-footer">
          <div className="datetime">
            <span>{horaAtual.toLocaleDateString("pt-BR")}</span>
            <br />
            <span>{horaAtual.toLocaleTimeString("pt-BR")}</span>
          </div>
          <a
            className="copy"
            href="https://4growco.com/"
            rel="noopener noreferrer"
          >
            &copy; 2025 4grow co Ltda.
          </a>
        </footer>
      </main>

      {/* Modal de Confirmação de Logout */}
      {confirmarLogout && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <p>Tem certeza que deseja sair?</p>
            <div className="modal-actions">
              <button onClick={confirmarESair} className="btn-confirm">
                Sim
              </button>
              <button
                onClick={() => setConfirmarLogout(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
