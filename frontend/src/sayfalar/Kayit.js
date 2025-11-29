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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

export default function Kayit() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    kullaniciAdi: "",
    email: "",
    sifre: "",
    tekrar: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔍 Şifre kuralları kontrol fonksiyonu
  const checkPassword = (sifre) => ({
    uzunluk: sifre.length >= 8,
    buyuk: /[A-Z]/.test(sifre),
    kucuk: /[a-z]/.test(sifre),
    rakam: /[0-9]/.test(sifre),
    ozel: /[^A-Za-z0-9]/.test(sifre),
  });

  const sifreKurallari = checkPassword(form.sifre);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔐 Şifre tekrar kontrolü
    if (form.sifre !== form.tekrar) {
      setError("⚠️ Şifreler eşleşmiyor!");
      return;
    }

    // 🔐 Şifre kuralları
    if (!Object.values(sifreKurallari).every(Boolean)) {
      setError("⚠️ Şifre tüm koşulları sağlamıyor.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/kayit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.kullaniciAdi,
          email: form.email,
          password: form.sifre,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Kayıt başarılı! Yönlendiriliyorsun...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(data.hata || "Kayıt başarısız oldu!");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanılamadı. Django çalışıyor mu?");
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
          "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/kutuphane.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={10}
          sx={{
            width: 440,
            p: 4,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(6px)",
            textAlign: "center",
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
            <PersonAdd />
          </Avatar>

          <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
            Kayıt Ol
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Kullanıcı Adı */}
            <TextField
              label="Kullanıcı Adı"
              fullWidth
              margin="normal"
              value={form.kullaniciAdi}
              onChange={(e) =>
                setForm({ ...form, kullaniciAdi: e.target.value })
              }
              required
            />

            {/* Email */}
            <TextField
              label="E-posta"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            {/* Şifre */}
            <TextField
              label="Şifre"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.sifre}
              onChange={(e) => setForm({ ...form, sifre: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Şifre Kuralları */}
            <Box sx={{ textAlign: "left", mt: 1, mb: 1 }}>
              <Typography
                variant="body2"
                color="textSecondary"
                fontWeight="bold"
                mb={0.5}
              >
                Şifre koşulları:
              </Typography>

              <List dense disablePadding>
                {[
                  { text: "En az 8 karakter", valid: sifreKurallari.uzunluk },
                  { text: "Büyük harf içermeli (A-Z)", valid: sifreKurallari.buyuk },
                  { text: "Küçük harf içermeli (a-z)", valid: sifreKurallari.kucuk },
                  { text: "Rakam içermeli (0-9)", valid: sifreKurallari.rakam },
                  { text: "Özel karakter içermeli (!@#$%^&*)", valid: sifreKurallari.ozel },
                ].map((rule, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    {rule.valid ? (
                      <CheckCircle color="success" sx={{ mr: 1, fontSize: 20 }} />
                    ) : (
                      <Cancel color="disabled" sx={{ mr: 1, fontSize: 20 }} />
                    )}
                    <ListItemText
                      primary={rule.text}
                      primaryTypographyProps={{
                        fontSize: 13,
                        color: rule.valid ? "green" : "gray",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Şifre Tekrar */}
            <TextField
              label="Şifre Tekrar"
              type={showRepeatPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={form.tekrar}
              onChange={(e) => setForm({ ...form, tekrar: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowRepeatPassword(!showRepeatPassword)
                      }
                    >
                      {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Alertler */}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

            {/* Kayıt butonu */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                fontWeight: "bold",
                borderRadius: 2,
                background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)",
                },
                boxShadow: "0px 3px 6px rgba(0,0,0,0.2)",
              }}
            >
              KAYIT OL
            </Button>

            <Box mt={2}>
              <MuiLink component={Link} to="/" underline="hover" color="primary">
                Zaten hesabın var mı? Giriş Yap
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}
