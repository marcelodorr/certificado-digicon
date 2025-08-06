import React, { useEffect, useState } from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
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
    technicalStandard: "",
    requirement: "",
    revision: "",
    createDate: "",
  });

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "", // 'success', 'error', etc.
  });

  // Dialog state for confirmation of deletion
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNormId, setSelectedNormId] = useState(null);

  const API_URL = "http://localhost:7105/api/norma";

  const fetchNormas = async () => {
    try {
      const res = await axios.get(`${API_URL}/todas`);
      setNormas(res.data);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: "Erro ao carregar normas.",
        severity: "error",
      });
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
        setAlert({
          open: true,
          message: "Norma atualizada com sucesso.",
          severity: "success",
        });
      } else {
        await axios.post(API_URL, formData);
        setAlert({
          open: true,
          message: "Norma salva com sucesso.",
          severity: "success",
        });
      }
      setFormData({
        id: 0,
        partNumber: "",
        technicalStandard: "",
        requirement: "",
        revision: "",
        createDate: "",
      });
      setIsEditing(false);
      fetchNormas();
    } catch {
      setAlert({
        open: true,
        message: "Erro ao salvar norma.",
        severity: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      id: 0,
      partNumber: "",
      technicalStandard: "",
      requirement: "",
      revision: "",
      createDate: "",
    });
    setIsEditing(false);
  };

  const handleEditNorma = (norma) => {
    setFormData({
      id: norma.id,
      partNumber: norma.partNumber,
      technicalStandard: norma.technicalStandard,
      requirement: norma.requirement,
      revision: norma.revision,
      createDate: norma.createDate,
    });
    setIsEditing(true);
  };

  // Open confirmation dialog for deletion
  const handleDeleteDialogOpen = (id) => {
    setSelectedNormId(id);
    setOpenDialog(true);
  };

  // Close the confirmation dialog
  const handleDeleteDialogClose = () => {
    setOpenDialog(false);
    setSelectedNormId(null);
  };

  const handleDelete = async () => {
    if (selectedNormId === null) return;

    try {
      const response = await axios.delete(`${API_URL}/${selectedNormId}`);
      setAlert({
        open: true,
        message: response.data.message || "Norma excluída com sucesso.",
        severity: "success",
      });
      fetchNormas();
      setOpenDialog(false); // Close the dialog after deletion
    } catch {
      setAlert({
        open: true,
        message: "Erro ao excluir norma.",
        severity: "error",
      });
    }
  };

  const columns = [
    { field: "partNumber", headerName: "Part Number", flex: 1, minWidth: 120 },
    { field: "technicalStandard", headerName: "Norma", flex: 1, minWidth: 150 },
    {
      field: "requirement",
      headerName: "Requisito",
      flex: 1,
      maxwidth: 150,
      minWidth: 150,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "normal", // Permite que o texto quebre em várias linhas
            overflowWrap: "break-word", // Garante que palavras muito longas quebrem
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: "revision", headerName: "Revisão" },
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
        <TextField
          label="Norma"
          name="technicalStandard"
          value={formData.technicalStandard}
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
        <TextField
          label="Requisito"
          name="requirement"
          value={formData.requirement}
          onChange={handleChange}
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
        <TextField
          label="Revisão"
          name="revision"
          value={formData.revision}
          onChange={handleChange}
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
        rows={normas}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        rowHeight={40}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        localeText={{
          noRowsLabel: "Nenhuma norma cadastrada.",
        }}
        sx={{
          height: 450,
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
          <p>Você tem certeza que deseja excluir esta norma?</p>
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

export default NormasPanel;
