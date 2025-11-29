// Uygulamamızın başlangıç noktasıdır,react uygulamamızı tarayıcıya yerleştirir.

import React from "react"; // react başlatır
import { createRoot } from "react-dom/client";
import App from "./App"; // app.js çağır.
import { ThemeProvider } from "@mui/material";
import tema from "./tema/tema";
import CssBaseline from "@mui/material/CssBaseline";
import { KimlikSaglayici } from "./baglam/KimlikBaglami"; // kullanıcı bilgisi

const root = createRoot(document.getElementById("root"));

root.render(
 
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <KimlikSaglayici>
        <App />
      </KimlikSaglayici>
    </ThemeProvider>
 
);
