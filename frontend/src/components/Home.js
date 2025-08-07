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

function Home() {
  const [ordens, setOrdens] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [normas, setNormas] = useState([]);
  const [dataAtual, setDataAtual] = useState("");
  const [numeroCertificado, setNumeroCertificado] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [certificadosExistentes, setCertificadosExistentes] = useState([]);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState("");

  const [campos, setCampos] = useState({
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

  // Carregar certificado, data e ordens
  useEffect(() => {
    axios
      .get("http://localhost:7105/api/QualityCertificate/novo-certificado")
      .then((res) => setNumeroCertificado(res.data.numero))
      .catch(console.error);
    setDataAtual(new Date().toLocaleDateString("pt-BR"));
    axios
      .get("http://localhost:7105/api/ControleEleb/ordens-finalizadas")
      .then((res) => setOrdens(res.data))
      .catch(console.error);
    axios
      .get("http://localhost:7105/api/Operacao")
      .then((res) => setOperacoes(res.data))
      .catch(console.error);
  }, []);

  // Carregar normas por partNumber
  useEffect(() => {
    if (campos.partNumber) {
      axios
        .get(`http://localhost:7105/api/Norma/partnumber/${campos.partNumber}`)
        .then((res) => setNormas(res.data))
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            // Nenhuma norma encontrada: limpa lista e não exibe DataGrid
            setNormas([]);
          } else {
            console.error(err);
          }
        });
    } else {
      setNormas([]);
    }
  }, [campos.partNumber]);

  // Seleção de ordem
  const handleOpChange = (option) => {
    const ordem = ordens.find((o) => o.opEleb === option.value);
    if (!ordem) return;
    setCampos({
      opEleb: ordem.opEleb || "",
      poEleb: ordem.poEleb || "",
      codCliente: ordem.codEleb || "",
      partNumber: ordem.partNumber || "",
      valorPeca: ordem.valorPeca?.toString() || "",
      qtdSaldo: ordem.qtdSaldo?.toString() || "",
      analisePo: ordem.analisePo || "",
      revisaoDesenho: ordem.revisaoDesenho || "",
      decapagem: ordem.decapagem || "",
      snDecapagem: ordem.snDecap || "",
      snPeca: ordem.snPeca || "",
      fornecedor: "Digicon",
      relatorioInspecao: "N/A",
      certificadoMP: "N/A",
      responsavel: "Anderson Siegle Muller",
      desenhoLP: "N/A",
      observacoes: "N/A",
      tipoEnvio: "",
      cliente: ordem.cliente || "",
      cd: ordem.cd || "",
      lote: ordem.lote || "",
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
    };
    try {
      await axios.post("http://localhost:7105/api/QualityCertificate", payload);
      alert("Certificado salvo com sucesso!");
    } catch {
      alert("Erro ao salvar certificado.");
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
                backgroundColor: "#fff",
              }),
              menu: (base) => ({ ...base, backgroundColor: "#fff" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#f2f2f2" : "#fff",
                color: "#333",
              }),
            }}
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
                "&:hover": { backgroundColor: "#b71c1c" },
                color: "#fff",
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
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("poEleb", e.target.value)}
          />
          <TextField
            label="Código Cliente n°"
            value={campos.codCliente}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("codCliente", e.target.value)}
          />
          <TextField
            label="Part Number"
            value={campos.partNumber}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("partNumber", e.target.value)}
          />
          <TextField
            label="Lote n°"
            value={campos.lote}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("lote", e.target.value)}
          />
          <TextField
            label="Quantidade"
            value={campos.qtdSaldo}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("qtdSaldo", e.target.value)}
          />
          <TextField
            label="Valor Produto"
            value={campos.valorPeca}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("valorPeca", e.target.value)}
          />
          <TextField
            label="Análise PO"
            value={campos.analisePo}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("analisePo", e.target.value)}
          />
          <TextField
            label="Existe CD ou Chamado?"
            value={campos.cd}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("cd", e.target.value)}
          />
          <TextField
            label="Cliente"
            value={campos.cliente}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("snPeca", e.target.value)}
          />
          <TextField
            label="Desenho (2D/MBD) - Folha"
            value={campos.RevisaoDesenho}
            size="small"
            required="true"
            onChange={(e) =>
              handleChangeCampo("RevisaoDesenho", e.target.value)
            }
          />
          <TextField
            label="Revisão"
            value={campos.revisaoDesenho}
            size="small"
            required="true"
            onChange={(e) =>
              handleChangeCampo("revisaoDesenho", e.target.value)
            }
          />
          <TextField
            label="Desenho (LP) - Revisão"
            value={campos.desenhoLP}
            size="small"
            required="true"
            onChange={(e) => handleChangeCampo("desenhoLP", e.target.value)}
          />
          <TextField
            label="Decapagem Realizada?"
            value={campos.decapagem}
            disabled="true"
            size="small"
            onChange={(e) => handleChangeCampo("decapagem", e.target.value)}
          />
          <TextField
            label="Serial Decapagem"
            value={campos.snDecapagem}
            multiline
            disabled="true"
            rows={3}
            size="small"
            onChange={(e) => handleChangeCampo("snDecapagem", e.target.value)}
          />
          <TextField
            label="Serial Peça"
            value={campos.snPeca}
            multiline
            rows={3}
            size="small"
            onChange={(e) => handleChangeCampo("snPeca", e.target.value)}
          />
          <TextField
            label="Fornecedor"
            value={campos.fornecedor}
            size="small"
            required="true"
            onChange={(e) => handleChangeCampo("fornecedor", e.target.value)}
          />
          <TextField
            label="Relatório de Inspeção n°"
            value={campos.relatorioInspecao}
            size="small"
            required="true"
            onChange={(e) =>
              handleChangeCampo("relatorioInspecao", e.target.value)
            }
          />
          <TextField
            label="Certificado de Conformidade MP"
            value={campos.certificadoMP}
            size="small"
            required="true"
            onChange={(e) => handleChangeCampo("certificadoMP", e.target.value)}
          />
          <TextField
            label="Responsável Qualidade"
            value={campos.responsavel}
            size="small"
            required="true"
            onChange={(e) => handleChangeCampo("responsavel", e.target.value)}
          />
        </Box>
        <Box className="fiori-form-grid-3">
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
            isSearchable
            menuPortalTarget={document.body}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#454545",
                size: "small",
                width: "100%",
                required: "true",
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                backgroundColor: "#454545",
              }),
            }}
          />
          <Select
            className="fiori-select"
            classNamePrefix="react-select"
            options={[
              { value: "Lote Completo", label: "Lote Completo" },
              { value: "Lote Parcial", label: "Lote Parcial" },
              { value: "Lote Complementar", label: "Lote Complementar" },
            ]}
            onChange={(opt) => handleChangeCampo("tipoEnvio", opt.value)}
            value={
              campos.tipoEnvio
                ? { value: campos.tipoEnvio, label: campos.tipoEnvio }
                : null
            }
            placeholder="Tipo de Envio"
            isSearchable={false}
            menuPortalTarget={document.body}
            styles={{
              control: (base) => ({ ...base, backgroundColor: "#fff" }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
                backgroundColor: "#fff",
                width: "100%",
                required: "true",
              }),
              menu: (base) => ({ ...base, backgroundColor: "#fff" }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#f2f2f2" : "#fff",
                color: "##454545",
              }),
            }}
          />
          <TextField
            label="Observações"
            value={campos.observacoes}
            multiline
            rows={3}
            size="small"
            onChange={(e) => handleChangeCampo("observacoes", e.target.value)}
          />
        </Box>
        {/* DataGrid condicional */}
        {normas.length > 0 && (
          <Box style={{ height: 300, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </Box>
        )}
        {/* Dialog para gerar PDF */}
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
              onClick={() => {
                /* gerar PDF */
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
      </main>
    </div>
  );
}

export default Home;
