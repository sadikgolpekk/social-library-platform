// src/bilesenler/GeriButonu.js
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function GeriButonu() {
  const navigate = useNavigate();

  return (
    <Tooltip title="Geri Dön">
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          color: "#1565c0",
          backgroundColor: "#e3f2fd",
          "&:hover": { backgroundColor: "#bbdefb" },
          boxShadow: 1,
        }}
      >
        <ArrowBack />
      </IconButton>
    </Tooltip>
  );
}
