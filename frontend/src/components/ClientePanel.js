// src/components/ClientePanel.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Box, Button, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ClientePanel = () => {
  const [clientes, setClientes] = useState([]);
  const [formCliente, setFormCliente] = useState({
    id: 0,
    Nome: "",
    CreateBy: "Sistema",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = "/api/cliente";

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await axios.get(API_URL);
      setClientes(response.data);
      setMessage("");
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setMessage(
        "Erro ao carregar clientes: " +
          (error.response?.data?.message || error.message)
      );
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
      } else {
        response = await axios.post(API_URL, formCliente);
      }

      setMessage(
        response.data.message ||
          (isEditing
            ? "Cliente editado com sucesso!"
            : "Cliente adicionado com sucesso!")
      );

      setFormCliente({ id: 0, Nome: "", CreateBy: "Sistema" });
      setIsEditing(false);
      fetchClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      setMessage(
        `Erro: ${
          error.response?.data?.message ||
          error.message ||
          "Ocorreu um erro desconhecido."
        }`
      );
    }
  };

  const handleEdit = (cliente) => {
    setFormCliente({
      id: cliente.id,
      Nome: cliente.nome,
      CreateBy: cliente.createBy || "Sistema",
    });
    setIsEditing(true);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`);
        setMessage(response.data.message || "Cliente excluído com sucesso!");
        fetchClientes();
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        setMessage(
          `Erro: ${
            error.response?.data?.message ||
            error.message ||
            "Erro ao excluir cliente."
          }`
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setFormCliente({ id: 0, Nome: "", CreateBy: "Sistema" });
    setIsEditing(false);
    setMessage("");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "nome", headerName: "Cliente", flex: 1 },
    {
      field: "actions",
      headerName: "Ações",
      type: "actions",
      width: 100,
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
          onClick={() => handleDelete(params.id)}
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

      {message && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: message.startsWith("Erro")
              ? "error.light"
              : "success.light",
            color: message.startsWith("Erro") ? "error.main" : "success.main",
            border: "1px solid",
            borderColor: message.startsWith("Erro")
              ? "error.main"
              : "success.main",
            textAlign: "center",
          }}
        >
          {message}
        </Box>
      )}

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
          name="Nome"
          value={formCliente.Nome}
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
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        localeText={{
          noRowsLabel: "Nenhum cliente cadastrado.",
        }}
        sx={{
          height: 400,
        }}
      />
    </Box>
  );
};

export default ClientePanel;
