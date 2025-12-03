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
  useTheme,
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
  const theme = useTheme();

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

    if (form.sifre !== form.tekrar) {
      setError("⚠️ Şifreler eşleşmiyor!");
      return;
    }

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
        setSuccess("Kayıt başarılı! 3 saniye içinde yönlendiriliyorsunuz...");
        // GÜNCELLENDİ: 3 Saniye (3000ms)
        setTimeout(() => navigate("/"), 3000);
      } else {
        setError(data.hata || "Kayıt başarısız oldu!");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanılamadı. Django çalışıyor mu?");
    }
  };

  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: "100vh", // height yerine minHeight kullandık ki mobilde içerik taşarsa scroll olsun
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/kutuphane.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 2, // Telefondan girenler için kenar boşluğu
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={24}
          sx={{
            // RESPONSIVE AYARLAR BURADA:
            width: "100%", 
            maxWidth: 440, // Masaüstünde 440px'i geçmesin
            p: { xs: 3, sm: 4 }, // Mobilde (xs) az boşluk, masaüstünde (sm ve üstü) çok boşluk
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
            <PersonAdd />
          </Avatar>

          <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
            Kayıt Ol
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Kullanıcı Adı"
              fullWidth
              margin="normal"
              value={form.kullaniciAdi}
              onChange={(e) =>
                setForm({ ...form, kullaniciAdi: e.target.value })
              }
              required
              variant="outlined"
            />

            <TextField
              label="E-posta"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

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

            {/* Şifre Kuralları Mobilde çok yer kaplamasın diye font küçültülebilir */}
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
                  { text: "Büyük harf (A-Z)", valid: sifreKurallari.buyuk },
                  { text: "Küçük harf (a-z)", valid: sifreKurallari.kucuk },
                  { text: "Rakam (0-9)", valid: sifreKurallari.rakam },
                  { text: "Özel karakter (!@#$)", valid: sifreKurallari.ozel },
                ].map((rule, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    {rule.valid ? (
                      <CheckCircle color="success" sx={{ mr: 1, fontSize: 18 }} />
                    ) : (
                      <Cancel color="action" sx={{ mr: 1, fontSize: 18, opacity: 0.5 }} />
                    )}
                    <ListItemText
                      primary={rule.text}
                      primaryTypographyProps={{
                        fontSize: 12, // Mobilde daha okunaklı
                        color: rule.valid ? "success.main" : "text.secondary",
                        sx: { opacity: rule.valid ? 1 : 0.7 }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

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

            {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>{success}</Alert>}

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
              KAYIT OL
            </Button>

            <Box mt={3}>
              <MuiLink component={Link} to="/" underline="hover" color="primary" fontWeight="500">
                Zaten hesabın var mı? Giriş Yap
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}