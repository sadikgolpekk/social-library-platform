import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Card,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useKimlik } from "../baglam/KimlikBaglami";

export default function Akis() {
  const { kullanici } = useKimlik();
  const userId = kullanici?.id;

  const [sayfa, setSayfa] = useState(1);
  const [toplam, setToplam] = useState(0);
  const [aktiviteler, setAktiviteler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const navigate = useNavigate();

  async function getir() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/feed/${userId}/?sayfa=${sayfa}`
      );
      const data = await res.json();

      setAktiviteler((prev) => [...prev, ...data.aktiviteler]);
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

  if (yukleniyor && aktiviteler.length === 0)
    return (
      <Box mt={10} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  // ❗ SADECE içerik kartı tıklanabilir olsun
  function icerikDetayGit(a, e) {
    e.stopPropagation();

    if (!a.content_id) return;

    navigate(`/detay/${a.content_type}/${a.content_id}`);
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Akış
      </Typography>

      {aktiviteler.map((a) => (
        <Card
          key={a.id}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
          }}
        >
          {/* ÜST BİLGİ */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar src={a.kullanici_avatar || ""} />

              <Box>
                {/* Kullanıcı adı */}
                <Typography
                  variant="subtitle1"
                  component={Link}
                  to={`/profil/${a.kullanici}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  {a.kullanici_adi}
                </Typography>

                {/* Aktivite açıklamaları */}
                {a.aktivite_turu === "review" && (
                  <Typography variant="body2" color="text.secondary">
                    bir yorum ekledi
                  </Typography>
                )}

                {a.aktivite_turu === "rating" && (
                  <Typography variant="body2" color="text.secondary">
                    bir içerik puanladı
                  </Typography>
                )}

               

                {/* FOLLOW */}
                {a.aktivite_turu === "follow" && (
                  <Typography variant="body2" color="text.secondary">
                    <b>{a.kullanici_adi}</b> →{" "}
                    <Link
                      to={`/profil/${a.meta.takip_edilen_id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: "bold",
                      }}
                    >
                      {a.meta.takip_edilen_username}
                    </Link>{" "}
                    kullanıcısını takip etti
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Tarih */}
            <Typography variant="caption" color="text.secondary">
              {a.tarih_nice}
            </Typography>
          </Box>

          {/* ------------------ İÇERİK GÖRÜNÜMÜ ------------------ */}
          {a.content_info && (
            <Box
              onClick={(e) => icerikDetayGit(a, e)}
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
                cursor: "pointer",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
              }}
            >
              {/* Poster */}
              <CardMedia
                component="img"
                image={a.content_info.poster}
                sx={{
                  width: 90,
                  height: 130,
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />

              <Box sx={{ flexGrow: 1 }}>
                {/* Başlık */}
                <Typography variant="h6" fontWeight="bold">
                  {a.content_info.baslik}
                </Typography>

                {/* Puan */}
                {a.aktivite_turu === "rating" && (
                  <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                    ⭐ {a.content_info.puan}/10
                  </Typography>
                )}

                {/* Yorum tırnak içinde */}
                {a.aktivite_turu === "review" && (
                  <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                    “{a.content_info.yorum}”
                  </Typography>
                )}

                {/* Kütüphane durumu */}
                {a.aktivite_turu === "library" && (
                  <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                    Durum: {a.meta.durum}
                  </Typography>
                )}

                {/* Liste adı */}
                {a.aktivite_turu === "list_add" && (
                  <Typography sx={{ mt: 1 }}>
                    Liste: <b>{a.meta.liste_adi}</b>
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* ------------------ ALTA BEĞEN / YORUM BAR ------------------ */}
          {a.content_info && (
            <Box
              sx={{
                display: "flex",
                gap: 3,
                mt: 2,
                borderTop: "1px solid #9993",
                pt: 1,
              }}
            >
              <Button size="small" onClick={(e) => e.stopPropagation()}>
                ❤️ Beğen
              </Button>
              <Button size="small" onClick={(e) => e.stopPropagation()}>
                💬 Yorum Yap (0)
              </Button>
            </Box>
          )}
        </Card>
      ))}

      {/* Daha fazla yükle */}
      {aktiviteler.length < toplam && (
        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={() => setSayfa((s) => s + 1)}>
            Daha Fazla Yükle
          </Button>
        </Box>
      )}
    </Box>
  );
}
