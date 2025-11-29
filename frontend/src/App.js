import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Sayfalar
import Giris from "./sayfalar/Giris";
import Kayit from "./sayfalar/Kayit";
import SifreUnuttum from "./sayfalar/SifreUnuttum";
import Akis from "./sayfalar/Akis";
import Arama from "./sayfalar/Arama";
import IcerikDetay from "./sayfalar/IcerikDetay";
import Profil from "./sayfalar/Profil";
import KullaniciArama from "./sayfalar/KullaniciArama";

// Bileşenler
import UstMenu from "./bilesenler/UstMenu";
import OzelRota from "./bilesenler/OzelRota";

function App() {
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: { main: "#1976d2" },
          ...(mode === "dark" && {
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
          }),
        },
      }),
    [mode]
  );

  const toggleDarkMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <UstMenu darkMode={mode === "dark"} toggleDarkMode={toggleDarkMode} />

        <Routes>
          {/* Giriş ekranları */}
          <Route path="/" element={<Giris />} />
          <Route path="/kayit" element={<Kayit />} />
          <Route path="/sifre-unuttum" element={<SifreUnuttum />} />

          {/* Akış */}
          <Route
            path="/akis"
            element={
              <OzelRota>
                <Akis />
              </OzelRota>
            }
          />

          {/* Film/Kitap Arama */}
          <Route
            path="/arama"
            element={
              <OzelRota>
                <Arama />
              </OzelRota>
            }
          />

          {/* Kullanıcı Arama */}
          <Route
            path="/kullanici-ara"
            element={
              <OzelRota>
                <KullaniciArama />
              </OzelRota>
            }
          />

          {/* İçerik Detay */}
          <Route
            path="/detay/:tur/:id"
            element={
              <OzelRota>
                <IcerikDetay />
              </OzelRota>
            }
          />

          {/* Profil */}
          <Route
            path="/profil/:id"
            element={
              <OzelRota>
                <Profil />
              </OzelRota>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
