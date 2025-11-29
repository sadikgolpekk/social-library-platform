import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Fade,
  Alert,
} from "@mui/material";
import { EmailOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function SifreUnuttum() {
  const [email, setEmail] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesaj("");
    setHata("");

    if (!email.trim()) {
      setHata("⚠️ Lütfen e-posta adresinizi girin!");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sifre-sifirla/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMesaj(data.mesaj);
      } else {
        setHata(data.hata || "Bu e-posta bulunamadı.");
      }
    } catch {
      setHata("Sunucuya bağlanılamadı. Django çalışıyor mu?");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/images/kutuphane.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={10}
          sx={{
            width: 400,
            p: 4,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            textAlign: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              mx: "auto",
              mb: 2,
              width: 56,
              height: 56,
              boxShadow: 2,
            }}
          >
            <EmailOutlined />
          </Avatar>

          <Typography
            variant="h5"
            mb={3}
            fontWeight="bold"
            color="primary"
            sx={{ letterSpacing: 0.5 }}
          >
            Şifremi Unuttum
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="E-posta"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {hata && <Alert severity="error" sx={{ mt: 2 }}>{hata}</Alert>}
            {mesaj && <Alert severity="success" sx={{ mt: 2 }}>{mesaj}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                fontWeight: "bold",
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)",
                },
                boxShadow: "0px 3px 6px rgba(0,0,0,0.2)",
              }}
            >
              Bağlantı Gönder
            </Button>

            <Box mt={2}>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "#1565c0",
                  fontWeight: 500,
                }}
              >
                ← Giriş Sayfasına Dön
              </Link>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}
