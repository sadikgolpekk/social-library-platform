import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  TextField,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Grid,
  Chip,
  InputAdornment,
  CircularProgress,
  Fade,
  Button,
  Paper,
  alpha,
  IconButton,
  Zoom,
  Tabs,
  Tab,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
} from "@mui/material";

import {
  Search as SearchIcon,
  Movie as MovieIcon,
  Book as BookIcon,
  AddCircleOutline,
  StarBorder,
  Close,
  TrendingUp,
  Whatshot,
  LocalMovies,
  MenuBook,
  Star,
  EmojiEvents,
  FilterList,
  TuneOutlined,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

export default function Arama() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [sorgu, setSorgu] = useState("");
  const [sonuclar, setSonuclar] = useState(null);
  const [vitrinIcerik, setVitrinIcerik] = useState(null);
  const [enYuksekPuanli, setEnYuksekPuanli] = useState(null);
  const [enPopuler, setEnPopuler] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [aktifVitrin, setAktifVitrin] = useState(0); // 0: Harry, 1: En Yüksek Puanlı, 2: En Popüler

  // Gelişmiş Filtre State'leri
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [filtreTur, setFiltreTur] = useState("");
  
  const [filtrePuanAralik, setFiltrePuanAralik] = useState([0, 10]);
  const [filtreSirala, setFiltreSirala] = useState("");
  const [filtreSonuclari, setFiltreSonuclari] = useState(null);

  // Popüler aramalar
  const populerAramalar = ["Harry Potter", "Lord of the Rings", "Inception", "1984"];

  // --- İlk açılışta tüm vitrin verilerini yükle ---
  useEffect(() => {
    async function tumVitrinleriGetir() {
      try {
        // Harry vitrin
        const resHarry = await fetch("http://127.0.0.1:8000/api/global-arama/?q=Harry Potter");
        const dataHarry = await resHarry.json();
        setVitrinIcerik(dataHarry);

        // En Yüksek Puanlı
        const resYuksek = await fetch("http://127.0.0.1:8000/api/vitrin-en-yuksek-puanli/");
        const dataYuksek = await resYuksek.json();
        setEnYuksekPuanli(dataYuksek);

        // En Popüler
        const resPopuler = await fetch("http://127.0.0.1:8000/api/vitrin-en-populer/");
        const dataPopuler = await resPopuler.json();
        setEnPopuler(dataPopuler);
      } catch (err) {
        console.error("Vitrin yüklenemedi:", err);
      }
    }
    tumVitrinleriGetir();
  }, []);

  // --- Debounce Arama ---
  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      if (sorgu.trim().length > 1) ara();
      else setSonuclar(null);
    }, 400);

    return () => clearTimeout(zamanlayici);
  }, [sorgu]);

  // --- Arama İşlemi ---
  async function ara() {
    setYukleniyor(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/global-arama/?q=${encodeURIComponent(sorgu)}`
      );

      if (!res.ok) throw new Error("Sunucudan geçersiz cevap geldi.");

      const data = await res.json();
      setSonuclar(data);
    } catch (err) {
      console.error("Arama hatası:", err);
      setSonuclar({ tmdb_sonuclari: [], google_kitap_sonuclari: [] });
    } finally {
      setYukleniyor(false);
    }
  }

  const temizle = () => {
    setSorgu("");
    setSonuclar(null);
  };

  const populerAramaClick = (kelime) => {
    setSorgu(kelime);
  };

  // --- Gelişmiş Filtre Uygula ---
  const filtreUygula = async () => {
    setYukleniyor(true);
    try {
      const params = new URLSearchParams();
      if (filtreTur) params.append("tur", filtreTur);
    
      params.append("min_puan", filtrePuanAralik[0]);
      params.append("max_puan", filtrePuanAralik[1]);
      if (filtreSirala) params.append("sirala", filtreSirala);

      const res = await fetch(
        `http://127.0.0.1:8000/api/gelismis-filtre/?${params.toString()}`
      );

      if (!res.ok) throw new Error("Filtre hatası");

      const data = await res.json();
      setFiltreSonuclari(data.sonuclar || []);
      setSorgu(""); // Arama kutusunu temizle
      setAktifVitrin(-1); // Vitrin sekmelerini devre dışı bırak
    } catch (err) {
      console.error("Filtre hatası:", err);
      setFiltreSonuclari([]);
    } finally {
      setYukleniyor(false);
    }
  };

  const filtreTemizle = () => {
    setFiltreTur("");
   
    setFiltrePuanAralik([0, 10]);
    setFiltreSirala("");
    setFiltreSonuclari(null);
    setAktifVitrin(0);
  };

  // --- Sonuç Kartı ---
  const SonucKarti = ({ item, tur, index, populerSkor }) => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Zoom in timeout={300 + index * 50}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "background.paper",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            "&:hover": {
              transform: "translateY(-12px) scale(1.02)",
              boxShadow: theme.palette.mode === "dark"
                ? "0 20px 40px rgba(255,255,255,0.15)"
                : "0 20px 40px rgba(0,0,0,0.2)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              "& .card-overlay": {
                opacity: 1,
              },
            },
          }}
        >
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <CardMedia
              component="img"
              height="320"
              image={
                item.kapak ||
                "https://via.placeholder.com/300x450?text=Görsel+Bulunamadı"
              }
              alt={item.baslik}
              sx={{
                objectFit: "cover",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            />

            {/* Gradient Overlay */}
            <Box
              className="card-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)",
                opacity: 0,
                transition: "opacity 0.3s ease",
              }}
            />

            <Chip
              label={tur}
              icon={tur === "film" ? <LocalMovies /> : <MenuBook />}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: tur === "film"
                  ? "rgba(244, 67, 54, 0.9)"
                  : "rgba(33, 150, 243, 0.9)",
                color: "white",
                fontWeight: 600,
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            />

            {/* Popüler Skor Badge */}
            {populerSkor && (
              <Chip
                label={`🔥 ${populerSkor}`}
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  bgcolor: "rgba(255, 152, 0, 0.95)",
                  color: "white",
                  fontWeight: 700,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
            )}
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {item.baslik}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
              }}
            >
              {item.ozet || item.aciklama || "Açıklama bulunmuyor."}
            </Typography>
          </CardContent>

          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              startIcon={<AddCircleOutline />}
              variant="contained"
              onClick={() => navigate(`/detay/${tur.toLowerCase()}/${item.id}`)}
              sx={{
                borderRadius: 2,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              İncele
            </Button>
          </Box>
        </Card>
      </Zoom>
    </Grid>
  );

  // Hangi vitrin gösterilecek
  const getVitrinData = () => {
    // Filtre sonuçları varsa onları göster
    if (filtreSonuclari) {
      const filmler = filtreSonuclari.filter(item => item.tur === "film");
      const kitaplar = filtreSonuclari.filter(item => item.tur === "kitap");
      return {
        tmdb_sonuclari: filmler,
        google_kitap_sonuclari: kitaplar
      };
    }

    if (sorgu.length > 1) return sonuclar;
    
    if (aktifVitrin === 1 && enYuksekPuanli) {
      return {
        tmdb_sonuclari: enYuksekPuanli.filmler || [],
        google_kitap_sonuclari: enYuksekPuanli.kitaplar || []
      };
    }
    
    if (aktifVitrin === 2 && enPopuler) {
      // Popüler sonuçları film ve kitap olarak ayır
      const filmler = enPopuler.populer?.filter(item => item.tur === "film") || [];
      const kitaplar = enPopuler.populer?.filter(item => item.tur === "kitap") || [];
      return {
        tmdb_sonuclari: filmler,
        google_kitap_sonuclari: kitaplar
      };
    }
    
    return vitrinIcerik;
  };

  const gosterilecekListe = getVitrinData();
  
  const getListeBasligi = () => {
    if (filtreSonuclari) return "Filtrelenmiş Sonuçlar";
    if (sorgu.length > 1) return "Arama Sonuçları";
    if (aktifVitrin === 1) return "En Yüksek Puanlı İçerikler";
    if (aktifVitrin === 2) return "En Popüler İçerikler";
    return "Vitrin & Popüler İçerikler";
  };

  const listeBasligi = getListeBasligi();

  const toplamSonuc =
    (gosterilecekListe?.tmdb_sonuclari?.length || 0) +
    (gosterilecekListe?.google_kitap_sonuclari?.length || 0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="xl">
        {/* BAŞLIK & ARAMA KUTUSU */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 2, mb: 3 }}>
              <SearchIcon
                sx={{
                  fontSize: 60,
                  color: "white",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              />
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  color: "white",
                  textShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  letterSpacing: -1.5,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                Keşfet & Ara
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                mb: 4,
                fontWeight: 400,
              }}
            >
              Milyonlarca film ve kitap arasından favorini bul
            </Typography>

            <Paper
              elevation={24}
              sx={{
                maxWidth: 800,
                mx: "auto",
                p: 3,
                borderRadius: 4,
                background: theme.palette.mode === "dark"
                  ? "rgba(30, 30, 30, 0.9)"
                  : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
              }}
            >
              <TextField
                fullWidth
                value={sorgu}
                onChange={(e) => setSorgu(e.target.value)}
                placeholder="Film, Kitap veya Yazar Ara..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {yukleniyor && <CircularProgress size={20} />}
                      {sorgu && !yukleniyor && (
                        <IconButton size="small" onClick={temizle}>
                          <Close />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontSize: "1.1rem",
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

              {/* Popüler Aramalar */}
              {sorgu.length <= 1 && (
                <Fade in timeout={1000}>
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <Whatshot sx={{ fontSize: 18, color: "error.main" }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Popüler Aramalar:
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

            {/* VİTRİN SEKMELERİ - Sadece arama yapılmadığında göster */}
            {sorgu.length <= 1 && !filtreSonuclari && (
              <Fade in timeout={1200}>
                <Paper
                  elevation={12}
                  sx={{
                    maxWidth: 800,
                    mx: "auto",
                    mt: 3,
                    borderRadius: 3,
                    background: theme.palette.mode === "dark"
                      ? "rgba(30, 30, 30, 0.8)"
                      : "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <Tabs
                    value={aktifVitrin}
                    onChange={(e, newValue) => setAktifVitrin(newValue)}
                    variant="fullWidth"
                    sx={{
                      "& .MuiTab-root": {
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        textTransform: "none",
                        py: 2,
                      },
                    }}
                  >
                    <Tab 
                      icon={<StarBorder />} 
                      iconPosition="start" 
                      label="Vitrin" 
                    />
                    <Tab 
                      icon={<Star />} 
                      iconPosition="start" 
                      label="En Yüksek Puanlı" 
                    />
                    <Tab 
                      icon={<EmojiEvents />} 
                      iconPosition="start" 
                      label="En Popüler" 
                    />
                  </Tabs>
                </Paper>
              </Fade>
            )}

            {/* GELİŞMİŞ FİLTRE PANELİ */}
            <Fade in timeout={1400}>
              <Paper
                elevation={12}
                sx={{
                  maxWidth: 800,
                  mx: "auto",
                  mt: 3,
                  borderRadius: 3,
                  overflow: "hidden",
                  background: theme.palette.mode === "dark"
                    ? "rgba(30, 30, 30, 0.8)"
                    : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <Button
                  fullWidth
                  startIcon={<TuneOutlined />}
                  onClick={() => setFiltreAcik(!filtreAcik)}
                  sx={{
                    py: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    color: theme.palette.mode === "dark" ? "white" : "primary.main",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  Gelişmiş Filtrele
                  {filtreAcik ? " ▲" : " ▼"}
                </Button>

                <Collapse in={filtreAcik}>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Tür Seçimi */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Tür</InputLabel>
                          <Select
                            value={filtreTur}
                            label="Tür"
                            onChange={(e) => setFiltreTur(e.target.value)}
                          >
                            <MenuItem value="">Hepsi</MenuItem>
                            <MenuItem value="film">Film</MenuItem>
                            <MenuItem value="kitap">Kitap</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      

                      {/* Puan Aralığı */}
                      <Grid item xs={12}>
                        <Typography gutterBottom fontWeight={600}>
                          Puan Aralığı: {filtrePuanAralik[0]} - {filtrePuanAralik[1]}
                        </Typography>
                        <Slider
                          value={filtrePuanAralik}
                          onChange={(e, newValue) => setFiltrePuanAralik(newValue)}
                          valueLabelDisplay="auto"
                          min={0}
                          max={10}
                          step={0.5}
                          marks={[
                            { value: 0, label: '0' },
                            { value: 5, label: '5' },
                            { value: 10, label: '10' }
                          ]}
                        />
                      </Grid>

                      {/* Sıralama */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Sıralama</InputLabel>
                          <Select
                            value={filtreSirala}
                            label="Sıralama"
                            onChange={(e) => setFiltreSirala(e.target.value)}
                          >
                            <MenuItem value="">Varsayılan</MenuItem>
                            <MenuItem value="puan">En Yüksek Puan</MenuItem>
                            <MenuItem value="populerlik">En Popüler</MenuItem>
                            
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Butonlar */}
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<FilterList />}
                            onClick={filtreUygula}
                            disabled={yukleniyor}
                            sx={{
                              py: 1.5,
                              fontWeight: 600,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                          >
                            {yukleniyor ? "Filtreleniyor..." : "Filtrele"}
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Close />}
                            onClick={filtreTemizle}
                            sx={{
                              py: 1.5,
                              fontWeight: 600,
                            }}
                          >
                            Temizle
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Paper>
            </Fade>
          </Box>
        </Fade>

        {/* SONUÇ SAYACI */}
        {((sorgu.length > 1 && !yukleniyor && toplamSonuc > 0) || 
          (filtreSonuclari && filtreSonuclari.length > 0)) && (
          <Fade in>
            <Box
              sx={{
                mb: 4,
                p: 2.5,
                borderRadius: 3,
                background: alpha(theme.palette.success.main, 0.15),
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "success.main",
                  fontWeight: 700,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <TrendingUp /> {filtreSonuclari ? filtreSonuclari.length : toplamSonuc} sonuç bulundu
              </Typography>
            </Box>
          </Fade>
        )}

        {/* SONUÇ LİSTESİ */}
        {gosterilecekListe && (
          <Fade in timeout={600}>
            <Box>
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 4,
                  background: theme.palette.mode === "dark"
                    ? "rgba(30, 30, 30, 0.8)"
                    : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {filtreSonuclari ? (
                    <FilterList sx={{ fontSize: 32, color: "info.main" }} />
                  ) : sorgu.length > 1 ? (
                    <SearchIcon sx={{ fontSize: 32, color: "primary.main" }} />
                  ) : aktifVitrin === 1 ? (
                    <Star sx={{ fontSize: 32, color: "warning.main" }} />
                  ) : aktifVitrin === 2 ? (
                    <EmojiEvents sx={{ fontSize: 32, color: "success.main" }} />
                  ) : (
                    <StarBorder sx={{ fontSize: 32, color: "warning.main" }} />
                  )}

                  <Typography variant="h4" fontWeight={700}>
                    {listeBasligi}
                  </Typography>
                </Box>
              </Paper>

              {/* Filmler */}
              {gosterilecekListe.tmdb_sonuclari?.length > 0 && (
                <Box mb={6}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 2.5,
                      mb: 3,
                      borderRadius: 3,
                      background: theme.palette.mode === "dark"
                        ? "rgba(30, 30, 30, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <MovieIcon sx={{ fontSize: 28, color: "error.main" }} />
                      <Typography variant="h5" fontWeight={700}>
                        Filmler
                      </Typography>
                      <Chip
                        label={gosterilecekListe.tmdb_sonuclari.length}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Paper>

                  <Grid container spacing={3}>
                    {gosterilecekListe.tmdb_sonuclari.map((film, index) => (
                      <SonucKarti 
                        key={film.id} 
                        item={film} 
                        tur="film" 
                        index={index}
                        populerSkor={film.populer_skor}
                      />
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Kitaplar */}
              {gosterilecekListe.google_kitap_sonuclari?.length > 0 && (
                <Box mb={6}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 2.5,
                      mb: 3,
                      borderRadius: 3,
                      background: theme.palette.mode === "dark"
                        ? "rgba(30, 30, 30, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <BookIcon sx={{ fontSize: 28, color: "info.main" }} />
                      <Typography variant="h5" fontWeight={700}>
                        Kitaplar
                      </Typography>
                      <Chip
                        label={gosterilecekListe.google_kitap_sonuclari.length}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Paper>

                  <Grid container spacing={3}>
                    {gosterilecekListe.google_kitap_sonuclari.map((kitap, index) => (
                      <SonucKarti 
                        key={kitap.id} 
                        item={kitap} 
                        tur="kitap" 
                        index={index}
                        populerSkor={kitap.populer_skor}
                      />
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}