import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Fade,
  
  IconButton,

  Link as MuiLink,
  Alert,
  InputAdornment,
  
  useTheme,
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
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata("");
    setMesaj("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/giris/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password: sifre,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMesaj(data.mesaj);
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

  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/kutuphane.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        p: 2, // Mobil kenar boşluğu
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={24}
          sx={{
            // RESPONSIVE AYARLAR:
            width: "100%",
            maxWidth: 400, // Masaüstünde max 400px
            p: { xs: 3, sm: 4 }, // Mobilde padding 3, masaüstünde 4
            borderRadius: 4,
            backgroundColor: isDark 
              ? "rgba(30, 30, 30, 0.85)" 
              : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            textAlign: "center",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "none",
            color: theme.palette.text.primary,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              mx: "auto",
              mb: 2,
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
              variant="outlined"
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

            {hata && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{hata}</Alert>}
            {mesaj && <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>{mesaj}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)",
                  boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
                },
                boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
              }}
            >
              GİRİŞ YAP
            </Button>

            <Box
              mt={3}
              display="flex"
              justifyContent="space-between"
              fontSize={14}
              sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }} // Mobilde linkleri alt alta al
            >
              <MuiLink
                component={Link}
                to="/sifre-unuttum"
                underline="hover"
                color="primary" 
                fontWeight="500"
              >
                Şifremi Unuttum
              </MuiLink>

              <MuiLink
                component={Link}
                to="/kayit"
                underline="hover"
                color="primary"
                fontWeight="500"
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