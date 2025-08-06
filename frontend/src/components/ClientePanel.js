import React, { useState, useEffect } from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import axios from "axios";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ClientePanel = () => {
  const [clientes, setClientes] = useState([]);
  const [formCliente, setFormCliente] = useState({
    id: 0,
    cliente: "", // Usando 'cliente' com 'c' minúsculo
    CreateBy: "Sistema",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  // Controlando os alertas
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "", // 'success', 'error', etc.
  });

  // Controlando o dialog de confirmação de exclusão
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const API_URL = "http://localhost:7105/api/Cliente";

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await axios.get(API_URL);
      setClientes(response.data);
      setMessage("");
    } catch (error) {
      setAlert({
        open: true,
        message: "Erro ao carregar clientes.",
        severity: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      let response;
      if (isEditing) {
        response = await axios.put(API_URL, formCliente);
        setAlert({
          open: true,
          message: "Cliente editado com sucesso!",
          severity: "success",
        });
      } else {
        response = await axios.post(API_URL, formCliente);
        setAlert({
          open: true,
          message: "Cliente adicionado com sucesso!",
          severity: "success",
        });
      }

      setFormCliente({ id: 0, cliente: "", CreateBy: "Sistema" });
      setIsEditing(false);
      fetchClientes();
    } catch (error) {
      setAlert({
        open: true,
        message: `Erro: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleEdit = (cliente) => {
    setFormCliente({
      id: cliente.id,
      cliente: cliente.cliente, // Usando 'cliente' com 'c' minúsculo
      CreateBy: cliente.CreateBy || "Sistema",
    });
    setIsEditing(true);
    setMessage("");
  };

  const handleDeleteDialogOpen = (id) => {
    setSelectedClientId(id);
    setOpenDialog(true); // Abre o dialog de confirmação
  };

  const handleDeleteDialogClose = () => {
    setOpenDialog(false); // Fecha o dialog sem excluir
    setSelectedClientId(null);
  };

  const handleDelete = async () => {
    if (selectedClientId === null) return;

    try {
      const response = await axios.delete(`${API_URL}/${selectedClientId}`);
      setAlert({
        open: true,
        message: response.data.message || "Cliente excluído com sucesso!",
        severity: "success",
      });
      fetchClientes();
      setOpenDialog(false); // Fecha o dialog após a exclusão
    } catch (error) {
      setAlert({
        open: true,
        message: `Erro: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setFormCliente({ id: 0, cliente: "", CreateBy: "Sistema" });
    setIsEditing(false);
    setMessage("");
  };

  const columns = [
    { field: "id", headerName: "ID", minwidth: 150, maxWidth: 150 },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1,
      minWidth: 499,
      maxWidth: 500,
    },
    {
      field: "actions",
      headerName: "Ações",
      type: "actions",
      minwidth: 129,
      maxWidth: 130,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDeleteDialogOpen(params.id)} // Abre o dialog
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <Box
      sx={{
        p: 1,
        maxWidth: 900,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 0,
        paddingBottom: 2,
        paddingTop: 0,
      }}
    >
      <h2>Cadastro de Clientes</h2>

      <Box
        component="form"
        sx={{
          paddingBottom: 2,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        onSubmit={handleSubmit}
      >
        <TextField
          label="Nome do Cliente"
          name="cliente"
          value={formCliente.cliente}
          onChange={handleChange}
          required
          fullWidth
          size="small"
          sx={{
            "& .MuiInputBase-root": {
              height: 36,
              fontSize: "14px",
            },
            "& label": {
              fontSize: "14px",
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#a80909",
            color: "#ffffff",
            padding: "6px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#bb0c0c",
            },
          }}
        >
          {isEditing ? "Salvar Edição" : "Adicionar Cliente"}
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
        rows={clientes}
        columns={columns}
        pageSizeOptions={[10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        localeText={{
          noRowsLabel: "Nenhum cliente cadastrado.",
        }}
        sx={{
          height: 500,
        }}
      />

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

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={openDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza que deseja excluir este cliente?</p>
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
};

export default ClientePanel;
