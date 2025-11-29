import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Fade,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useKimlik } from "../baglam/KimlikBaglami";

export default function Giris() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const { girisYap } = useKimlik();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata("");
    setMesaj("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/giris/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email, // hem e-posta hem kullanıcı adı kabul ediliyor
          password: sifre,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Başarılı giriş
        setMesaj(data.mesaj);

        // 🔥 BACKEND'DEN GELEN TÜM KULLANICI BİLGİLERİNİ KAYDETTİK
        girisYap({
          id: data.id,
          username: data.username,
          email: data.email,
        });

        setTimeout(() => navigate("/akis"), 1200);
      } else {
        setHata(data.hata || "Giriş başarısız!");
      }
    } catch (err) {
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
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
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
            <LockOutlined />
          </Avatar>

          <Typography
            variant="h5"
            mb={3}
            fontWeight="bold"
            color="primary"
            sx={{ letterSpacing: 0.5 }}
          >
            Giriş Yap
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Kullanıcı Adı veya E-posta"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label="Şifre"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
                boxShadow: "0px 3px 6px rgba(0,0,0,0.3)",
              }}
            >
              GİRİŞ YAP
            </Button>

            <Box
              mt={2}
              display="flex"
              justifyContent="space-between"
              fontSize={14}
            >
              <MuiLink
                component={Link}
                to="/sifre-unuttum"
                underline="hover"
                sx={{ color: "#1565c0" }}
              >
                Şifremi Unuttum
              </MuiLink>

              <MuiLink
                component={Link}
                to="/kayit"
                underline="hover"
                sx={{ color: "#1565c0" }}
              >
                Kayıt Ol
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}
