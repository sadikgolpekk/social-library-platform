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
} from "@mui/material";
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

  // Düzenleme modları
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");

  // Özel liste oluşturma
  const [listeModal, setListeModal] = useState(false);
  const [listeAd, setListeAd] = useState("");
  const [listeAciklama, setListeAciklama] = useState("");

  // Tabs
  const [tab, setTab] = useState(0);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    acik: false,
    mesaj: "",
    tip: "success",
  });

  // ---------------------------------------------------------
  // PROFIL GETIR
  // ---------------------------------------------------------
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
      <Box mt={10} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!profil) return <Typography>Profil bulunamadı.</Typography>;

  const kendiProfili = aktifId === profil.kullanici;

  // ---------------------------------------------------------
  // BASE64 DÖNÜŞTÜRÜCÜ
  // ---------------------------------------------------------
  function base64eDonustur(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ---------------------------------------------------------
  // AVATAR: Dosya seçme
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // AVATAR: Drag & Drop
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // TAKIP ET
  // ---------------------------------------------------------
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

        setSnackbar({
          acik: true,
          mesaj: "Kullanıcıyı takip etmeye başladın.",
          tip: "success",
        });
      } else {
        setSnackbar({
          acik: true,
          mesaj: "Takip başarısız.",
          tip: "error",
        });
      }
    } catch (err) {
      console.error("Takip hatası:", err);
      setSnackbar({
        acik: true,
        mesaj: "Takip işlemi sırasında hata.",
        tip: "error",
      });
    }
  }

  async function takipBirak() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/takip-sil/?takip_eden=${aktifId}&takip_edilen=${profil.kullanici}`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        setTakipEdiyorMu(false);

        setSnackbar({
          acik: true,
          mesaj: "Kullanıcı takipten çıkarıldı.",
          tip: "success",
        });
      } else {
        setSnackbar({
          acik: true,
          mesaj: "Takipten çıkarılamadı.",
          tip: "error",
        });
      }
    } catch (err) {
      console.error("Takip bırak hata:", err);
      setSnackbar({
        acik: true,
        mesaj: "Takip bırakılırken bir hata oluştu.",
        tip: "error",
      });
    }
  }

  // ---------------------------------------------------------
  // PROFIL GÜNCELLE
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // YENİ ÖZEL LİSTE OLUŞTUR
  // ---------------------------------------------------------
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* --------------------------------------------------------- */}
      {/* PROFIL BAŞLIK */}
      {/* --------------------------------------------------------- */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
        <Avatar
          src={avatar || ""}
          sx={{ width: 120, height: 120, border: "3px solid #1976d2" }}
        />

        <Box>
          <Typography variant="h4" fontWeight="bold">
            {profil.kullanici_bilgi.username}
          </Typography>

          {!duzenlemeModu && (
            <Typography variant="body1" color="text.secondary">
              {profil.bio || "Bio eklenmemiş."}
            </Typography>
          )}

          {/* ----------------------------------------------------- */}
          {/* DUZENLEME MODU */}
          {/* ----------------------------------------------------- */}
          {duzenlemeModu && (
            <>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "2px dashed gray",
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#1976d2" },
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={dosyaSurukle}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Profil Fotoğrafı (Sürükle & Bırak)
                </Typography>

                <Avatar
                  src={avatar || ""}
                  sx={{
                    width: 130,
                    height: 130,
                    mx: "auto",
                    mb: 2,
                    border: "3px solid #1976d2",
                  }}
                />

                <Button variant="contained" component="label">
                  Dosya Seç
                  <input type="file" hidden accept="image/*" onChange={dosyaSec} />
                </Button>
              </Box>

              <TextField
                label="Biyografi"
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2 }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              <Button variant="contained" sx={{ mt: 2 }} onClick={profilKaydet}>
                Kaydet
              </Button>

              <Button
                variant="text"
                sx={{ mt: 1 }}
                onClick={() => setDuzenlemeModu(false)}
              >
                İptal
              </Button>
            </>
          )}

          {/* ----------------------------------------------------- */}
          {/* TAKIP / TAKIPCI */}
          {/* ----------------------------------------------------- */}
          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Typography>
              <b>{profil.takipci_sayisi || 0}</b> takipçi
            </Typography>

            <Typography>
              <b>{profil.takip_edilen_sayisi || 0}</b> takip
            </Typography>
          </Box>

          {/* ----------------------------------------------------- */}
          {/* PROFIL SAHIBI */}
          {/* ----------------------------------------------------- */}
          {kendiProfili && !duzenlemeModu && (
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => setDuzenlemeModu(true)}>
                Profili Düzenle
              </Button>

              <Button variant="contained" onClick={() => setListeModal(true)}>
                Yeni Özel Liste Oluştur
              </Button>
            </Box>
          )}

          {/* ----------------------------------------------------- */}
          {/* BAŞKASININ PROFİLİ */}
          {/* ----------------------------------------------------- */}
          {!kendiProfili && (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={takipEdiyorMu ? takipBirak : takipEt}
            >
              {takipEdiyorMu ? "Takipten Çık" : "Takip Et"}
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* --------------------------------------------------------- */}
      {/* TABS */}
      {/* --------------------------------------------------------- */}
      {kendiProfili && (
        <Tabs value={tab} onChange={(e, y) => setTab(y)} sx={{ mb: 3 }}>
          <Tab label="İzlediklerim" />
          <Tab label="İzlenecekler" />
          <Tab label="Okuduklarım" />
          <Tab label="Okunacaklar" />
        </Tabs>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB İÇERİKLERİ */}
      {/* --------------------------------------------------------- */}
      {kendiProfili && (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {(tab === 0 && profil.kutuphane_izlediklerim) ||
          (tab === 1 && profil.kutuphane_izlenecekler) ||
          (tab === 2 && profil.kutuphane_okuduklarim) ||
          (tab === 3 && profil.kutuphane_okunacaklar)
            ? (
                (tab === 0
                  ? profil.kutuphane_izlediklerim
                  : tab === 1
                  ? profil.kutuphane_izlenecekler
                  : tab === 2
                  ? profil.kutuphane_okuduklarim
                  : profil.kutuphane_okunacaklar
                ).map((icerik, idx) => (
                  <Grid key={idx} item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <img
                      src={icerik.kapak}
                      alt=""
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        marginBottom: 10,
                        cursor: "pointer"
                      }}
                      onClick={() => navigate(`/detay/${icerik.tur}/${icerik.id}`)}
                    />

                        <Typography variant="h6">{icerik.baslik}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {icerik.yil}
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          ⭐ Platform: {icerik.platform_puani}
                        </Typography>
                        <Typography>
                          🟦 Senin puanın: {icerik.kullanici_puani ?? "-"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )
            : null}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      {/* --------------------------------------------------------- */}
{/* YORUMLAR */}
{/* --------------------------------------------------------- */}
<Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
  Yorumlar
</Typography>

{profil.yorumlar?.length > 0 ? (
  profil.yorumlar.map((y) => (
    <Box
      key={y.id}
      sx={{
        mb: 3,
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/detay/${y.content_type}/${y.content_id}`)}
    >
      {/* Poster */}
      <img
        src={y.icerik.kapak}
        alt={y.icerik.baslik}
        style={{
          width: 70,
          height: 100,
          borderRadius: 4,
          objectFit: "cover",
        }}
      />

      {/* Sağ taraf */}
      <Box>
        <Typography fontWeight="bold">{y.icerik.baslik}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {y.icerik.yil}
        </Typography>

        <Typography sx={{ mt: 1 }}>{y.yorum}</Typography>
      </Box>
    </Box>
  ))
) : (
  <Typography>Henüz yorum yok.</Typography>
)}


      <Divider sx={{ my: 4 }} />


     <Divider sx={{ my: 4 }} />

{/* --------------------------------------------------------- */}
{/* PUANLAR */}
{/* --------------------------------------------------------- */}
<Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
  Verdiğim Puanlar
</Typography>

{profil.puanlar?.length > 0 ? (
  profil.puanlar.map((p) => (
    <Box
      key={p.id}
      sx={{
        mb: 3,
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/detay/${p.content_type}/${p.content_id}`)}
    >
      {/* Poster */}
      <img
        src={p.icerik.kapak}
        alt={p.icerik.baslik}
        style={{
          width: 70,
          height: 100,
          borderRadius: 4,
          objectFit: "cover",
        }}
      />

      {/* Sağ taraf */}
      <Box>
        <Typography fontWeight="bold">{p.icerik.baslik}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {p.icerik.yil}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          ⭐ {p.puan}
        </Typography>
      </Box>
    </Box>
  ))
) : (
  <Typography>Henüz puan verilmemiş.</Typography>
)}


<Divider sx={{ my: 4 }} />








      {/* --------------------------------------------------------- */}
      {/* ÖZEL LİSTELER */}
      {/* --------------------------------------------------------- */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Özel Listeler
      </Typography>

      <Grid container spacing={3}>
        {profil.ozel_listeler?.map((l) => (
          <Grid item xs={12} sm={6} md={4} key={l.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6">{l.ad}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {l.aciklama || "Açıklama yok."}
                </Typography>

                <Grid container spacing={2} sx={{mt:1}}>
  {l.icerikler.map((ic) => (
    <Grid item xs={6} key={ic.id}>
      <Card
      sx={{ p:1, borderRadius:2, cursor:"pointer" }}
      onClick={() => navigate(`/detay/${ic.tur}/${ic.id}`)}
    >
        <img
          src={ic.kapak}
          alt=""
          style={{width:"100%", borderRadius:10, marginBottom:8}}
        />
        <Typography variant="body1" fontWeight="bold">
          {ic.baslik}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {ic.yil}
        </Typography>
      </Card>
    </Grid>
  ))}
</Grid>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* --------------------------------------------------------- */}
      {/* SNACKBAR */}
      {/* --------------------------------------------------------- */}
      <Snackbar
        open={snackbar.acik}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, acik: false })}
      >
        <Alert
          severity={snackbar.tip}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, acik: false })}
        >
          {snackbar.mesaj}
        </Alert>
      </Snackbar>

      {/* --------------------------------------------------------- */}
      {/* LİSTE OLUŞTUR MODAL */}
      {/* --------------------------------------------------------- */}
      <Modal open={listeModal} onClose={() => setListeModal(false)}>
        <Box
          sx={{
            width: 400,
            p: 4,
            bgcolor: "background.paper",
            borderRadius: 3,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Yeni Özel Liste
          </Typography>

          <TextField
            label="Liste Adı"
            fullWidth
            value={listeAd}
            onChange={(e) => setListeAd(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Açıklama"
            fullWidth
            multiline
            rows={3}
            value={listeAciklama}
            onChange={(e) => setListeAciklama(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={listeOlustur}
          >
            Oluştur
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
