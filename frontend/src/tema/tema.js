// src/tema/tema.js

import { createTheme } from "@mui/material/styles";

const tema = createTheme({
  palette: {
    primary: { main: "#1565c0" },     // Ana mavi renk
    secondary: { main: "#ff7043" },   // Turuncu (yardımcı renk)
    background: { default: "#f9f9f9" } // Genel arka plan rengi
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif' // Genel yazı tipi
  }
});

export default tema;
