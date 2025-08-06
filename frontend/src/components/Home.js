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
} from "@mui/material";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Home() {
  const [ordens, setOrdens] = useState([]);
  const [normas, setNormas] = useState([]);
  const [dataAtual, setDataAtual] = useState("");
  const [numeroCertificado, setNumeroCertificado] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [certificadosExistentes, setCertificadosExistentes] = useState([]);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState("");
  const [campos, setCampos] = useState({
    opEleb: "",
    poEleb: "",
    loteEleb: "",
    codCliente: "",
    partNumber: "",
    valorPeca: "",
    analisePo: "",
    revisaoDesenho: "",
    qtdSaldo: "",
    decapagem: "",
    snDecapagem: "",
    cdChamado: "",
    fornecedor: "",
    relatorioInspecao: "",
    certificadoMP: "",
    responsavel: "",
    desenhoLP: "",
    observacoes: "",
    tipoEnvio: "",
    snPeca: "",
  });

  // Gerar número e data
  useEffect(() => {
    axios
      .get("/api/QualityCertificate/novo-certificado")
      .then((res) => setNumeroCertificado(res.data.numero))
      .catch((err) => console.error(err));
    setDataAtual(new Date().toLocaleDateString("pt-BR"));
  }, []);

  // Buscar ordens finalizadas
  useEffect(() => {
    axios
      .get("/api/initial/ordens-finalizadas")
      .then((res) => setOrdens(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Buscar normas quando partNumber mudar
  useEffect(() => {
    if (campos.partNumber) {
      axios
        .get(`/api/Normas/partnumbers/${campos.partNumber}`)
        .then((res) => setNormas(res.data))
        .catch((err) => console.error(err));
    } else {
      setNormas([]);
    }
  }, [campos.partNumber]);

  const handleOpChange = (option) => {
    const ordem = ordens.find((o) => o.ordem === option.value);
    if (ordem) {
      setCampos((prev) => ({
        ...prev,
        opEleb: ordem.ordem || "",
        poEleb: ordem.oc || "",
        loteEleb: ordem.lote || "",
        codCliente: ordem.codigoCliente || "",
        partNumber: ordem.pn || "",
        valorPeca: ordem.valorPeca || "",
        analisePo: ordem.analisePO || "",
        revisaoDesenho: ordem.revisaoDesenho || "",
        qtdSaldo: ordem.quantidade?.toString() || "",
        decapagem: ordem.decapagem || "",
        snDecapagem: ordem.sN_Decapagem || "",
        cdChamado: ordem.cd || "",
        fornecedor: prev.fornecedor,
        relatorioInspecao: prev.relatorioInspecao,
        certificadoMP: prev.certificadoMP,
        responsavel: prev.responsavel,
        desenhoLP: prev.desenhoLP,
        observacoes: prev.observacoes,
        snPeca: ordem.sn || "",
      }));
    }
  };

  const handleChangeCampo = (nome, valor) => {
    setCampos((prev) => ({ ...prev, [nome]: valor }));
  };

  const handleSalvar = async () => {
    try {
      const payload = {
        NumeroCertificado: numeroCertificado,
        Ordem: campos.opEleb,
        OC: campos.poEleb,
        Lote: campos.loteEleb,
        CodigoCliente: campos.codCliente,
        PartNumber: campos.partNumber,
        ValorPeca: campos.valorPeca,
        AnalisePo: campos.analisePo,
        RevisaoDesenho: campos.revisaoDesenho,
        Quantidade: campos.qtdSaldo,
        Decapagem: campos.decapagem,
        SNDecapagem: campos.snDecapagem,
        CDChamado: campos.cdChamado,
        Fornecedor: campos.fornecedor,
        RelatorioInspecao: campos.relatorioInspecao,
        CertificadoMP: campos.certificadoMP,
        Responsavel: campos.responsavel,
        DesenhoLP: campos.desenhoLP,
        Observacoes: campos.observacoes,
        SNPeca: campos.snPeca,
        TipoEnvio: campos.tipoEnvio,
        Data: dataAtual,
      };
      await axios.post("/api/QualityCertificate", payload);
      alert("Certificado salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar certificado.");
    }
  };

  // DataGrid setup
  const columns = [
    { field: "partNumber", headerName: "Part Number", flex: 1 },
    { field: "norma", headerName: "Norma", flex: 1 },
    { field: "revisao", headerName: "Revisão", flex: 0.5 },
  ];
  const rows = normas.map((n, i) => ({
    id: i,
    partNumber: n.partNumber,
    norma: n.norma,
    revisao: n.revisao,
  }));

  return (
    <div className="module-container">
      <header className="module-header">
        <Box className="form-header-fields">
          <TextField
            label="Nº Certificado"
            value={numeroCertificado}
            size="small"
            InputProps={{ readOnly: true }}
          />
          <Select
            className="fiori-select"
            classNamePrefix="react-select"
            options={ordens.map((o) => ({ value: o.ordem, label: o.ordem }))}
            onChange={handleOpChange}
            value={
              campos.opEleb
                ? { value: campos.opEleb, label: campos.opEleb }
                : null
            }
            placeholder="Ordem nº"
            isSearchable
          />
          <TextField
            label="Data"
            value={dataAtual}
            size="small"
            InputProps={{ readOnly: true }}
          />
          <Box className="button-group">
            <Button
              variant="contained"
              onClick={handleSalvar}
              sx={{
                backgroundColor: "#a81818",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#b71c1c" },
                textTransform: "none",
              }}
            >
              Salvar Certificado
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenDialog(true)}
              sx={{
                borderColor: "#a81818",
                color: "#a81818",
                "&:hover": {
                  backgroundColor: "rgba(168,24,24,0.08)",
                  borderColor: "#b71c1c",
                },
                textTransform: "none",
              }}
            >
              Gerar Certificado
            </Button>
            <Button
              variant="outlined"
              startIcon={<FolderIcon />}
              sx={{
                borderColor: "#636363",
                color: "#636363",
                "&:hover": {
                  backgroundColor: "rgba(99,99,99,0.08)",
                  borderColor: "#636363",
                },
                textTransform: "none",
              }}
            >
              Alterar Caminho
            </Button>
          </Box>
        </Box>
      </header>

      <main className="module-content">
        {/* Grid de campos principais */}
        <Box className="fiori-form-grid">
          <TextField
            label="OC nº"
            value={campos.poEleb}
            size="small"
            onChange={(e) => handleChangeCampo("poEleb", e.target.value)}
          />
          <TextField
            label="Lote nº"
            value={campos.loteEleb}
            size="small"
            onChange={(e) => handleChangeCampo("loteEleb", e.target.value)}
          />
          <TextField
            label="Código Cliente"
            value={campos.codCliente}
            size="small"
            onChange={(e) => handleChangeCampo("codCliente", e.target.value)}
          />
          <TextField
            label="PN nº"
            value={campos.partNumber}
            size="small"
            onChange={(e) => handleChangeCampo("partNumber", e.target.value)}
          />
          <TextField
            label="Valor Peça"
            value={campos.valorPeca}
            size="small"
            onChange={(e) => handleChangeCampo("valorPeca", e.target.value)}
          />
        </Box>

        <Box className="fiori-form-grid">
          <TextField
            label="Análise PO"
            value={campos.analisePo}
            size="small"
            onChange={(e) => handleChangeCampo("analisePo", e.target.value)}
          />
          <TextField
            label="Revisão Desenho"
            value={campos.revisaoDesenho}
            size="small"
            onChange={(e) =>
              handleChangeCampo("revisaoDesenho", e.target.value)
            }
          />
          <TextField
            label="Quantidade"
            value={campos.qtdSaldo}
            size="small"
            onChange={(e) => handleChangeCampo("qtdSaldo", e.target.value)}
          />
          <TextField
            label="Decapagem"
            value={campos.decapagem}
            size="small"
            onChange={(e) => handleChangeCampo("decapagem", e.target.value)}
          />
          <TextField
            label="Existe CD ou Chamado?"
            value={campos.cdChamado}
            size="small"
            onChange={(e) => handleChangeCampo("cdChamado", e.target.value)}
          />
        </Box>

        <Box className="fiori-form-grid">
          <TextField
            label="Fornecedor"
            value={campos.fornecedor}
            size="small"
            onChange={(e) => handleChangeCampo("fornecedor", e.target.value)}
          />
          <TextField
            label="Relatório de Inspeção nº"
            value={campos.relatorioInspecao}
            size="small"
            onChange={(e) =>
              handleChangeCampo("relatorioInspecao", e.target.value)
            }
          />
          <TextField
            label="Certificado de Conformidade MP"
            value={campos.certificadoMP}
            size="small"
            onChange={(e) => handleChangeCampo("certificadoMP", e.target.value)}
          />
          <TextField
            label="Responsável"
            value={campos.responsavel}
            size="small"
            onChange={(e) => handleChangeCampo("responsavel", e.target.value)}
          />
          <TextField
            label="Desenho (LP) - Revisão"
            value={campos.desenhoLP}
            size="small"
            onChange={(e) => handleChangeCampo("desenhoLP", e.target.value)}
          />
        </Box>

        <Box className="fiori-form-grid-4">
          <Select
            className="fiori-select"
            classNamePrefix="react-select"
            options={[
              { value: "Envio Padrão", label: "Envio Padrão" },
              { value: "Expresso", label: "Expresso" },
            ]}
            onChange={(opt) => handleChangeCampo("tipoEnvio", opt.value)}
            value={
              campos.tipoEnvio
                ? { value: campos.tipoEnvio, label: campos.tipoEnvio }
                : null
            }
            placeholder="Tipo de Envio"
            isSearchable={false}
          />
          <TextField
            label="SN Peça"
            value={campos.snPeca}
            multiline
            rows={2}
            size="small"
            onChange={(e) => handleChangeCampo("snPeca", e.target.value)}
          />
          <TextField
            label="SN Decapagem"
            value={campos.snDecapagem}
            multiline
            rows={2}
            size="small"
            onChange={(e) => handleChangeCampo("snDecapagem", e.target.value)}
          />
          <TextField
            label="Observações"
            value={campos.observacoes}
            multiline
            rows={2}
            size="small"
            onChange={(e) => handleChangeCampo("observacoes", e.target.value)}
          />
        </Box>

        <Box style={{ height: 300, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Gerar Certificado PDF</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Selecione o certificado"
              value={certificadoSelecionado}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">-- Selecione --</option>
              {certificadosExistentes.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // lógica gerar PDF
              }}
            >
              Gerar PDF
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
}

export default Home;
