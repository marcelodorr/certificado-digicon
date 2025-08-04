import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Box, Button, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function NormasPanel() {
  const [normas, setNormas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    partNumber: "",
    normaNome: "",
    requisito: "",
    revisao: "",
  });

  const API_URL = "/api/normas";

  // Busca normas
  const fetchNormas = async () => {
    try {
      const res = await axios.get(`${API_URL}/todas`);
      setNormas(res.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar normas.");
    }
  };

  useEffect(() => {
    fetchNormas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(API_URL, formData);
        alert("Norma atualizada com sucesso.");
      } else {
        await axios.post(API_URL, formData);
        alert("Norma salva com sucesso.");
      }
      setFormData({
        id: 0,
        partNumber: "",
        normaNome: "",
        requisito: "",
        revisao: "",
      });
      setIsEditing(false);
      fetchNormas();
    } catch {
      alert("Erro ao salvar norma.");
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      id: 0,
      partNumber: "",
      normaNome: "",
      requisito: "",
      revisao: "",
    });
    setIsEditing(false);
  };

  const handleEditNorma = (norma) => {
    setFormData({
      id: norma.id,
      partNumber: norma.partNumber,
      normaNome: norma.normaNome,
      requisito: norma.requisito || "",
      revisao: norma.revisao || "",
    });
    setIsEditing(true);
  };

  const handleDeleteNorma = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta norma?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Norma excluída com sucesso.");
      fetchNormas();
    } catch {
      alert("Erro ao excluir norma.");
    }
  };

  // Colunas DataGrid
  const columns = [
    { field: "partNumber", headerName: "Part Number", flex: 1, minWidth: 120 },
    { field: "normaNome", headerName: "Norma", flex: 1, minWidth: 150 },
    { field: "requisito", headerName: "Requisito", flex: 1, minWidth: 150 },
    { field: "revisao", headerName: "Revisão", width: 100 },
    {
      field: "createDate",
      headerName: "Criado em",
      width: 120,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleDateString() : "",
    },
    {
      field: "actions",
      headerName: "Ações",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEditNorma(params.row)}
          showInMenu={false}
          key="edit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDeleteNorma(params.id)}
          showInMenu={false}
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
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 0,
        paddingBottom: 2,
        paddingTop: 0,
        gap: 10,
      }}
    >
      <h2>Cadastro de Normas</h2>

      <Box
        component="form"
        sx={{
          paddingBottom: 2,
          display: "flex",
          flexDirection: "column",
          gap: "12px", // espaçamento entre campos
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <TextField
          label="Part Number"
          name="partNumber"
          value={formData.partNumber}
          onChange={handleChange}
          required
          fullWidth
          size="small" // deixa o campo com altura menor
          sx={{
            "& .MuiInputBase-root": {
              height: 36, // altura customizada
              fontSize: "14px", // tamanho da fonte dentro
            },
            "& label": {
              fontSize: "14px", // tamanho da label
            },
          }}
        />
        <TextField
          label="Norma"
          name="normaNome"
          value={formData.normaNome}
          onChange={handleChange}
          required
          fullWidth
          size="small" // deixa o campo com altura menor
          sx={{
            "& .MuiInputBase-root": {
              height: 36, // altura customizada
              fontSize: "14px", // tamanho da fonte dentro
            },
            "& label": {
              fontSize: "14px", // tamanho da label
            },
          }}
        />
        <TextField
          label="Requisito"
          name="requisito"
          value={formData.requisito}
          onChange={handleChange}
          fullWidth
          size="small" // deixa o campo com altura menor
          sx={{
            "& .MuiInputBase-root": {
              height: 36, // altura customizada
              fontSize: "14px", // tamanho da fonte dentro
            },
            "& label": {
              fontSize: "14px", // tamanho da label
            },
          }}
        />
        <TextField
          label="Revisão"
          name="revisao"
          value={formData.revisao}
          onChange={handleChange}
          fullWidth
          size="small" // deixa o campo com altura menor
          sx={{
            "& .MuiInputBase-root": {
              height: 36, // altura customizada
              fontSize: "14px", // tamanho da fonte dentro
            },
            "& label": {
              fontSize: "14px", // tamanho da label
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
            textTransform: "none", // remove o CAPSLOCK padrão
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
              textTransform: "none", // remove o CAPSLOCK padrão
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
        rows={normas}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        localeText={{
          noRowsLabel: "Nenhuma norma cadastrada.",
        }}
      />
    </Box>
  );
}

export default NormasPanel;
