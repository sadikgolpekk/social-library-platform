from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# -------------------- PROFİL --------------------
class Profil(models.Model):
    kullanici = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.TextField(blank=True, null=True)

    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.kullanici.username


# -------------------- TAKİP --------------------
class Takip(models.Model):
    takip_eden = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    takip_edilen = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    tarih = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('takip_eden', 'takip_edilen')

    def __str__(self):
        return f"{self.takip_eden.username} → {self.takip_edilen.username}"


# -------------------- PUAN --------------------
class Puan(models.Model):
    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    content_id = models.CharField(max_length=100)   # TMDB film ID veya Google Books ID
    content_type = models.CharField(max_length=10)  # film | kitap
    puan = models.IntegerField()
    tarih = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("kullanici", "content_id")

    def __str__(self):
        return f"{self.kullanici.username} → {self.content_id} ({self.puan})"


# -------------------- YORUM --------------------
class Yorum(models.Model):
    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    content_id = models.CharField(max_length=100)
    content_type = models.CharField(max_length=10)
    yorum = models.TextField()
    tarih = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.kullanici.username}: {self.yorum[:20]}"


# -------------------- KÜTÜPHANE DURUMU --------------------
class Kutuphane(models.Model):
    DURUMLAR = [
        ("izledim", "İzledim"),
        ("izlenecek", "İzlenecek"),
        ("okudum", "Okudum"),
        ("okunacak", "Okunacak"),
    ]

    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    content_id = models.CharField(max_length=100)
    content_type = models.CharField(max_length=10)
    durum = models.CharField(max_length=20, choices=DURUMLAR)
    tarih = models.DateTimeField(default=timezone.now)

    class Meta:
        # 🔥 ARTIK TEKİL ANAHTAR: kullanıcı + content_id
        unique_together = ("kullanici", "content_id")

    def __str__(self):
        return f"{self.kullanici.username} - {self.content_id} ({self.durum})"


# -------------------- ÖZEL LİSTE --------------------
class OzelListe(models.Model):
    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    ad = models.CharField(max_length=255)
    aciklama = models.TextField(blank=True, null=True)
    tarih = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.ad


class OzelListeIcerik(models.Model):
    liste = models.ForeignKey(OzelListe, on_delete=models.CASCADE, related_name="icerikler")
    content_id = models.CharField(max_length=100)
    content_type = models.CharField(max_length=10)
    tarih = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("liste", "content_id")


# -------------------- FEED AKTİVİTELERİ --------------------
class Aktivite(models.Model):
    AKTIVITE_TIPLERI = [
        ("rating", "Puanlama"),
        ("review", "Yorum"),
        ("library", "Kütüphane İşlemi"),
        ("follow", "Takip Etme"),
        ("list_add", "Özel Listeye Ekleme")
    ]

    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    content_id = models.CharField(max_length=100, blank=True, null=True)
    content_type = models.CharField(max_length=10, blank=True, null=True)
    aktivite_turu = models.CharField(max_length=20, choices=AKTIVITE_TIPLERI)
    meta = models.JSONField(default=dict)  # puan, yorum özeti, liste adı vs.
    tarih = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.kullanici.username} - {self.aktivite_turu}"




class AktiviteLike(models.Model):
    aktivite = models.ForeignKey(Aktivite, on_delete=models.CASCADE, related_name="likes")
    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    tarih = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("aktivite", "kullanici")

    def __str__(self):
        return f"{self.kullanici.username} → Aktivite {self.aktivite.id}"







class AktiviteYorum(models.Model):
    aktivite = models.ForeignKey(Aktivite, on_delete=models.CASCADE, related_name="yorumlar")
    kullanici = models.ForeignKey(User, on_delete=models.CASCADE)
    yorum = models.TextField()
    tarih = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.kullanici.username} → Aktivite {self.aktivite.id}"
