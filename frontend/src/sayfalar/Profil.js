// src/sayfalar/Profil.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Avatar,
  Typography,
  Container,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Modal,
  Chip,
  IconButton,
  Paper,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Add as AddIcon,
  Star as StarIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useKimlik } from "../baglam/KimlikBaglami";

export default function Profil() {
  const { id } = useParams();
  const { kullanici } = useKimlik();
  const navigate = useNavigate();

  const aktifId = kullanici?.id || null;

  const [profil, setProfil] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [takipEdiyorMu, setTakipEdiyorMu] = useState(false);

  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");

  const [listeModal, setListeModal] = useState(false);
  const [listeAd, setListeAd] = useState("");
  const [listeAciklama, setListeAciklama] = useState("");

  const [duzenlenecekListe, setDuzenlenecekListe] = useState(null);
  const [listeDuzenModal, setListeDuzenModal] = useState(false);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniAciklama, setYeniAciklama] = useState("");

  const [silinecekIcerik, setSilinecekIcerik] = useState(null);
  const [icerikSilModal, setIcerikSilModal] = useState(false);
  const [listeSilModal, setListeSilModal] = useState(false);

  const [tab, setTab] = useState(0);

  const [snackbar, setSnackbar] = useState({
    acik: false,
    mesaj: "",
    tip: "success",
  });

  // PROFIL GETIR
  useEffect(() => {
    async function getir() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/profil/${id}/`);
        const data = await res.json();
        setProfil(data);

        setAvatar(data.avatar || "");
        setBio(data.bio || "");

        if (aktifId && data?.takip_edenler?.includes(aktifId)) {
          setTakipEdiyorMu(true);
        }
      } catch (e) {
        console.error("Profil yükleme hatası:", e);
        setSnackbar({
          acik: true,
          mesaj: "Profil yüklenirken bir hata oluştu.",
          tip: "error",
        });
      } finally {
        setYukleniyor(false);
      }
    }

    getir();
  }, [id, aktifId]);

  if (yukleniyor)
    return (
      <Box
        mt={10}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );

  if (!profil)
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          Profil bulunamadı.
        </Typography>
      </Container>
    );

  const kendiProfili = aktifId === profil.kullanici;

  // BASE64 DÖNÜŞTÜRÜCÜ
  function base64eDonustur(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // AVATAR: Dosya seçme
  async function dosyaSec(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const b64 = await base64eDonustur(file);
      setAvatar(b64);

      setSnackbar({
        acik: true,
        mesaj: "Profil fotoğrafı önizlemesi güncellendi.",
        tip: "info",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "Görsel yüklenirken hata oluştu.",
        tip: "error",
      });
    }
  }

  // AVATAR: Drag & Drop
  async function dosyaSurukle(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const b64 = await base64eDonustur(file);
      setAvatar(b64);

      setSnackbar({
        acik: true,
        mesaj: "Profil fotoğrafı güncellendi.",
        tip: "info",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "Görsel yüklenirken hata oluştu.",
        tip: "error",
      });
    }
  }

  // TAKIP ET
  async function takipEt() {
    if (!aktifId) {
      setSnackbar({
        acik: true,
        mesaj: "Takip etmek için giriş yapmalısın.",
        tip: "warning",
      });
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/takip/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          takip_eden: aktifId,
          takip_edilen: profil.kullanici,
        }),
      });

      if (res.ok) {
        setTakipEdiyorMu(true);
        
        // 🔥 YENİ EKLENEN SATIR: Takipçi sayısını anlık artır
        setProfil(prev => ({
            ...prev, 
            takipci_sayisi: (prev.takipci_sayisi || 0) + 1
        }));

        setSnackbar({
          acik: true,
          mesaj: "Kullanıcıyı takip etmeye başladın.",
          tip: "success",
        });
      } else {
        setSnackbar({ acik: true, mesaj: "Takip başarısız.", tip: "error" });
      }
    } catch (err) {
      console.error("Takip hatası:", err);
      setSnackbar({ acik: true, mesaj: "Hata oluştu.", tip: "error" });
    }
  }

  // TAKİP BIRAK
  async function takipBirak() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/takip-sil/?takip_eden=${aktifId}&takip_edilen=${profil.kullanici}`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        setTakipEdiyorMu(false);

        // 🔥 YENİ EKLENEN SATIR: Takipçi sayısını anlık azalt
        setProfil(prev => ({
            ...prev, 
            takipci_sayisi: Math.max(0, (prev.takipci_sayisi || 0) - 1)
        }));

        setSnackbar({
          acik: true,
          mesaj: "Kullanıcı takipten çıkarıldı.",
          tip: "success",
        });
      } else {
        setSnackbar({ acik: true, mesaj: "İşlem başarısız.", tip: "error" });
      }
    } catch (err) {
      console.error("Takip bırak hata:", err);
      setSnackbar({ acik: true, mesaj: "Hata oluştu.", tip: "error" });
    }
  }

  // PROFIL GÜNCELLE
  async function profilKaydet() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/profil/${aktifId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar, bio }),
        }
      );

      if (res.ok) {
        setProfil({
          ...profil,
          avatar,
          bio,
        });

        setSnackbar({
          acik: true,
          mesaj: "Profil başarıyla güncellendi!",
          tip: "success",
        });

        setDuzenlemeModu(false);
      } else {
        setSnackbar({
          acik: true,
          mesaj: "Profil güncellenemedi.",
          tip: "error",
        });
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      setSnackbar({
        acik: true,
        mesaj: "Profil kaydedilirken hata oluştu.",
        tip: "error",
      });
    }
  }

  // KÜTÜPHANEDEN SİLME
  async function silKutup(content_id, content_type) {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/kutuphane-sil/?kullanici=${aktifId}&content_id=${content_id}`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        setProfil((prev) => ({
          ...prev,
          kutuphane_izlediklerim: prev.kutuphane_izlediklerim.filter(
            (k) => k.id !== content_id
          ),
          kutuphane_izlenecekler: prev.kutuphane_izlenecekler.filter(
            (k) => k.id !== content_id
          ),
          kutuphane_okuduklarim: prev.kutuphane_okuduklarim.filter(
            (k) => k.id !== content_id
          ),
          kutuphane_okunacaklar: prev.kutuphane_okunacaklar.filter(
            (k) => k.id !== content_id
          ),
        }));

        setSnackbar({
          acik: true,
          mesaj: "Kütüphaneden kaldırıldı.",
          tip: "success",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "Kütüphane silme hatası!",
        tip: "error",
      });
    }
  }

  // ÖZEL LİSTE: Ad ve Açıklama Güncelle
  async function listeGuncelle() {
    if (!yeniAd.trim()) {
      setSnackbar({
        acik: true,
        mesaj: "Liste adı boş olamaz.",
        tip: "warning",
      });
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/ozel-liste/${duzenlenecekListe.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ad: yeniAd,
            aciklama: yeniAciklama,
          }),
        }
      );

      if (res.ok) {
        setProfil((prev) => ({
          ...prev,
          ozel_listeler: prev.ozel_listeler.map((l) =>
            l.id === duzenlenecekListe.id
              ? { ...l, ad: yeniAd, aciklama: yeniAciklama }
              : l
          ),
        }));

        setListeDuzenModal(false);
        setSnackbar({
          acik: true,
          mesaj: "Liste güncellendi!",
          tip: "success",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "Liste güncellenirken hata oluştu.",
        tip: "error",
      });
    }
  }

  // ÖZEL LİSTE: Tamamen Sil
  async function listeSil() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/ozel-liste/${duzenlenecekListe.id}/`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        setProfil((prev) => ({
          ...prev,
          ozel_listeler: prev.ozel_listeler.filter(
            (l) => l.id !== duzenlenecekListe.id
          ),
        }));

        setListeSilModal(false);
        setSnackbar({
          acik: true,
          mesaj: "Liste silindi.",
          tip: "success",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "Liste silinirken hata oluştu.",
        tip: "error",
      });
    }
  }

  // ÖZEL LİSTE: İçerik Sil
  async function icerikSil() {
    try {
      const url = `http://127.0.0.1:8000/api/ozel-liste-icerik-sil/?liste=${duzenlenecekListe.id}&kullanici=${aktifId}&content_id=${silinecekIcerik.id}`;

      const res = await fetch(url, { method: "DELETE" });

      if (res.status === 204) {
        setProfil((prev) => ({
          ...prev,
          ozel_listeler: prev.ozel_listeler.map((l) =>
            l.id === duzenlenecekListe.id
              ? {
                  ...l,
                  icerikler: l.icerikler.filter(
                    (i) => i.id !== silinecekIcerik.id
                  ),
                }
              : l
          ),
        }));

        setIcerikSilModal(false);
        setSnackbar({
          acik: true,
          mesaj: "İçerik listeden kaldırıldı.",
          tip: "success",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "İçerik silinirken hata oluştu.",
        tip: "error",
      });
    }
  }

  // YENİ ÖZEL LİSTE OLUŞTUR
  async function listeOlustur() {
    if (!listeAd.trim()) {
      setSnackbar({
        acik: true,
        mesaj: "Liste adı boş olamaz.",
        tip: "warning",
      });
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ozel-liste/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kullanici: aktifId,
          ad: listeAd,
          aciklama: listeAciklama,
        }),
      });

      const data = await res.json();

      setProfil({
        ...profil,
        ozel_listeler: [...profil.ozel_listeler, data],
      });

      setListeAd("");
      setListeAciklama("");
      setListeModal(false);

      setSnackbar({
        acik: true,
        mesaj: "Yeni liste oluşturuldu.",
        tip: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        acik: true,
        mesaj: "Liste oluşturulurken hata.",
        tip: "error",
      });
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* PROFIL BAŞLIK BÖLÜMÜ */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                gap: 4,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Zoom in timeout={600}>
                <Avatar
                  src={avatar || ""}
                  sx={{
                    width: { xs: 140, md: 160 },
                    height: { xs: 140, md: 160 },
                    border: "5px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                />
              </Zoom>

              <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    mb: 1,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {profil.kullanici_bilgi.username}
                </Typography>

                {!duzenlemeModu && (
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      opacity: 0.95,
                      fontWeight: 300,
                      maxWidth: 600,
                    }}
                  >
                    {profil.bio || "Henüz bir biyografi eklenmemiş."}
                  </Typography>
                )}

               {/* DÜZENLEME MODU (DÜZELTİLMİŞ) */}
                {duzenlemeModu && (
                  <Fade in>
                    <Box
                      sx={{
                        mt: 3,
                        p: 3,
                        // 🔥 DÜZELTME 1: Arka planı yarı saydam siyah yaptık (Hem Dark hem Light modda okunur)
                        bgcolor: "rgba(0, 0, 0, 0.75)", 
                        backdropFilter: "blur(10px)",
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={dosyaSurukle}
                    >
                      <Typography
                        variant="body2"
                        // 🔥 DÜZELTME 2: Yazı rengini zorla beyaz yaptık
                        sx={{ mb: 2, fontWeight: 600, color: "#ffffff" }}
                      >
                        📸 Profil Fotoğrafı (Sürükle & Bırak veya Seç)
                      </Typography>

                      <Button
                        variant="contained"
                        component="label"
                        sx={{
                          bgcolor: "white",
                          color: "#333",
                          fontWeight: "bold",
                          "&:hover": { bgcolor: "#f0f0f0" },
                          mb: 3,
                        }}
                      >
                        Dosya Seç
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={dosyaSec}
                        />
                      </Button>

                      <TextField
                        label="Biyografi"
                        fullWidth
                        multiline
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        variant="outlined"
                        sx={{
                          mb: 3,
                          // 🔥 DÜZELTME 3: TextField renklerini beyaza uyarladık
                          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                          "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            bgcolor: "rgba(255,255,255,0.1)", // Hafif şeffaf beyaz arka plan
                            "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                            "&:hover fieldset": { borderColor: "white" },
                            "&.Mui-focused fieldset": { borderColor: "white" },
                          },
                        }}
                      />

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={profilKaydet}
                          sx={{
                            bgcolor: "#4caf50", // Yeşil
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": { bgcolor: "#43a047" },
                            flex: 1
                          }}
                        >
                          Kaydet
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={() => setDuzenlemeModu(false)}
                          sx={{
                            borderColor: "rgba(255,255,255,0.5)",
                            color: "white",
                            fontWeight: "bold",
                            "&:hover": { 
                                borderColor: "#ffcdd2", 
                                color: "#ffcdd2",
                                bgcolor: "rgba(255,0,0,0.1)" 
                            },
                            flex: 1
                          }}
                        >
                          İptal
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}

                {/* TAKIP İSTATİSTİKLERİ */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 4,
                    mt: 3,
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="bold">
                      {profil.takipci_sayisi || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Takipçi
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="bold">
                      {profil.takip_edilen_sayisi || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Takip
                    </Typography>
                  </Box>
                </Box>

                {/* BUTONLAR */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  {kendiProfili && !duzenlemeModu && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setDuzenlemeModu(true)}
                        sx={{
                          bgcolor: "white",
                          color: "#667eea",
                          fontWeight: 600,
                          px: 3,
                          "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                        }}
                      >
                        Profili Düzenle
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setListeModal(true)}
                        sx={{
                          borderColor: "white",
                          color: "white",
                          fontWeight: 600,
                          px: 3,
                          "&:hover": {
                            borderColor: "white",
                            bgcolor: "rgba(255,255,255,0.1)",
                          },
                        }}
                      >
                        Yeni Liste
                      </Button>
                    </>
                  )}

                  {!kendiProfili && (
                    <Button
                      variant="contained"
                      startIcon={
                        takipEdiyorMu ? <PersonRemoveIcon /> : <PersonAddIcon />
                      }
                      onClick={takipEdiyorMu ? takipBirak : takipEt}
                      sx={{
                        bgcolor: takipEdiyorMu
                          ? "rgba(255,255,255,0.2)"
                          : "white",
                        color: takipEdiyorMu ? "white" : "#667eea",
                        fontWeight: 600,
                        px: 4,
                        "&:hover": {
                          bgcolor: takipEdiyorMu
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(255,255,255,0.9)",
                        },
                      }}
                    >
                      {takipEdiyorMu ? "Takipten Çık" : "Takip Et"}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>


        {/* KÜTÜPHANE TABS */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, y) => setTab(y)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "1rem",
                py: 2,
                transition: "all 0.3s",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              },
              "& .Mui-selected": {
                color: "#667eea",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                bgcolor: "#667eea",
              },
            }}
          >
            <Tab label="🎬 İzlediklerim" />
            <Tab label="📺 İzlenecekler" />
            <Tab label="📚 Okuduklarım" />
            <Tab label="📖 Okunacaklar" />
          </Tabs>

          {/* TAB İÇERİKLERİ */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {(tab === 0
                ? profil.kutuphane_izlediklerim
                : tab === 1
                ? profil.kutuphane_izlenecekler
                : tab === 2
                ? profil.kutuphane_okuduklarim
                : profil.kutuphane_okunacaklar
              ).map((icerik, idx) => (
                <Grid key={idx} item xs={12} sm={6} md={4} lg={3}>
                  <Zoom in timeout={300 + idx * 50}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        transition: "all 0.3s",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(102, 126, 234, 0.3)",
                        },
                      }}
                    >
                      <Box
                        sx={{ position: "relative", paddingTop: "150%" }}
                        onClick={() =>
                          navigate(`/detay/${icerik.tur}/${icerik.id}`)
                        }
                      >
                        <Box
                          component="img"
                          src={icerik.kapak}
                          alt={icerik.baslik}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "50%",
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ pt: 2 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {icerik.baslik}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                    {icerik.yil ? `${icerik.yil} Yapımı` : ""}
                 </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mb: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            icon={<StarIcon sx={{ fontSize: 16 }} />}
                            label={icerik.platform_puani}
                            size="small"
                            sx={{
                              bgcolor: "warning.light",
                              color: "warning.dark",
                              fontWeight: 600,
                            }}
                          />

                          {icerik.kullanici_puani && (
                            <Chip
                              label={`Puanın: ${icerik.kullanici_puani}`}
                              size="small"
                              sx={{
                                bgcolor: "primary.light",
                                color: "primary.dark",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>

                        {kendiProfili && (
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => silKutup(icerik.id, icerik.tur)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "error.main",
                                color: "white",
                              },
                            }}
                          >
                            Kaldır
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>

            {(tab === 0
              ? profil.kutuphane_izlediklerim
              : tab === 1
              ? profil.kutuphane_izlenecekler
              : tab === 2
              ? profil.kutuphane_okuduklarim
              : profil.kutuphane_okunacaklar
            ).length === 0 && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Bu listede henüz içerik yok
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* YORUMLAR BÖLÜMÜ */}
        <Paper
          elevation={0}
          sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: "background.paper" }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CommentIcon sx={{ color: "#667eea" }} />
            Yorumlar
          </Typography>

          {profil.yorumlar?.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {profil.yorumlar.map((y) => (
                <Fade in key={y.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      display: "flex",
                      gap: 2,
                      borderRadius: 3,
                      bgcolor: "action.hover",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      "&:hover": {
                        bgcolor: "action.selected",
                        transform: "translateX(8px)",
                      },
                    }}
                    onClick={() =>
                      navigate(`/detay/${y.content_type}/${y.content_id}`)
                    }
                  >
                    <Box
                      component="img"
                      src={y.icerik.kapak}
                      alt={y.icerik.baslik}
                      sx={{
                        width: 80,
                        height: 120,
                        borderRadius: 2,
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {y.icerik.baslik}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                    {y.icerik.yil ? `${y.icerik.yil} Yapımı` : ""}
                  </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          p: 2,
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          borderLeft: "4px solid #667eea",
                        }}
                      >
                        {y.yorum}
                      </Typography>
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                Henüz yorum yapılmamış
              </Typography>
            </Box>
          )}
        </Paper>

        {/* PUANLAR BÖLÜMÜ */}
        <Paper
          elevation={0}
          sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: "background.paper" }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <StarIcon sx={{ color: "#ffd700" }} />
            Verilen Puanlar
          </Typography>

          {profil.puanlar?.length > 0 ? (
            <Grid container spacing={2}>
              {profil.puanlar.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.id}>
                  <Fade in>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: "flex",
                        gap: 2,
                        borderRadius: 3,
                        bgcolor: "action.hover",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        "&:hover": {
                          bgcolor: "action.selected",
                          transform: "scale(1.02)",
                        },
                      }}
                      onClick={() =>
                        navigate(`/detay/${p.content_type}/${p.content_id}`)
                      }
                    >
                      <Box
                        component="img"
                        src={p.icerik.kapak}
                        alt={p.icerik.baslik}
                        sx={{
                          width: 60,
                          height: 90,
                          borderRadius: 2,
                          objectFit: "cover",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {p.icerik.baslik}
                        </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                            {p.icerik.yil ? `${p.icerik.yil} Yapımı` : ""}
                          </Typography>

                        <Chip
                          icon={<StarIcon sx={{ fontSize: 16 }} />}
                          label={p.puan}
                          size="small"
                          sx={{
                            bgcolor: "warning.light",
                            color: "warning.dark",
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                Henüz puan verilmemiş
              </Typography>
            </Box>
          )}
        </Paper>

        {/* ÖZEL LİSTELER BÖLÜMÜ */}
        <Paper
          elevation={0}
          sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper" }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📋 Özel Listeler
          </Typography>

          <Grid container spacing={3}>
            {profil.ozel_listeler?.map((l) => (
              <Grid item xs={12} sm={6} md={4} key={l.id}>
                <Zoom in timeout={400}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.2)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          {l.ad}
                        </Typography>

                        {kendiProfili && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setDuzenlenecekListe(l);
                                setYeniAd(l.ad);
                                setYeniAciklama(l.aciklama || "");
                                setListeDuzenModal(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setDuzenlenecekListe(l);
                                setListeSilModal(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, minHeight: 40 }}
                      >
                        {l.aciklama || "Açıklama bulunmuyor."}
                      </Typography>

                      <Chip
                        label={`${l.icerikler.length} içerik`}
                        size="small"
                        sx={{
                          mb: 2,
                          bgcolor: "primary.light",
                          color: "primary.dark",
                          fontWeight: 600,
                        }}
                      />

                     {/* Liste İçerikleri (ÇALIŞAN) */}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {l.icerikler.map((ic) => (
                        <Grid item xs={6} key={ic.id}>
                          <Card
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              cursor: "pointer",
                              position: "relative",
                            }}
                            onClick={() => navigate(`/detay/${ic.tur}/${ic.id}`)}
                          >
                            <img
                              src={ic.kapak}
                              alt=""
                              style={{
                                width: "100%",
                                borderRadius: 10,
                                marginBottom: 8,
                              }}
                            />

                            <Typography variant="body1" fontWeight="bold">
                              {ic.baslik}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                            {ic.yil ? `${ic.yil} Yapımı` : ""}
                          </Typography>

                            {kendiProfili && (
                              <Button
                                size="small"
                                color="error"
                                sx={{
                                  mt: 1,
                                  width: "100%",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDuzenlenecekListe(l);
                                  setSilinecekIcerik(ic);
                                  setIcerikSilModal(true);
                                }}
                              >
                                İçeriği Kaldır
                              </Button>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {profil.ozel_listeler?.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                Henüz özel liste oluşturulmamış
              </Typography>
            </Box>
          )}
        </Paper>


        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.acik}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, acik: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.tip}
            variant="filled"
            onClose={() => setSnackbar({ ...snackbar, acik: false })}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {snackbar.mesaj}
          </Alert>
        </Snackbar>

        {/* LİSTE OLUŞTUR MODAL */}
        <Modal
          open={listeModal}
          onClose={() => setListeModal(false)}
          closeAfterTransition
        >
          <Fade in={listeModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 500 },
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                p: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  ✨ Yeni Özel Liste
                </Typography>

                <IconButton onClick={() => setListeModal(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              <TextField
                label="Liste Adı"
                fullWidth
                value={listeAd}
                onChange={(e) => setListeAd(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Açıklama (Opsiyonel)"
                fullWidth
                multiline
                rows={4}
                value={listeAciklama}
                onChange={(e) => setListeAciklama(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={listeOlustur}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #63408a 100%)",
                  },
                }}
              >
                Oluştur
              </Button>
            </Box>
          </Fade>
        </Modal>

        {/* LİSTE DÜZENLE MODAL */}
        <Modal
          open={listeDuzenModal}
          onClose={() => setListeDuzenModal(false)}
          closeAfterTransition
        >
          <Fade in={listeDuzenModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 500 },
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                p: 4,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  ✏️ Listeyi Düzenle
                </Typography>

                <IconButton
                  onClick={() => setListeDuzenModal(false)}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <TextField
                label="Liste Adı"
                fullWidth
                value={yeniAd}
                onChange={(e) => setYeniAd(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Açıklama"
                fullWidth
                multiline
                rows={4}
                value={yeniAciklama}
                onChange={(e) => setYeniAciklama(e.target.value)}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={listeGuncelle}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Kaydet
              </Button>
            </Box>
          </Fade>
        </Modal>

        {/* LİSTE SİLME MODAL */}
        <Modal
          open={listeSilModal}
          onClose={() => setListeSilModal(false)}
          closeAfterTransition
        >
          <Fade in={listeSilModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 400 },
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                p: 4,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "error.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <DeleteIcon sx={{ fontSize: 40, color: "error.main" }} />
              </Box>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Listeyi Silmek İstiyor Musun?
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Bu işlem geri alınamaz. Liste ve içindeki tüm içerikler
                silinecektir.
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => setListeSilModal(false)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  İptal
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={listeSil}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Evet, Sil
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* İÇERİK SİLME MODAL */}
        <Modal
          open={icerikSilModal}
          onClose={() => setIcerikSilModal(false)}
          closeAfterTransition
        >
          <Fade in={icerikSilModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 400 },
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
                p: 4,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "warning.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <CloseIcon sx={{ fontSize: 40, color: "warning.main" }} />
              </Box>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                İçeriği Kaldırmak İstiyor Musun?
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Bu içerik sadece bu özel listeden kaldırılacaktır.
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => setIcerikSilModal(false)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  İptal
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={icerikSil}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  Kaldır
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Container>
    </Box>
  );
}