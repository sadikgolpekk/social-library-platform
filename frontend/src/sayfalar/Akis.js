import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Card,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Collapse,
  Divider,
  Paper,
  IconButton,
  Chip,
  alpha,
  Fade,
  Link as MuiLink
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  ExpandMore,
  PersonAdd,
  TrendingUp,
  Send,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useKimlik } from "../baglam/KimlikBaglami";

export default function Akis() {
  const { kullanici } = useKimlik();
  const userId = kullanici?.id;

  const [sayfa, setSayfa] = useState(1);
  const [toplam, setToplam] = useState(0);
  const [aktiviteler, setAktiviteler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // 🔥 Yorum popup state
  const [yorumAc, setYorumAc] = useState(false);
  const [yorumMetin, setYorumMetin] = useState("");
  const [aktifAktiviteId, setAktifAktiviteId] = useState(null);

  // 🔥 Yorumları açma/kapama state (her aktivite için)
  const [acikYorumlar, setAcikYorumlar] = useState({});
  const [yorumlar, setYorumlar] = useState({});
  const [yorumYukleniyor, setYorumYukleniyor] = useState({});

  const navigate = useNavigate();

  async function getir() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/feed/${userId}/?sayfa=${sayfa}`
      );
      const data = await res.json();

      const temiz = data.aktiviteler.map((a) => ({
        ...a,
        like_sayisi: a.like_sayisi ?? 0,
        yorum_sayisi: a.yorum_sayisi ?? 0,
        liked_by_me: a.liked_by_me ?? false,
      }));

      setAktiviteler((prev) => [...prev, ...temiz]);
      setToplam(data.toplam);
    } catch (e) {
      console.error("Akış yüklenemedi:", e);
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    getir();
  }, [sayfa]);

  // 🔥 Yorumları getir
  async function yorumlariGetir(aktiviteId) {
    if (yorumlar[aktiviteId]) return; // Zaten yüklenmişse tekrar getirme

    setYorumYukleniyor((prev) => ({ ...prev, [aktiviteId]: true }));

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/aktivite-yorumlar/${aktiviteId}/`
      );
      const data = await res.json();
      setYorumlar((prev) => ({ ...prev, [aktiviteId]: data.yorumlar || [] }));
    } catch (e) {
      console.error("Yorumlar yüklenemedi:", e);
    } finally {
      setYorumYukleniyor((prev) => ({ ...prev, [aktiviteId]: false }));
    }
  }

  // 🔥 Yorumları aç/kapat
  function yorumlariToggle(aktiviteId) {
    const yeniDurum = !acikYorumlar[aktiviteId];
    setAcikYorumlar((prev) => ({ ...prev, [aktiviteId]: yeniDurum }));

    if (yeniDurum) {
      yorumlariGetir(aktiviteId);
    }
  }

  if (yukleniyor && aktiviteler.length === 0)
    return (
      <Box mt={10} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  // 🎨 BOŞ DURUM - Kimseyi takip etmiyorsa
  if (!yukleniyor && aktiviteler.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Fade in timeout={800}>
          <Paper
            elevation={8}
            sx={{
              maxWidth: 600,
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(50,50,50,0.9) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                margin: "0 auto 24px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              }}
            >
              <TrendingUp sx={{ fontSize: 60, color: "white" }} />
            </Box>

            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
              }}
            >
              Akışın Henüz Boş
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
              Arkadaşlarını takip ederek onların aktivitelerini görebilir, yeni içerikler
              keşfedebilir ve etkileşimde bulunabilirsin! 🎬📚
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAdd />}
                onClick={() => navigate("/kullanici-ara")}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 24px rgba(102, 126, 234, 0.5)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Kullanıcı Ara
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/arama")}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                İçerik Keşfet
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Box>
    );
  }

  function icerikDetayGit(a, e) {
    e.stopPropagation();
    if (!a.content_id) return;
    navigate(`/detay/${a.content_type}/${a.content_id}`);
  }

  async function aktiviteBegen(a, e) {
    e.stopPropagation();

    const res = await fetch("http://127.0.0.1:8000/api/aktivite-like/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kullanici: userId,
        aktivite: a.id,
      }),
    });

    const data = await res.json();

    setAktiviteler((prev) =>
      prev.map((x) =>
        x.id === a.id
          ? {
              ...x,
              liked_by_me: data.liked,
              like_sayisi: x.like_sayisi + (data.liked ? 1 : -1),
            }
          : x
      )
    );
  }

  function yorumAcPopup(a, e) {
    e.stopPropagation();
    setAktifAktiviteId(a.id);
    setYorumMetin("");
    setYorumAc(true);
  }

  async function yorumGonder() {
    const res = await fetch("http://127.0.0.1:8000/api/aktivite-yorum/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kullanici: userId,
        aktivite: aktifAktiviteId,
        yorum: yorumMetin,
      }),
    });

    if (res.ok) {
      const yeniYorum = await res.json();

      // Yorum sayısını arttır
      setAktiviteler((prev) =>
        prev.map((a) =>
          a.id === aktifAktiviteId
            ? { ...a, yorum_sayisi: a.yorum_sayisi + 1 }
            : a
        )
      );

      // Yorumlar listesine ekle (eğer açıksa)
      if (acikYorumlar[aktifAktiviteId]) {
        setYorumlar((prev) => ({
          ...prev,
          [aktifAktiviteId]: [
            ...(prev[aktifAktiviteId] || []),
            {
              kullanici_adi: kullanici?.username || "Sen",
              kullanici_avatar: kullanici?.avatar || "",
              yorum: yorumMetin,
              tarih: "Az önce",
            },
          ],
        }));
      }
    }

    setYorumAc(false);
  }

 // --- EKLENECEK KISIM BAŞLANGIÇ ---
  
  // Yorum metnini düzenleyen fonksiyon (DÜZELTİLMİŞ)
  const renderYorumMetni = (metin, a) => {
    const MAX_KARAKTER = 20;
    if (!metin) return null;

    const uzun = metin.length > MAX_KARAKTER;
    const gosterilecekMetin = uzun ? metin.substring(0, MAX_KARAKTER) + "..." : metin;

    return (
      <Box>
        <Typography 
            variant="body2" 
            sx={{ 
                fontStyle: "italic", 
                color: "text.secondary",
                wordBreak: "break-word", // Kelimeleri satır sonuna gelince böl
                whiteSpace: "pre-wrap",  // Satır boşluklarını koru ama taşma yapma
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}
        >
          "{gosterilecekMetin}"
          
          {uzun && (
            <MuiLink
                component="button"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/detay/${a.content_type}/${a.content_id}`);
                }}
                sx={{ 
                    ml: 1, 
                    fontWeight: 'bold', 
                    fontSize: '0.85rem', 
                    textDecoration: 'none',
                    cursor: 'pointer',
                    verticalAlign: 'baseline',
                    color: 'primary.main'
                }}
            >
                daha fazlasını oku
            </MuiLink>
          )}
        </Typography>
      </Box>
    );
  };
  // --- EKLENECEK KISIM BİTİŞ ---






  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: "auto", px: 3 }}>
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(30, 30, 30, 0.8)"
                : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Akış
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Takip ettiğin kişilerin aktivitelerini gör
              </Typography>
            </Box>
          </Box>
        </Paper>

        {aktiviteler.map((a) => (
          <Fade in key={a.id} timeout={400}>
            <Card
              sx={{
                mb: 3,
                borderRadius: 4,
                overflow: "hidden",
                transition: "all 0.3s ease",
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                "&:hover": {
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 12px 40px rgba(255,255,255,0.1)"
                      : "0 12px 40px rgba(0,0,0,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              {/* ÜST BİLGİ */}
              <Box sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Avatar
                      src={a.kullanici_avatar || ""}
                      sx={{
                        width: 48,
                        height: 48,
                        border: "2px solid",
                        borderColor: "primary.main",
                      }}
                    />

                    <Box>
                      <Typography
                        variant="subtitle1"
                        component={Link}
                        to={`/profil/${a.kullanici}`}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                          fontWeight: 700,
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {a.kullanici_adi}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5 }}>
                        {a.aktivite_turu === "review" && (
                          <Chip
                            label="Yorum ekledi"
                            size="small"
                            color="info"
                            sx={{ fontSize: "0.75rem", height: 24 }}
                          />
                        )}

                        {a.aktivite_turu === "rating" && (
                          <Chip
                            label="Puanladı"
                            size="small"
                            color="warning"
                            sx={{ fontSize: "0.75rem", height: 24 }}
                          />
                        )}

                        {a.aktivite_turu === "follow" && (
                          <Chip
                            label="Takip etti"
                            size="small"
                            color="success"
                            sx={{ fontSize: "0.75rem", height: 24 }}
                          />
                        )}

                        {a.aktivite_turu === "library" && (
                          <Chip
                            label="Kütüphaneye ekledi"
                            size="small"
                            color="secondary"
                            sx={{ fontSize: "0.75rem", height: 24 }}
                          />
                        )}

                        {a.aktivite_turu === "list_add" && (
                          <Chip
                            label="Listeye ekledi"
                            size="small"
                            color="primary"
                            sx={{ fontSize: "0.75rem", height: 24 }}
                          />
                        )}

                        <Typography variant="caption" color="text.secondary">
                          • {a.tarih_nice}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Follow aktivitesi için özel bilgi */}
                {a.aktivite_turu === "follow" && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                    <Typography variant="body2">
                      <Link
                        to={`/profil/${a.meta.takip_edilen_id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          textDecoration: "none",
                          color: "#1976d2",
                          fontWeight: "bold",
                        }}
                      >
                        @{a.meta.takip_edilen_username}
                      </Link>{" "}
                      kullanıcısını takip etti
                    </Typography>
                  </Box>
                )}

                {/* İÇERİK KARTI */}
                {a.content_info && (
                  <Box
                    onClick={(e) => icerikDetayGit(a, e)}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 2,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "background.default",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderColor: "primary.main",
                        transform: "scale(1.01)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={
                        a.content_info.poster ||
                        "https://via.placeholder.com/90x130?text=Görsel+Yok"
                      }
                      sx={{
                        width: 90,
                        height: 130,
                        borderRadius: 2,
                        objectFit: "cover",
                        boxShadow: 2,
                      }}
                    />

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {a.content_info.baslik}
                      </Typography>

                      {a.aktivite_turu === "rating" && (
                        <Chip
                          label={`⭐ ${a.content_info.puan}/10`}
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      )}

                      {/* --- YORUM ALANI (GÜNCELLENMİŞ) --- */}
                    {a.aktivite_turu === "review" && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: "action.hover",
                          borderRadius: 2,
                          borderLeft: "4px solid", // Çizgiyi biraz kalınlaştırdık
                          borderColor: "primary.main",
                          maxWidth: "100%", // Genişliği sınırla
                          overflow: "hidden" // Taşanları gizle
                        }}
                      >
                        {/* Artık Typography'i fonksiyonun içinde tanımladık, direkt çağırıyoruz */}
                        {renderYorumMetni(a.content_info.yorum, a)}
                      </Paper>
                    )}

                      {a.aktivite_turu === "library" && (
                        <Chip
                          label={`Durum: ${a.meta.durum}`}
                          color="secondary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}

                      {a.aktivite_turu === "list_add" && (
                        <Chip
                          label={`📝 ${a.meta.liste_adi}`}
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* BEĞEN / YORUM BAR */}
              {a.content_info && (
                <>
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 1.5,
                      justifyContent: "space-around",
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={
                        a.liked_by_me ? (
                          <Favorite sx={{ color: "error.main" }} />
                        ) : (
                          <FavoriteBorder />
                        )
                      }
                      onClick={(e) => aktiviteBegen(a, e)}
                      sx={{
                        flex: 1,
                        fontWeight: 600,
                        textTransform: "none",
                        color: a.liked_by_me ? "error.main" : "text.secondary",
                        "&:hover": {
                          bgcolor: a.liked_by_me
                            ? alpha("#f44336", 0.1)
                            : "action.hover",
                        },
                      }}
                    >
                      {a.liked_by_me ? "Beğenildi" : "Beğen"} ({a.like_sayisi})
                    </Button>

                    <Button
                      size="small"
                      startIcon={<ChatBubbleOutline />}
                      onClick={(e) => yorumAcPopup(a, e)}
                      sx={{
                        flex: 1,
                        fontWeight: 600,
                        textTransform: "none",
                        color: "text.secondary",
                      }}
                    >
                      Yorum Yap ({a.yorum_sayisi})
                    </Button>

                    <IconButton
                      size="small"
                      onClick={() => yorumlariToggle(a.id)}
                      sx={{
                        transform: acikYorumlar[a.id] ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <ExpandMore />
                    </IconButton>
                  </Box>

                  {/* YORUMLAR KISMI */}
                  <Collapse in={acikYorumlar[a.id]} timeout={300}>
                    <Divider />
                    <Box sx={{ p: 2, bgcolor: "background.default" }}>
                      {yorumYukleniyor[a.id] ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : yorumlar[a.id]?.length > 0 ? (
                        yorumlar[a.id].map((yorum, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              mb: 2,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Avatar
                              src={yorum.kullanici_avatar || ""}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 0.5,
                                }}
                              >
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {yorum.kullanici_adi}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {yorum.tarih}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {yorum.yorum}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          sx={{ py: 2 }}
                        >
                          Henüz yorum yapılmamış. İlk yorumu sen yap! 💬
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </>
              )}
            </Card>
          </Fade>
        ))}

        {/* Daha fazla yükle */}
        {aktiviteler.length < toplam && (
          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setSayfa((s) => s + 1)}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 24px rgba(102, 126, 234, 0.4)",
                },
              }}
            >
              Daha Fazla Yükle
            </Button>
          </Box>
        )}

        {/* YORUM POPUP */}
        <Dialog
          open={yorumAc}
          onClose={() => setYorumAc(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
            Yorum Yap
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={yorumMetin}
              onChange={(e) => setYorumMetin(e.target.value)}
              placeholder="Düşüncelerini paylaş..."
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setYorumAc(false)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={yorumGonder}
              disabled={!yorumMetin.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
              }}
            >
              Paylaş
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}