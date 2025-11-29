import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  InputAdornment,
  Chip,
  Fade,
  Zoom,
  Paper,
  IconButton,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd,
  Close,
  TrendingUp,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function KullaniciArama() {
  const [aramatext, setAramaText] = useState("");
  const [sonuclar, setSonuclar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [bosMu, setBosMu] = useState(false);
  const [arandiMi, setArandiMi] = useState(false);

  // Popüler aramalar (örnek)
  const populerAramalar = ["harry", "user", "test"];

  async function ara() {
    if (!aramatext.trim()) return;

    setYukleniyor(true);
    setBosMu(false);
    setArandiMi(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/kullanicilar/");
      const data = await res.json();

      const filtre = data.filter((u) =>
        u.username.toLowerCase().includes(aramatext.toLowerCase())
      );

      setSonuclar(filtre);
      if (filtre.length === 0) setBosMu(true);
    } catch (err) {
      console.error("Arama hatası:", err);
      setBosMu(true);
    }

    setYukleniyor(false);
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      ara();
    }
  };

  const temizle = () => {
    setAramaText("");
    setSonuclar([]);
    setBosMu(false);
    setArandiMi(false);
  };

  const populerAramaClick = (kelime) => {
    setAramaText(kelime);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        {/* Başlık */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <PersonAdd
                sx={{
                  fontSize: 50,
                  color: "white",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
                }}
              />
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  color: "white",
                  textShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  letterSpacing: -1,
                }}
              >
                Kullanıcı Ara
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 400,
              }}
            >
              Topluluğumuzdaki kullanıcıları keşfedin
            </Typography>
          </Box>
        </Fade>

        {/* Arama Kutusu */}
        <Zoom in timeout={600}>
          <Paper
            elevation={24}
            sx={{
              p: 3,
              borderRadius: 4,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(30, 30, 30, 0.9)"
                  : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Kullanıcı adı ara..."
                fullWidth
                variant="outlined"
                value={aramatext}
                onChange={(e) => setAramaText(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: aramatext && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={temizle}>
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                    "&.Mui-focused": {
                      transform: "translateY(-2px)",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={ara}
                disabled={!aramatext.trim() || yukleniyor}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 28px rgba(102, 126, 234, 0.5)",
                  },
                  "&:active": {
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background: "gray",
                  },
                }}
                startIcon={yukleniyor ? null : <SearchIcon />}
              >
                {yukleniyor ? <CircularProgress size={24} color="inherit" /> : "Ara"}
              </Button>
            </Box>

            {/* Popüler Aramalar */}
            {!arandiMi && (
              <Fade in timeout={1000}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <TrendingUp sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Popüler aramalar:
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {populerAramalar.map((kelime) => (
                      <Chip
                        key={kelime}
                        label={kelime}
                        onClick={() => populerAramaClick(kelime)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 500,
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Zoom>

        {/* Sonuç Sayısı */}
        {arandiMi && !yukleniyor && sonuclar.length > 0 && (
          <Fade in>
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 3,
                background: (theme) =>
                  alpha(theme.palette.success.main, 0.1),
                border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "success.main", fontWeight: 600, textAlign: "center" }}
              >
                🎉 {sonuclar.length} kullanıcı bulundu
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Sonuç yok */}
        {bosMu && (
          <Fade in>
            <Paper
              elevation={4}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 4,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(30, 30, 30, 0.9)"
                    : "rgba(255, 255, 255, 0.95)",
              }}
            >
              <PersonIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Kullanıcı bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Farklı bir arama terimi deneyin
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Sonuç Listesi */}
        <Box sx={{ mt: 3 }}>
          {sonuclar.map((k, index) => (
            <Zoom in timeout={400 + index * 100} key={k.id}>
              <Card
                sx={{
                  mb: 2,
                  p: 2.5,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 3,
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(30, 30, 30, 0.9)"
                      : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease",
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  "&:hover": {
                    boxShadow: 12,
                    transform: "translateY(-4px)",
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: 3,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 36 }} />
                </Avatar>

                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 0.5 }}
                  >
                    {k.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {k.email}
                  </Typography>
                </CardContent>

                <Button
                  component={Link}
                  to={`/profil/${k.id}`}
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 16px rgba(102, 126, 234, 0.5)",
                    },
                  }}
                >
                  Profili Gör
                </Button>
              </Card>
            </Zoom>
          ))}
        </Box>
      </Container>
    </Box>
  );
}