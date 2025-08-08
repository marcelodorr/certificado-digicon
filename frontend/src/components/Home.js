import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import Select from "react-select";
import { DataGrid } from "@mui/x-data-grid";
import FolderIcon from "@mui/icons-material/Folder";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
} from "@mui/material";

function TransitionRight(props) {
  // entra pela direita -> direction "left"
  return <Slide {...props} direction="left" />;
}

function Home() {
  const [ordens, setOrdens] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [normas, setNormas] = useState([]);
  const [dataAtual, setDataAtual] = useState("");
  const [numeroCertificado, setNumeroCertificado] = useState("");

  // Dialogs
  const [openDialogPDF, setOpenDialogPDF] = useState(false);
  const [openDialogPath, setOpenDialogPath] = useState(false);

  const [certificadosExistentes, setCertificadosExistentes] = useState([]);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState("");
  const [novoCaminhoPDF, setNovoCaminhoPDF] = useState("");

  // Snackbar/Alert
  const [toast, setToast] = useState({
    open: false,
    severity: "info", // "success" | "info" | "warning" | "error"
    title: "",
    message: "",
  });

  const handleOpenDialogPDF = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:7105/api/QualityCertificate/lista"
      );
      setCertificadosExistentes(Array.isArray(data) ? data : []);
      if (!data || data.length === 0) {
        openToast("info", "Sem certificados", "Não há certificados salvos.");
      }
    } catch (err) {
      openToast(
        "error",
        "Erro ao buscar certificados",
        err?.response?.data?.message || err.message
      );
      setCertificadosExistentes([]);
    } finally {
      setOpenDialogPDF(true);
    }
  };

  const openToast = (severity, title, message) =>
    setToast({ open: true, severity, title, message });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  // fora do componente OU antes do useState
  const initialCampos = () => ({
    opEleb: "",
    poEleb: "",
    codCliente: "",
    partNumber: "",
    valorPeca: "",
    qtdSaldo: "",
    analisePo: "",
    revisaoDesenho: "",
    decapagem: "",
    snDecapagem: "",
    snPeca: "",
    operacaoDescricao: "",
    fornecedor: "",
    relatorioInspecao: "",
    certificadoMP: "",
    responsavel: "",
    desenhoLP: "",
    observacoes: "",
    tipoEnvio: "",
    cliente: "",
    cd: "",
    lote: "",
  });

  const [campos, setCampos] = useState(initialCampos());

  const resetForm = async () => {
    setCampos(initialCampos()); // limpa todos os campos
    setNormas([]); // limpa grid
    setCertificadoSelecionado("");
    setOpenDialogPDF(false);
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#fff",
      borderColor: state.isFocused ? "#a81818" : "#d9d9d9",
      boxShadow: "none",
      ":hover": { borderColor: state.isFocused ? "#a81818" : "#d9d9d9" },
      minHeight: 40,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, backgroundColor: "#fff" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#eaeaea"
        : state.isFocused
        ? "#f2f2f2"
        : "#fff",
      color: "#333",
    }),
  };

  const selectTheme = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary: "#a81818",
      primary75: "#a81818",
      primary50: "#e8c7c7",
      primary25: "#f2f2f2",
      neutral20: "#d9d9d9",
      neutral30: "#a81818",
    },
  });

  // Carregar certificado, data e ordens
  useEffect(() => {
    axios
      .get("http://localhost:7105/api/QualityCertificate/novo-certificado")
      .then((res) => setNumeroCertificado(res.data.numero))
      .catch((err) =>
        openToast(
          "error",
          "Falha ao obter número",
          err?.response?.data?.message || err.message
        )
      );

    setDataAtual(new Date().toLocaleDateString("pt-BR"));

    axios
      .get("http://localhost:7105/api/ControleEleb/ordens-finalizadas")
      .then((res) => setOrdens(res.data))
      .catch((err) =>
        openToast(
          "error",
          "Erro ao carregar ordens",
          err?.response?.data?.message || err.message
        )
      );

    axios
      .get("http://localhost:7105/api/Operacao")
      .then((res) => setOperacoes(res.data))
      .catch((err) =>
        openToast(
          "error",
          "Erro ao carregar operações",
          err?.response?.data?.message || err.message
        )
      );
  }, []);

  // Carregar normas por partNumber
  useEffect(() => {
    if (campos.partNumber) {
      axios
        .get(`http://localhost:7105/api/Norma/partnumber/${campos.partNumber}`)
        .then((res) => setNormas(res.data))
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            setNormas([]); // sem normas
          } else {
            openToast(
              "error",
              "Erro ao carregar normas",
              err?.response?.data?.message || err.message
            );
          }
        });
    } else {
      setNormas([]);
    }
  }, [campos.partNumber]);

  // Seleção de ordem
  const handleOpChange = (option) => {
    const ordem = ordens.find((o) => o.opEleb === option?.value);
    if (!ordem) return;
    setCampos({
      opEleb: ordem.opEleb || "N/A",
      poEleb: ordem.poEleb || "N/A",
      codCliente: ordem.codEleb || "N/A",
      partNumber: ordem.partNumber || "N/A",
      valorPeca: ordem.valorPeca?.toString() || "N/A",
      qtdSaldo: ordem.qtdSaldo?.toString() || "N/A",
      analisePo: ordem.analisePo || "N/A",
      revisaoDesenho: ordem.revisaoDesenho || "N/A",
      decapagem: ordem.decapagem || "N/A",
      snDecapagem: ordem.snDecap || "N/A",
      snPeca: ordem.snPeca || "N/A",
      fornecedor: "Digicon",
      relatorioInspecao: "N/A",
      certificadoMP: "N/A",
      responsavel: "Anderson Siegle Muller",
      desenhoLP: "N/A",
      observacoes: "N/A",
      tipoEnvio: "",
      cliente: ordem.cliente || "N/A",
      cd: ordem.cd || "N/A",
      lote: ordem.lote || "N/A",
      operacaoDescricao: "",
    });
  };

  // Atualizar campo
  const handleChangeCampo = (nome, valor) => {
    setCampos((prev) => ({ ...prev, [nome]: valor }));
  };

  // Salvar certificado
  const handleSalvar = async () => {
    const payload = {
      NumeroCertificado: numeroCertificado,
      Ordem: campos.opEleb,
      OC: campos.poEleb,
      CodigoCliente: campos.codCliente,
      PartNumber: campos.partNumber,
      ValorPeca: campos.valorPeca,
      Quantidade: campos.qtdSaldo,
      AnalisePo: campos.analisePo,
      RevisaoDesenho: campos.revisaoDesenho,
      Decapagem: campos.decapagem,
      SNDecapagem: campos.snDecapagem,
      SNPeca: campos.snPeca,
      Fornecedor: campos.fornecedor,
      RelatorioInspecao: campos.relatorioInspecao,
      CertificadoMP: campos.certificadoMP,
      Responsavel: campos.responsavel,
      DesenhoLP: campos.desenhoLP,
      Observacoes: campos.observacoes,
      TipoEnvio: campos.tipoEnvio,
      Data: dataAtual,
      cliente: campos.cliente,
      cd: campos.cd,
      lote: campos.lote,
      operacaoDescricao: "",
      CDChamado: campos.cd || "N/A",
      DescricaoOperacao: campos.operacaoDescricao || "N/A",
    };

    if (!payload.CDChamado || !payload.DescricaoOperacao) {
      openToast(
        "warning",
        "Campos obrigatórios",
        "Preencha o CD/Chamado e a Descrição da Operação."
      );
      return;
    }

    try {
      await axios.post("http://localhost:7105/api/QualityCertificate", payload);
      await axios.put("http://localhost:7105/api/ControleEleb/liberar", {
        opEleb: campos.opEleb,
        numeroCertificado: numeroCertificado,
      });

      openToast(
        "success",
        "Certificado salvo",
        "O certificado foi salvo e a OP liberada com sucesso."
      );

      // novo número
      axios
        .get("http://localhost:7105/api/QualityCertificate/novo-certificado")
        .then((res) => setNumeroCertificado(res.data.numero))
        .catch((err) =>
          openToast(
            "error",
            "Falha ao obter novo número",
            err?.response?.data?.message || err.message
          )
        );

      setDataAtual(new Date().toLocaleDateString("pt-BR"));
      setOrdens((prev) => prev.filter((o) => o.opEleb !== campos.opEleb));
      await resetForm();
    } catch (err) {
      openToast(
        "error",
        "Erro ao salvar",
        err?.response?.data?.message || "Não foi possível salvar o certificado."
      );
    }
  };

  // Configuração do DataGrid
  const columns = [
    { field: "partNumber", headerName: "PartNumber", flex: 1 },
    { field: "technicalStandard", headerName: "TechnicalStandard", flex: 1 },
    { field: "requirement", headerName: "Requirement", flex: 1 },
    { field: "revision", headerName: "Revision", flex: 0.5 },
  ];
  const rows = normas.map((n, i) => ({
    id: i,
    partNumber: n.partNumber,
    technicalStandard: n.technicalStandard,
    requirement: n.requirement,
    revision: n.revision,
  }));

  return (
    <div className="module-container">
      {/* SNACKBAR / ALERT (top-right) */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={closeToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={TransitionRight}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", minWidth: 360 }}
        >
          {toast.title ? <AlertTitle>{toast.title}</AlertTitle> : null}
          {toast.message}
        </Alert>
      </Snackbar>

      <header className="module-header">
        <Box className="form-header-fields">
          <TextField
            label="Nº Certificado"
            value={numeroCertificado}
            size="small"
            disabled
            InputProps={{ readOnly: true }}
          />
          <Select
            className="fiori-select"
            classNamePrefix="react-select"
            options={ordens.map((o) => ({ value: o.opEleb, label: o.opEleb }))}
            onChange={handleOpChange}
            value={
              campos.opEleb
                ? { value: campos.opEleb, label: campos.opEleb }
                : null
            }
            placeholder="Ordem nº"
            menuPortalTarget={document.body}
            styles={{
              control: (base) => ({ ...base, backgroundColor: "#fff" }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                backgroundColor: "#ffffff",
              }),
              menu: (base) => ({ ...base, backgroundColor: "#fff" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#f2f2f2" : "#fff",
                color: "#454545",
              }),
            }}
          />
          <TextField
            label="Data"
            value={dataAtual}
            size="small"
            disabled
            InputProps={{ readOnly: true }}
          />
          <Box className="button-group">
            <Button
              variant="contained"
              onClick={handleSalvar}
              sx={{
                backgroundColor: "#a81818",
                "&:hover": { backgroundColor: "#b71c1c" },
                color: "#fff",
                textTransform: "none",
              }}
            >
              Salvar Certificado
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenDialogPDF}
              sx={{
                borderColor: "#a81818",
                "&:hover": { backgroundColor: "rgba(168,24,24,0.08)" },
                color: "#a81818",
                textTransform: "none",
              }}
            >
              Gerar Certificado
            </Button>
            <Button
              variant="outlined"
              startIcon={<FolderIcon />}
              onClick={() => setOpenDialogPath(true)}
              sx={{
                borderColor: "#636363",
                "&:hover": { backgroundColor: "rgba(99,99,99,0.08)" },
                color: "#636363",
                textTransform: "none",
              }}
            >
              Alterar Caminho
            </Button>
          </Box>
        </Box>
      </header>

      <main className="module-content">
        <Box className="fiori-form-grid-4">
          <TextField
            label="OC n°"
            value={campos.poEleb}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("poEleb", e.target.value)}
          />
          <TextField
            label="Código Cliente n°"
            value={campos.codCliente}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("codCliente", e.target.value)}
          />
          <TextField
            label="Part Number"
            value={campos.partNumber}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("partNumber", e.target.value)}
          />
          <TextField
            label="Lote n°"
            value={campos.lote}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("lote", e.target.value)}
          />
          <TextField
            label="Quantidade"
            value={campos.qtdSaldo}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("qtdSaldo", e.target.value)}
          />
          <TextField
            label="Valor Produto"
            value={campos.valorPeca}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("valorPeca", e.target.value)}
          />
          <TextField
            label="Análise PO"
            value={campos.analisePo}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("analisePo", e.target.value)}
          />
          <TextField
            label="Existe CD ou Chamado?"
            value={campos.cd}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("cd", e.target.value)}
          />
          <TextField
            label="Cliente"
            value={campos.cliente}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("cliente", e.target.value)}
          />
          <TextField
            label="Desenho (2D/MBD) - Folha"
            value={campos.RevisaoDesenho || ""}
            size="small"
            required
            onChange={(e) =>
              handleChangeCampo("RevisaoDesenho", e.target.value)
            }
          />
          <TextField
            label="Revisão"
            value={campos.revisaoDesenho}
            size="small"
            required
            onChange={(e) =>
              handleChangeCampo("revisaoDesenho", e.target.value)
            }
          />
          <TextField
            label="Desenho (LP) - Revisão"
            value={campos.desenhoLP}
            size="small"
            required
            onChange={(e) => handleChangeCampo("desenhoLP", e.target.value)}
          />
          <TextField
            label="Decapagem Realizada?"
            value={campos.decapagem}
            disabled
            size="small"
            onChange={(e) => handleChangeCampo("decapagem", e.target.value)}
          />
          <TextField
            label="Serial Decapagem"
            value={campos.snDecapagem}
            multiline
            disabled
            InputProps={{ readOnly: true, className: "is-readonly" }}
            rows={2}
            size="small"
            onChange={(e) => handleChangeCampo("snDecapagem", e.target.value)}
          />
          <TextField
            label="Serial Peça"
            value={campos.snPeca}
            multiline
            rows={2}
            size="small"
            onChange={(e) => handleChangeCampo("snPeca", e.target.value)}
          />
          <TextField
            label="Observações"
            value={campos.observacoes}
            multiline
            rows={2}
            size="small"
            onChange={(e) => handleChangeCampo("observacoes", e.target.value)}
          />
          <TextField
            label="Fornecedor"
            value={campos.fornecedor}
            size="small"
            required
            onChange={(e) => handleChangeCampo("fornecedor", e.target.value)}
          />
          <TextField
            label="Relatório de Inspeção n°"
            value={campos.relatorioInspecao}
            size="small"
            required
            onChange={(e) =>
              handleChangeCampo("relatorioInspecao", e.target.value)
            }
          />
          <TextField
            label="Certificado de Conformidade MP"
            value={campos.certificadoMP}
            size="small"
            required
            onChange={(e) => handleChangeCampo("certificadoMP", e.target.value)}
          />
          <TextField
            label="Responsável Qualidade"
            value={campos.responsavel}
            size="small"
            required
            onChange={(e) => handleChangeCampo("responsavel", e.target.value)}
          />
        </Box>

        <Box className="fiori-form-grid-2">
          <Select
            className="fiori-select"
            classNamePrefix="react-select"
            options={operacoes.map((o) => ({
              value: o.operationDescription,
              label: o.operationDescription,
            }))}
            onChange={(opt) =>
              handleChangeCampo("operacaoDescricao", opt?.value || "")
            }
            value={
              campos.operacaoDescricao
                ? {
                    value: campos.operacaoDescricao,
                    label: campos.operacaoDescricao,
                  }
                : null
            }
            placeholder="Operações Executadas"
            isClearable
            isSearchable={false}
            menuPortalTarget={document.body}
            styles={selectStyles}
            theme={selectTheme}
          />
          <Select
            className="fiori-select"
            classNamePrefix="react-select"
            options={[
              { value: "Lote Completo", label: "Lote Completo" },
              { value: "Lote Parcial", label: "Lote Parcial" },
              { value: "Lote Complementar", label: "Lote Complementar" },
            ]}
            onChange={(opt) => handleChangeCampo("tipoEnvio", opt?.value || "")}
            value={
              campos.tipoEnvio
                ? { value: campos.tipoEnvio, label: campos.tipoEnvio }
                : null
            }
            placeholder="Tipo de Envio"
            isClearable
            isSearchable={false}
            menuPortalTarget={document.body}
            styles={selectStyles}
            theme={selectTheme}
          />
        </Box>

        {normas.length > 0 && (
          <Box style={{ height: 250, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        )}

        {/* Dialog: Gerar Certificado (PDF) */}
        <Dialog
          open={openDialogPDF}
          onClose={() => setOpenDialogPDF(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Gerar Certificado PDF</DialogTitle>
          <DialogContent>
            <TextField
              select
              //label="Selecione o certificado"
              value={certificadoSelecionado}
              onChange={(e) => setCertificadoSelecionado(e.target.value)}
              fullWidth
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="">-- Selecione o certificado --</option>
              {certificadosExistentes.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogPDF(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!certificadoSelecionado) {
                  openToast(
                    "warning",
                    "Seleção obrigatória",
                    "Escolha um certificado para gerar o PDF."
                  );
                  return;
                }
                // chamada de geração de PDF -> ajustar rota conforme seu backend
                axios
                  .post(
                    "http://localhost:7105/api/QualityCertificate/gerar-pdf",
                    {
                      numero: certificadoSelecionado,
                    }
                  )
                  .then((res) =>
                    openToast(
                      "success",
                      "PDF gerado",
                      `O certificado PDF foi gerado com sucesso em: ${res.data.path}`
                    )
                  )
                  .catch((err) =>
                    openToast(
                      "error",
                      "Erro ao gerar PDF",
                      err?.response?.data?.message || err.message
                    )
                  )

                  .finally(() => setOpenDialogPDF(false));
              }}
              sx={{
                backgroundColor: "#a81818",
                color: "#fff",
                "&:hover": { backgroundColor: "#b71c1c" },
                textTransform: "none",
              }}
            >
              Gerar PDF
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Alterar Caminho do PDF */}
        <Dialog
          open={openDialogPath}
          onClose={() => setOpenDialogPath(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Alterar Caminho de Salvamento</DialogTitle>
          <DialogContent>
            <TextField
              label="Novo caminho (ex.: C:\Certificados)"
              value={novoCaminhoPDF}
              onChange={(e) => setNovoCaminhoPDF(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="C:\\Certificados"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialogPath(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!novoCaminhoPDF?.trim()) {
                  openToast(
                    "warning",
                    "Caminho inválido",
                    "Informe um caminho válido para salvar os PDFs."
                  );
                  return;
                }
                // salvar caminho no backend/config
                axios
                  .post(
                    "http://localhost:7105/api/QualityCertificate/caminho",
                    {
                      path: novoCaminhoPDF,
                    }
                  )
                  .then(() =>
                    openToast(
                      "success",
                      "Caminho atualizado",
                      "O caminho padrão de salvamento foi atualizado."
                    )
                  )
                  .catch((err) =>
                    openToast(
                      "error",
                      "Erro ao salvar caminho",
                      err?.response?.data?.message || err.message
                    )
                  )
                  .finally(() => setOpenDialogPath(false));
              }}
              sx={{
                backgroundColor: "#a81818",
                color: "#fff",
                "&:hover": { backgroundColor: "#b71c1c" },
                textTransform: "none",
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
}

export default Home;
