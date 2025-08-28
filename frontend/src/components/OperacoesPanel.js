import React, { useEffect, useState } from "react";
import api from "../services/api";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Box,
  Button,
  TextField,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function OperacoesPanel() {
  const [operacoes, setOperacoes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    operationQuantity: "",
    operationDescription: "",
  });

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "", // 'success', 'error', etc.
  });

  // Dialog state for confirmation of deletion
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOperacaoId, setSelectedOperacaoId] = useState(null);

  const API_BASE = "/api/Operacao"; // Certifique-se de que o endpoint está correto

  const fetchOperacoes = async () => {
    try {
      const res = await api.get(API_BASE);
      setOperacoes(res.data);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: "Erro ao carregar operações.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchOperacoes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await api.put(API_BASE, formData);
        setAlert({
          open: true,
          message: "Operação atualizada com sucesso.",
          severity: "success",
        });
      } else {
        await api.post(API_BASE, formData);
        setAlert({
          open: true,
          message: "Operação salva com sucesso.",
          severity: "success",
        });
      }
      setFormData({ id: 0, operationQuantity: "", operationDescription: "" });
      setIsEditing(false);
      fetchOperacoes();
    } catch {
      setAlert({
        open: true,
        message: "Erro ao salvar operação.",
        severity: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setFormData({ id: 0, operationQuantity: "", operationDescription: "" });
    setIsEditing(false);
  };

  const handleEditOperacao = (op) => {
    setFormData({
      id: op.id,
      operationQuantity: op.operationQuantity,
      operationDescription: op.operationDescription,
    });
    setIsEditing(true);
  };

  // Open confirmation dialog for deletion
  const handleDeleteDialogOpen = (id) => {
    setSelectedOperacaoId(id);
    setOpenDialog(true);
  };

  // Close the confirmation dialog
  const handleDeleteDialogClose = () => {
    setOpenDialog(false);
    setSelectedOperacaoId(null);
  };

  const handleDelete = async () => {
    if (selectedOperacaoId === null) return;

    try {
      await api.delete(`${API_BASE}/${selectedOperacaoId}`);
      setAlert({
        open: true,
        message: "Operação excluída com sucesso.",
        severity: "success",
      });
      fetchOperacoes();
      setOpenDialog(false); // Close the dialog after deletion
    } catch {
      setAlert({
        open: true,
        message: "Erro ao excluir operação.",
        severity: "error",
      });
    }
  };

  const columns = [
    {
      field: "operationQuantity",
      headerName: "Qnt. Operações",
      flex: 1,
      minWidth: 120,
      maxWidth: 120,
    },
    {
      field: "operationDescription",
      headerName: "Descrição da Operação",
      flex: 1,
      minWidth: 400,
      maxWidth: 600,
      renderCell: (params) => (
        <div
          style={{
            wordWrap: "break-word", // Quebra de palavra
            whiteSpace: "normal", // Permite a quebra de linha
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      type: "actions",
      maxWidth: 200,
      minWidth: 200,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEditOperacao(params.row)}
          key="edit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDeleteDialogOpen(params.id)} // Abre o dialog
          key="delete"
        />,
      ],
    },
  ];

  return (
    <Box
      sx={{
        p: 1,
        maxWidth: 900,
        height: 580,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 0,
        paddingBottom: 1,
        paddingTop: 0,
        gap: 5,
      }}
    >
      <h2>Cadastro de Operações</h2>

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

      <Box
        component="form"
        sx={{
          paddingBottom: 2,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <TextField
          label="N° da Operação"
          name="operationQuantity"
          value={formData.operationQuantity}
          onChange={handleChange}
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Descrição da Operação"
          name="operationDescription"
          value={formData.operationDescription}
          onChange={handleChange}
          required
          fullWidth
          size="small"
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#a80909",
            color: "#ffffff",
            padding: "6px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#bb0c0c",
            },
          }}
        >
          {isEditing ? "Atualizar" : "Salvar"}
        </Button>

        {isEditing && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancelEdit}
            sx={{
              backgroundColor: "#929292ff",
              color: "#ffffff",
              padding: "6px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "14px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#5f5f5fff",
              },
            }}
          >
            Cancelar Edição
          </Button>
        )}
      </Box>

      <DataGrid
        rows={operacoes}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        rowHeight={40}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        localeText={{
          noRowsLabel: "Nenhuma operação cadastrada.",
        }}
        sx={{
          height: 450,
        }}
      />

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza que deseja excluir esta operação?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OperacoesPanel;
