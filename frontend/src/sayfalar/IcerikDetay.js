import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Chip,
  Grid,
  Rating,
  TextField,
  Button,
  Divider,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  alpha,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  Star,
  StarBorder,
  Send,
  Movie,
  MenuBook,
  Person,
  LibraryAdd,
  PlaylistAdd,
  Delete,
  Edit,
} from "@mui/icons-material";

import { useKimlik } from "../baglam/KimlikBaglami";
import { useTheme } from "@mui/material/styles";

export default function IcerikDetay() {
  const { tur, id } = useParams();
  const { kullanici } = useKimlik();
  const theme = useTheme();

  const aktifKullaniciId = kullanici?.id || null;

  const [veri, setVeri] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [yorum, setYorum] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [puan, setPuan] = useState(0);

  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [duzenlenecekId, setDuzenlenecekId] = useState(null);

  const [seciliDurum, setSeciliDurum] = useState(null);

  const [listeler, setListeler] = useState([]);
  const [listeAnchor, setListeAnchor] = useState(null);
  const listeMenusuAc = (e) => setListeAnchor(e.currentTarget);
  const listeMenusuKapat = () => setListeAnchor(null);

  // 🔥 Silme popup state
  const [silPopupAcik, setSilPopupAcik] = useState(false);
  const [silinenYorumId, setSilinenYorumId] = useState(null);

  // ------------------------------------------------------
  // DETAY GETİRME
  // ------------------------------------------------------
  useEffect(() => {
    async function getir() {
      try {
        const uid = aktifKullaniciId ? `?user_id=${aktifKullaniciId}` : "";
        const res = await fetch(
          `http://127.0.0.1:8000/api/icerik-detay/${tur}/${id}/${uid}`
        );

        const data = await res.json();
        setVeri(data);

        if (data.kullanici_puani) setPuan(data.kullanici_puani);
      } catch (e) {
        console.error("Detay hata:", e);
      } finally {
        setYukleniyor(false);
      }
    }

    getir();
  }, [tur, id, aktifKullaniciId]);

  // ------------------------------------------------------
  // PUAN GÖNDERME
  // ------------------------------------------------------
  async function puanGonder(yeni) {
    if (!aktifKullaniciId) {
      alert("Puan verebilmek için giriş yapmalısın!");
      return;
    }

    setPuan(yeni);

    try {
      await fetch("http://127.0.0.1:8000/api/puan/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kullanici: aktifKullaniciId,
          content_id: id,
          content_type: tur,
          puan: yeni,
        }),
      });
    } catch (err) {
      console.error("Puan hatası:", err);
    }
  }

  // ------------------------------------------------------
  // YORUM GÖNDERME
  // ------------------------------------------------------
  async function yorumGonder() {
    if (!aktifKullaniciId) {
      alert("Yorum yapabilmek için giriş yapman gerekiyor!");
      return;
    }

    if (!yorum.trim()) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/yorum/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kullanici: aktifKullaniciId,
          content_id: id,
          content_type: tur,
          yorum: yorum,
        }),
      });

      const data = await res.json();
      setMesaj("Yorum gönderildi!");

      setVeri({
        ...veri,
        yorumlar: [
          {
            id: data.id,
            kullanici: aktifKullaniciId,
            kullanici_username: kullanici.username,
            yorum: yorum,
            tarih: new Date().toISOString(),
          },
          ...(veri.yorumlar || []),
        ],
      });

      setYorum("");
      setDuzenlemeModu(false);
      setDuzenlenecekId(null);

      setTimeout(() => setMesaj(""), 3000);
    } catch (err) {
      console.error("Yorum hatası:", err);
    }
  }

  // ------------------------------------------------------
  // 🔥 YORUM SİLME – MODERN POPUP
  // ------------------------------------------------------

  // Silme popup’ını aç
  function yorumSilOnayla(yorumId) {
    setSilinenYorumId(yorumId);
    setSilPopupAcik(true);
  }

  // Silmeyi gerçekten yap
  async function yorumSil() {
    try {
      await fetch(`http://127.0.0.1:8000/api/yorum/${silinenYorumId}/`, {
        method: "DELETE",
      });

      setVeri({
        ...veri,
        yorumlar: veri.yorumlar.filter((y) => y.id !== silinenYorumId),
      });

      setSilPopupAcik(false);
      setSilinenYorumId(null);
    } catch (err) {
      console.error("Yorum silme hatası:", err);
    }
  }

  // ------------------------------------------------------
  // YORUM DÜZENLEME
  // ------------------------------------------------------
  function yorumuDuzenlemeyeAc(y) {
    setDuzenlemeModu(true);
    setDuzenlenecekId(y.id);
    setYorum(y.yorum);
  }

  async function yorumDuzenle() {
    if (!yorum.trim()) return;

    try {
      await fetch(`http://127.0.0.1:8000/api/yorum/${duzenlenecekId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yorum }),
      });

      const guncel = veri.yorumlar.map((y) =>
        y.id === duzenlemeModu ? { ...y, yorum } : y
      );

      const guncellenmis = veri.yorumlar.map((y) =>
        y.id === duzenlenecekId ? { ...y, yorum } : y
      );

      setVeri({ ...veri, yorumlar: guncellenmis });
      setDuzenlemeModu(false);
      setDuzenlenecekId(null);
      setYorum("");
    } catch (err) {
      console.error("Yorum düzenleme hatası:", err);
    }
  }

  // ------------------------------------------------------
  // KÜTÜPHANEYE EKLEME
  // ------------------------------------------------------
  async function kutuphaneEkle(durum) {
    if (!aktifKullaniciId) {
      alert("Giriş yapmalısın!");
      return;
    }

    setSeciliDurum(durum);

    try {
      await fetch("http://127.0.0.1:8000/api/kutuphane/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kullanici: aktifKullaniciId,
          content_id: id,
          content_type: tur,
          durum,
        }),
      });

      setMesaj(`Kütüphaneye "${durum}" olarak eklendi`);
      setTimeout(() => setMesaj(""), 2500);
    } catch (err) {
      console.error("Kütüphane hatası:", err);
    }
  }

  // ------------------------------------------------------
  // ÖZEL LİSTELERİ GETİR
  // ------------------------------------------------------
  async function listeleriGetir() {
    if (!aktifKullaniciId) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/ozel-liste/?kullanici=${aktifKullaniciId}`
      );
      const data = await res.json();
      setListeler(data);
    } catch (err) {
      console.error("Liste getir hatası:", err);
    }
  }

  useEffect(() => {
    if (listeAnchor) listeleriGetir();
  }, [listeAnchor]);

  // ------------------------------------------------------
  // LİSTEYE EKLE
  // ------------------------------------------------------
  async function listeyeEkle(listeId) {
    try {
      await fetch("http://127.0.0.1:8000/api/ozel-liste-icerik/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liste: listeId,
          content_id: id,
          content_type: tur,
        }),
      });

      setMesaj("Listeye eklendi ✓");
      setTimeout(() => setMesaj(""), 2000);
      listeMenusuKapat();
    } catch (err) {
      console.error("Listeye ekleme hatası:", err);
    }
  }

  // ------------------------------------------------------
  // Kütüphane butonu stili
  // ------------------------------------------------------
  const kutuphaneButonStil = (aktif) => ({
    borderRadius: 2,
    border: `1px solid ${alpha(
      theme.palette.primary.main,
      aktif ? 0.8 : 0.2
    )}`,
    bgcolor: aktif ? alpha(theme.palette.primary.main, 0.12) : "transparent",
    mx: 0.5,
  });

  // ------------------------------------------------------
  // LOADING
  // ------------------------------------------------------
  if (yukleniyor)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    );

  if (!veri)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h5" color="text.secondary">
          İçerik bulunamadı.
        </Typography>
      </Box>
    );

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="xl">
        {/* ÜST ALAN */}
        <Grid container spacing={4}>
          {/* KAPAK RESMİ */}
          <Grid item xs={12} md={4}>
            <Zoom in timeout={600}>
              <Card
                elevation={24}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={
                    veri.kapak ||
                    "https://via.placeholder.com/400x600?text=Kapak+Yok"
                  }
                  alt={veri.baslik}
                  sx={{
                    height: { xs: 400, md: 600 },
                    objectFit: "cover",
                  }}
                />

                {/* Gradient Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                    display: "flex",
                    alignItems: "flex-end",
                    p: 3,
                  }}
                >
                  <Chip
                    icon={tur === "film" ? <Movie /> : <MenuBook />}
                    label={tur.toUpperCase()}
                    sx={{
                      bgcolor:
                        tur === "film"
                          ? "rgba(244, 67, 54, 0.9)"
                          : "rgba(33, 150, 243, 0.9)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      py: 2.5,
                      px: 1,
                    }}
                  />
                </Box>
              </Card>
            </Zoom>
          </Grid>

          {/* DETAY BİLGİLERİ */}
          <Grid item xs={12} md={8}>
            <Fade in timeout={800}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(30, 30, 30, 0.9)"
                      : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <Typography
                  variant="h3"
                  fontWeight={800}
                  gutterBottom
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: -1,
                  }}
                >
                  {veri.baslik}
                </Typography>

                {/* META */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                  {tur === "film" && veri.yonetmen && (
                    <Chip
                      icon={<Person />}
                      label={`Yönetmen: ${veri.yonetmen}`}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}

                  {tur === "kitap" && veri.yazarlar && (
                    <Chip
                      icon={<Person />}
                      label={`Yazar: ${veri.yazarlar.join(", ")}`}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    mb: 4,
                    lineHeight: 1.8,
                    fontSize: "1.1rem",
                    color: "text.secondary",
                  }}
                >
                  {veri.ozet || veri.aciklama}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* PUAN + BUTONLAR */}
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Puanın:
                  </Typography>
                  <Rating
                    max={10}
                    value={puan}
                    onChange={(e, yeni) => puanGonder(yeni)}
                    size="large"
                    icon={<Star fontSize="inherit" />}
                    emptyIcon={<StarBorder fontSize="inherit" />}
                    sx={{
                      fontSize: "2.5rem",
                      "& .MuiRating-iconFilled": {
                        color: "#ffc107",
                      },
                      "& .MuiRating-iconHover": {
                        color: "#ffb300",
                      },
                    }}
                  />

                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.warning.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Star sx={{ color: "warning.main", fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={700}>
                      Platform Ortalaması:{" "}
                      <span style={{ color: theme.palette.warning.main }}>
                        {veri.platform_puani}
                      </span>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: "auto" }}
                    >
                      ({veri.oy_sayisi} oy)
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Tooltip
                      title={tur === "film" ? "İzledim" : "Okudum"}
                    >
                      <IconButton
                        onClick={() =>
                          kutuphaneEkle(
                            tur === "film" ? "izledim" : "okudum"
                          )
                        }
                        sx={kutuphaneButonStil(
                          seciliDurum ===
                            (tur === "film" ? "izledim" : "okudum")
                        )}
                      >
                        <LibraryAdd />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={tur === "film" ? "İzlenecek" : "Okunacak"}
                    >
                      <IconButton
                        onClick={() =>
                          kutuphaneEkle(
                            tur === "film" ? "izlenecek" : "okunacak"
                          )
                        }
                        sx={kutuphaneButonStil(
                          seciliDurum ===
                            (tur === "film" ? "izlenecek" : "okunacak")
                        )}
                      >
                        <LibraryAdd fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Özel listeye ekle">
                      <span>
                        <IconButton
                          onClick={listeMenusuAc}
                          sx={kutuphaneButonStil(false)}
                          disabled={!aktifKullaniciId}
                        >
                          <PlaylistAdd />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Menu
                      anchorEl={listeAnchor}
                      open={Boolean(listeAnchor)}
                      onClose={listeMenusuKapat}
                    >
                      {listeler.length === 0 && (
                        <MenuItem disabled>Liste bulunamadı</MenuItem>
                      )}
                      {listeler.map((l) => (
                        <MenuItem
                          key={l.id}
                          onClick={() => listeyeEkle(l.id)}
                        >
                          {l.ad}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </Paper>

                {mesaj && (
                  <Alert
                    severity="success"
                    sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}
                    onClose={() => setMesaj("")}
                  >
                    {mesaj}
                  </Alert>
                )}
              </Paper>
            </Fade>
          </Grid>
        </Grid>

        {/* YORUMLAR */}
        <Fade in timeout={1000}>
          <Paper
            elevation={12}
            sx={{
              mt: 6,
              p: 4,
              borderRadius: 4,
              background:
                theme.palette.mode === "dark"
                  ? "rgba(30, 30, 30, 0.9)"
                  : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              💬 Yorumlar
              <Chip
                label={veri.yorumlar?.length || 0}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            </Typography>


            {/* Yorum yazma formu */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.03),
                border: `1px solid ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}`,
              }}
            >
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={
                  duzenlemeModu
                    ? "Yorumunu düzenle..."
                    : "Düşüncelerini paylaş..."
                }
                value={yorum}
                onChange={(e) => setYorum(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: "1rem",
                  },
                }}
              />

              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<Send />}
                  onClick={duzenlemeModu ? yorumDuzenle : yorumGonder}
                  disabled={!yorum.trim()}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow:
                      "0 8px 20px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow:
                        "0 12px 28px rgba(102, 126, 234, 0.5)",
                    },
                    "&:disabled": {
                      background: "gray",
                    },
                  }}
                >
                  {duzenlemeModu ? "Yorumu Güncelle" : "Yorumu Gönder"}
                </Button>

                {duzenlemeModu && (
                  <Button
                    variant="text"
                    onClick={() => {
                      setDuzenlemeModu(false);
                      setDuzenlenecekId(null);
                      setYorum("");
                    }}
                  >
                    Vazgeç
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Yorumlar listesi */}
            {veri.yorumlar?.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {veri.yorumlar.map((y, index) => {
                  const kendiYorumum =
                    aktifKullaniciId &&
                    (y.kullanici === aktifKullaniciId ||
                      y.kullanici_id === aktifKullaniciId);

                  const tarihMetni = y.tarih
                    ? new Date(y.tarih).toLocaleString("tr-TR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "";

                  return (
                    <Zoom in timeout={300 + index * 100} key={y.id}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          transition: "all 0.3s ease",
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                          "&:hover": {
                            transform: "translateX(8px)",
                            boxShadow: 4,
                            border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.3
                            )}`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                fontWeight: 700,
                              }}
                            >
                              {y.kullanici_username?.[0]?.toUpperCase() ||
                                "?"}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                              >
                                {y.kullanici_username || "Bilinmeyen"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Kullanıcı
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {tarihMetni && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {tarihMetni}
                              </Typography>
                            )}

                            {kendiYorumum && (
                              <>
                                <Tooltip title="Yorumu düzenle">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      yorumuDuzenlemeyeAc(y)
                                    }
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Yorumu sil">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      yorumSilOnayla(y.id)
                                    }
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            lineHeight: 1.7,
                            fontSize: "1rem",
                            pl: 1,
                          }}
                        >
                          {y.yorum}
                        </Typography>
                      </Paper>
                    </Zoom>
                  );
                })}
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  background: alpha(theme.palette.action.hover, 0.3),
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  fontWeight={600}
                >
                  💭 Henüz yorum yok
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  İlk yorumu sen yap!
                </Typography>
              </Paper>
            )}
          </Paper>
        </Fade>
      </Container>

      {/* 🔥 MODERN SİLME POPUP */}
      <Dialog
        open={silPopupAcik}
        onClose={() => setSilPopupAcik(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Yorum silinsin mi?</DialogTitle>

        <DialogContent dividers>
          <Typography>
            Bu işlem geri alınamaz. Yorumu silmek istediğine emin misin?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSilPopupAcik(false)}>Vazgeç</Button>

          <Button
            color="error"
            variant="contained"
            onClick={yorumSil}
            sx={{ fontWeight: 700 }}
          >
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
