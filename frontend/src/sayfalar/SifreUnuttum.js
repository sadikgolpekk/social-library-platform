import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Fade,
  Alert,
  Link as MuiLink,
  useTheme,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from "@mui/material";
import { 
    EmailOutlined, 
    VpnKey, 
    Visibility, 
    VisibilityOff, 
    CheckCircle, 
    Cancel,
    TimerOutlined,
    LockReset
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

export default function SifreUnuttum() {
  const navigate = useNavigate();
  const theme = useTheme();

  // ADIMLAR: 1=Email, 2=Kod+Sayaç, 3=Yeni Şifre
  const [adim, setAdim] = useState(1);
  
  // FORM VERİLERİ
  const [email, setEmail] = useState("");
  const [kod, setKod] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  
  // SAYAÇ VE UI
  const [sayac, setSayac] = useState(300); // 300 Saniye = 5 Dakika
  const [gosterSifre, setGosterSifre] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  // --- CANLI SAYAÇ MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (adim === 2 && sayac > 0) {
      interval = setInterval(() => {
        setSayac((onceki) => onceki - 1);
      }, 1000);
    } else if (sayac === 0) {
      clearInterval(interval);
      setHata("Süre doldu! Lütfen tekrar kod isteyiniz.");
    }
    return () => clearInterval(interval);
  }, [adim, sayac]);

  // Saniyeyi Dakika:Saniye formatına çevir (örn: 04:59)
  const sureFormati = (saniye) => {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${dk < 10 ? "0" + dk : dk}:${sn < 10 ? "0" + sn : sn}`;
  };

  // Şifre Kuralları
  const checkPassword = (sifre) => ({
    uzunluk: sifre.length >= 8,
    buyuk: /[A-Z]/.test(sifre),
    kucuk: /[a-z]/.test(sifre),
    rakam: /[0-9]/.test(sifre),
    ozel: /[^A-Za-z0-9]/.test(sifre),
  });
  const sifreKurallari = checkPassword(yeniSifre);
  const isDark = theme.palette.mode === 'dark';

  // 1. ADIM: KOD GÖNDER
  const handleKodGonder = async (e) => {
    e.preventDefault();
    setHata(""); setMesaj(""); setYukleniyor(true);

    if (!email.trim()) { setHata("E-posta gerekli."); setYukleniyor(false); return; }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/kod-gonder/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMesaj(data.mesaj);
        setTimeout(() => {
            setMesaj("");
            setAdim(2); // Kod ekranına geç
            setSayac(300); // Sayacı başlat
        }, 1000);
      } else { setHata(data.hata); }
    } catch { setHata("Sunucu hatası."); }
    setYukleniyor(false);
  };

  // 2. ADIM: KODU DOĞRULA (Backend'e sor)
  const handleKodDogrula = async (e) => {
    e.preventDefault();
    setHata(""); setMesaj(""); setYukleniyor(true);

    if (sayac === 0) { setHata("Süre doldu, tekrar kod gönderin."); setYukleniyor(false); return; }

    try {
        const res = await fetch("http://127.0.0.1:8000/api/kod-dogrula/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, kod }),
        });
        const data = await res.json();
        
        if (res.ok) {
            setAdim(3); // Şifre ekranına geç
        } else {
            setHata(data.hata || "Kod hatalı.");
        }
    } catch { setHata("Sunucu hatası."); }
    setYukleniyor(false);
  };

  // 3. ADIM: ŞİFREYİ DEĞİŞTİR
  const handleSifreDegistir = async (e) => {
    e.preventDefault();
    setHata(""); setMesaj(""); setYukleniyor(true);

    if (yeniSifre !== yeniSifreTekrar) { setHata("Şifreler uyuşmuyor!"); setYukleniyor(false); return; }
    if (!Object.values(sifreKurallari).every(Boolean)) { setHata("Şifre kurallara uymuyor!"); setYukleniyor(false); return; }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sifre-degistir/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kod, yeni_sifre: yeniSifre }),
      });
      const data = await res.json();

      if (res.ok) {
        setMesaj("Şifre başarıyla değiştirildi! Yönlendiriliyorsunuz...");
        setTimeout(() => navigate("/"), 3000);
      } else { setHata(data.hata); }
    } catch { setHata("Sunucu hatası."); }
    setYukleniyor(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/kutuphane.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 2,
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={24}
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: isDark ? "rgba(30, 30, 30, 0.85)" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            textAlign: "center",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "none",
            color: theme.palette.text.primary,
          }}
        >
          {/* İKON DEĞİŞİMİ */}
          <Avatar
            sx={{
              bgcolor: "primary.main",
              mx: "auto",
              mb: 2,
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {adim === 1 && <EmailOutlined />}
            {adim === 2 && <TimerOutlined />}
            {adim === 3 && <LockReset />}
          </Avatar>

          <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
            {adim === 1 && "Şifremi Unuttum"}
            {adim === 2 && "Kodu Doğrula"}
            {adim === 3 && "Yeni Şifre"}
          </Typography>

          <form onSubmit={
              adim === 1 ? handleKodGonder : 
              adim === 2 ? handleKodDogrula : 
              handleSifreDegistir
            }>
            
            {/* --- ADIM 1: E-POSTA --- */}
            {adim === 1 && (
                <Fade in>
                    <Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Hesabınıza ait e-posta adresini giriniz. Size bir doğrulama kodu göndereceğiz.
                        </Typography>
                        <TextField
                            label="E-posta"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Box>
                </Fade>
            )}

            {/* --- ADIM 2: KOD + CANLI SAYAÇ --- */}
            {adim === 2 && (
                <Fade in>
                    <Box>
                        <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                           E-postanıza gönderilen 6 haneli kodu giriniz.
                        </Alert>
                        
                        {/* SAYAÇ GÖSTERGESİ */}
                        <Typography 
                            variant="h4" 
                            fontWeight="bold" 
                            color={sayac < 60 ? "error" : "primary"} 
                            sx={{ my: 2, fontFamily: 'monospace' }}
                        >
                            {sureFormati(sayac)}
                        </Typography>

                        <TextField
                            label="Doğrulama Kodu"
                            fullWidth
                            value={kod}
                            onChange={(e) => setKod(e.target.value)}
                            required
                            placeholder="123456"
                            inputProps={{ 
                                maxLength: 6, 
                                style: { letterSpacing: 8, textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' } 
                            }}
                        />
                    </Box>
                </Fade>
            )}

            {/* --- ADIM 3: YENİ ŞİFRE --- */}
            {adim === 3 && (
                <Fade in>
                    <Box>
                        <TextField
                            label="Yeni Şifre"
                            type={gosterSifre ? "text" : "password"}
                            fullWidth
                            margin="normal"
                            value={yeniSifre}
                            onChange={(e) => setYeniSifre(e.target.value)}
                            required
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setGosterSifre(!gosterSifre)}>
                                      {gosterSifre ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                            }}
                        />
                        
                        {/* KURALLAR */}
                        <Box sx={{ textAlign: "left", mt: 1, mb: 1 }}>
                            <List dense disablePadding>
                                {[
                                  { text: "En az 8 karakter", valid: sifreKurallari.uzunluk },
                                  { text: "Büyük harf (A-Z)", valid: sifreKurallari.buyuk },
                                  { text: "Küçük harf (a-z)", valid: sifreKurallari.kucuk },
                                  { text: "Rakam (0-9)", valid: sifreKurallari.rakam },
                                  { text: "Özel karakter (!@#$)", valid: sifreKurallari.ozel },
                                ].map((rule, index) => (
                                  <ListItem key={index} sx={{ py: 0 }}>
                                    {rule.valid ? <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} /> : <Cancel color="action" sx={{ mr: 1, fontSize: 16, opacity: 0.5 }} />}
                                    <ListItemText primary={rule.text} primaryTypographyProps={{ fontSize: 11, color: rule.valid ? "success.main" : "text.secondary" }} />
                                  </ListItem>
                                ))}
                            </List>
                        </Box>

                        <TextField
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={yeniSifreTekrar}
                            onChange={(e) => setYeniSifreTekrar(e.target.value)}
                            required
                        />
                    </Box>
                </Fade>
            )}

            {/* HATA / MESAJ KUTULARI */}
            {hata && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{hata}</Alert>}
            {mesaj && <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>{mesaj}</Alert>}

            {/* BUTON (Adıma göre değişir) */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={yukleniyor || (adim === 2 && sayac === 0)}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: 3,
                fontSize: '1rem',
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                "&:hover": { background: "linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)" },
              }}
            >
              {yukleniyor ? <CircularProgress size={24} color="inherit" /> : 
                 (adim === 1 ? "Kod Gönder" : 
                  adim === 2 ? "Kodu Onayla" : 
                  "Şifreyi Güncelle")
              }
            </Button>

            <Box mt={3}>
              <MuiLink
                component={Link}
                to="/"
                underline="hover"
                color="primary"
                fontWeight="500"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
              >
                <span>←</span> Giriş Sayfasına Dön
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}