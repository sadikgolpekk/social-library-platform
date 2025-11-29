from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
import requests

from .models import (
    Profil, Takip,
    Puan, Yorum, Kutuphane,
    OzelListe, OzelListeIcerik,
    Aktivite
)
from django.contrib.humanize.templatetags.humanize import naturaltime


# ------------------------------
# USER
# ------------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# ------------------------------
# PROFIL
# ------------------------------
class ProfilSerializer(serializers.ModelSerializer):
    kullanici_bilgi = UserSerializer(source="kullanici", read_only=True)

    takipci_sayisi = serializers.SerializerMethodField()
    takip_edilen_sayisi = serializers.SerializerMethodField()
    takip_edenler = serializers.SerializerMethodField()
    takip_ettikleri = serializers.SerializerMethodField()

    yorumlar = serializers.SerializerMethodField()
    puanlar = serializers.SerializerMethodField()
    ozel_listeler = serializers.SerializerMethodField()

    kullanici_takip_ediyor_mu = serializers.SerializerMethodField()

    # ⭐ KÜTÜPHANE TABS
    kutuphane_izlediklerim = serializers.SerializerMethodField()
    kutuphane_izlenecekler = serializers.SerializerMethodField()
    kutuphane_okuduklarim = serializers.SerializerMethodField()
    kutuphane_okunacaklar = serializers.SerializerMethodField()

    class Meta:
        model = Profil
        fields = [
            "id",
            "kullanici",
            "kullanici_bilgi",
            "avatar",
            "bio",

            "takipci_sayisi",
            "takip_edilen_sayisi",

            "takip_edenler",
            "takip_ettikleri",

            "yorumlar",
             "puanlar",    
            "ozel_listeler",

            # ⭐ Burada kütüphane sekmelerini ekledik
            "kutuphane_izlediklerim",
            "kutuphane_izlenecekler",
            "kutuphane_okuduklarim",
            "kutuphane_okunacaklar",

            "kullanici_takip_ediyor_mu",
        ]

        extra_kwargs = {
            "kullanici": {"read_only": True},
            "avatar": {"required": False},
            "bio": {"required": False},
        }

    # ------------------------------
    # Takip bilgileri
    # ------------------------------
    def get_takipci_sayisi(self, obj):
        return obj.kullanici.followers.count()

    def get_takip_edilen_sayisi(self, obj):
        return obj.kullanici.following.count()

    def get_takip_edenler(self, obj):
        return list(obj.kullanici.followers.values_list("takip_eden_id", flat=True))

    def get_takip_ettikleri(self, obj):
        return list(obj.kullanici.following.values_list("takip_edilen_id", flat=True))

    # ------------------------------
    # Yorum ve Özel listeler
    # ------------------------------
    def get_yorumlar(self, obj):
        qs = Yorum.objects.filter(kullanici=obj.kullanici).order_by("-tarih")
        liste = []

        for y in qs:
            detay = self._build_kart(obj.kullanici, y.content_type, y.content_id)

            liste.append({
                "id": y.id,
                "yorum": y.yorum,
                "tarih": y.tarih,
                "content_id": y.content_id,
                "content_type": y.content_type,
                "icerik": detay,   # ⭐ film/kitap bilgisi
            })

        return liste


    def get_ozel_listeler(self, obj):
        qs = OzelListe.objects.filter(kullanici=obj.kullanici)
        return OzelListeSerializer(qs, many=True).data
    
    # ---- PUANLAR ----
    def get_puanlar(self, obj):
        qs = Puan.objects.filter(kullanici=obj.kullanici).order_by("-tarih")
        liste = []

        for p in qs:
            detay = self._build_kart(obj.kullanici, p.content_type, p.content_id)

            liste.append({
                "id": p.id,
                "puan": p.puan,
                "tarih": p.tarih,
                "content_id": p.content_id,
                "content_type": p.content_type,
                "icerik": detay,   # ⭐ film/kitap bilgisi
            })

        return liste


    # ------------------------------
    # Kütüphane Sekmeleri
    # ------------------------------
    def get_kutuphane_izlediklerim(self, obj):
        return self._build_kutup_list(obj, "izledim")

    def get_kutuphane_izlenecekler(self, obj):
        return self._build_kutup_list(obj, "izlenecek")

    def get_kutuphane_okuduklarim(self, obj):
        return self._build_kutup_list(obj, "okudum")

    def get_kutuphane_okunacaklar(self, obj):
        return self._build_kutup_list(obj, "okunacak")

    def _build_kutup_list(self, obj, durum):
        qs = Kutuphane.objects.filter(kullanici=obj.kullanici, durum=durum)
        liste = []

        for k in qs:
            kart = self._build_kart(obj.kullanici, k.content_type, k.content_id)  # ←✔ BURASI
            if kart:
                liste.append(kart)

        return liste


    # ------------------------------
    # Kart oluşturucu (Kapak, başlık, yıl, puanlar)
    # ------------------------------
    def _build_kart(self, kullanici, content_type, content_id):
        TMDB_KEY = "c8d973e1530b37fd71b286ed8a9ca483"

        baslik = ""
        kapak = ""
        yil = ""

        # -------- FILM --------
        if content_type == "film":
            try:
                url = f"https://api.themoviedb.org/3/movie/{content_id}?api_key={TMDB_KEY}&language=tr-TR"
                data = requests.get(url).json()

                baslik = data.get("title") or ""
                poster_path = data.get("poster_path")
                kapak = (
                    f"https://image.tmdb.org/t/p/w500{poster_path}"
                    if poster_path else ""
                )
                yil = (data.get("release_date") or "")[:4]
            except:
                pass

        # -------- KITAP --------
        elif content_type == "kitap":
            try:
                url = f"https://www.googleapis.com/books/v1/volumes/{content_id}"
                data = requests.get(url).json()
                info = data.get("volumeInfo", {})

                baslik = info.get("title") or ""
                kapak = info.get("imageLinks", {}).get("thumbnail", "")
                yil = (info.get("publishedDate") or "")[:4]
            except:
                pass

        # Platform ortalama puanı
        puan_qs = Puan.objects.filter(content_id=content_id)
        ort = puan_qs.aggregate(Avg("puan"))["puan__avg"] or 0

        # Kullanıcının kendi puanı
        kendi = puan_qs.filter(kullanici=kullanici).first()
        user_puan = kendi.puan if kendi else None

        return {
            "id": content_id,
            "tur": content_type,
            "baslik": baslik,
            "kapak": kapak,
            "yil": yil,
            "platform_puani": round(float(ort), 2),
            "kullanici_puani": user_puan,
        }

    # ------------------------------
    # Kullanıcı takip ediyor mu?
    # ------------------------------
    def get_kullanici_takip_ediyor_mu(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        return Takip.objects.filter(
            takip_eden=request.user,
            takip_edilen=obj.kullanici
        ).exists()


# ------------------------------
# TAKİP
# ------------------------------
class TakipSerializer(serializers.ModelSerializer):
    takip_eden_bilgi = UserSerializer(source="takip_eden", read_only=True)
    takip_edilen_bilgi = UserSerializer(source="takip_edilen", read_only=True)

    class Meta:
        model = Takip
        fields = [
            "id",
            "takip_eden", "takip_edilen",
            "takip_eden_bilgi", "takip_edilen_bilgi",
            "tarih",
        ]


# ------------------------------
# PUAN
# ------------------------------
class PuanSerializer(serializers.ModelSerializer):
    kullanici_bilgi = UserSerializer(source="kullanici", read_only=True)

    class Meta:
        model = Puan
        fields = [
            "id",
            "kullanici", "kullanici_bilgi",
            "content_id", "content_type",
            "puan", "tarih",
        ]


# ------------------------------
# YORUM
# ------------------------------
class YorumSerializer(serializers.ModelSerializer):
    kullanici_bilgi = UserSerializer(source="kullanici", read_only=True)
    kullanici_username = serializers.CharField(source="kullanici.username", read_only=True)

    class Meta:
        model = Yorum
        fields = [
            "id",
            "kullanici", "kullanici_bilgi", "kullanici_username",
            "content_id", "content_type",
            "yorum", "tarih",
        ]


# ------------------------------
# KÜTÜPHANE
# ------------------------------
class KutuphaneSerializer(serializers.ModelSerializer):
    kullanici_bilgi = UserSerializer(source="kullanici", read_only=True)

    class Meta:
        model = Kutuphane
        fields = [
            "id",
            "kullanici", "kullanici_bilgi",
            "content_id", "content_type",
            "durum", "tarih",
        ]


# ------------------------------
# ÖZEL LİSTE İÇERİK
# ------------------------------
class OzelListeIcerikSerializer(serializers.ModelSerializer):
    class Meta:
        model = OzelListeIcerik
        fields = ["id", "liste", "content_id", "content_type", "tarih"]


class OzelListeSerializer(serializers.ModelSerializer):
    icerikler = serializers.SerializerMethodField()
    icerik_sayisi = serializers.SerializerMethodField()

    class Meta:
        model = OzelListe
        fields = ["id", "kullanici", "ad", "aciklama", "tarih", "icerikler", "icerik_sayisi"]

    def get_icerik_sayisi(self, obj):
        return obj.icerikler.count()

    def get_icerikler(self, obj):
        from django.db.models import Avg
        import requests

        TMDB_KEY = "c8d973e1530b37fd71b286ed8a9ca483"

        sonuc = []

        for item in obj.icerikler.all():
            content_id = item.content_id
            content_type = item.content_type

            baslik = ""
            kapak = ""
            yil = ""

            # Film
            if content_type == "film":
                try:
                    url = f"https://api.themoviedb.org/3/movie/{content_id}?api_key={TMDB_KEY}&language=tr-TR"
                    data = requests.get(url).json()
                    baslik = data.get("title", "")
                    poster = data.get("poster_path")
                    kapak = f"https://image.tmdb.org/t/p/w500{poster}" if poster else ""
                    yil = (data.get("release_date") or "")[:4]
                except:
                    pass

            # Kitap
            elif content_type == "kitap":
                try:
                    url = f"https://www.googleapis.com/books/v1/volumes/{content_id}"
                    data = requests.get(url).json()
                    info = data.get("volumeInfo", {})
                    baslik = info.get("title", "")
                    kapak = info.get("imageLinks", {}).get("thumbnail", "")
                    yil = (info.get("publishedDate") or "")[:4]
                except:
                    pass

            sonuc.append({
                "id": content_id,
                "tur": content_type,
                "baslik": baslik,
                "kapak": kapak,
                "yil": yil,
            })

        return sonuc




# ------------------------------
# AKTIVITE
# ------------------------------
class AktiviteSerializer(serializers.ModelSerializer):
    kullanici_adi = serializers.CharField(source="kullanici.username", read_only=True)
    kullanici_avatar = serializers.SerializerMethodField()
    poster = serializers.SerializerMethodField()
    hedef_kullanici = serializers.SerializerMethodField()
    tarih_nice = serializers.SerializerMethodField()
    content_info = serializers.SerializerMethodField()

    # ⭐ YENİ EKLEDİK
    like_sayisi = serializers.SerializerMethodField()
    yorum_sayisi = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Aktivite
        fields = [
            "id",
            "kullanici",
            "kullanici_adi",
            "kullanici_avatar",
            "hedef_kullanici",
            "content_id",
            "content_type",
            "aktivite_turu",
            "meta",
            "tarih",
            "tarih_nice",
            "poster",
            "content_info",

            # ⭐ YENİ ALANLAR
            "like_sayisi",
            "yorum_sayisi",
            "liked_by_me",
        ]

    # ------------------------------
    # İçerik kartı (film / kitap)
    # ------------------------------
    def get_content_info(self, obj):
        import requests
        TMDB_KEY = "c8d973e1530b37fd71b286ed8a9ca483"

        if not obj.content_id:
            return None

        # ---- Film ----
        if obj.content_type == "film":
            try:
                url = f"https://api.themoviedb.org/3/movie/{obj.content_id}?api_key={TMDB_KEY}&language=tr-TR"
                data = requests.get(url).json()

                return {
                    "baslik": data.get("title"),
                    "poster": f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get("poster_path") else "",
                    "puan": obj.meta.get("puan"),
                    "yorum": obj.meta.get("excerpt"),
                }
            except:
                return None

        # ---- Kitap ----
        if obj.content_type == "kitap":
            try:
                url = f"https://www.googleapis.com/books/v1/volumes/{obj.content_id}"
                data = requests.get(url).json()
                info = data.get("volumeInfo", {})

                return {
                    "baslik": info.get("title"),
                    "poster": info.get("imageLinks", {}).get("thumbnail", ""),
                    "puan": obj.meta.get("puan"),
                    "yorum": obj.meta.get("excerpt"),
                }
            except:
                return None

        return None

    # ------------------------------
    def get_kullanici_avatar(self, obj):
        try:
            return obj.kullanici.profil.avatar
        except:
            return None

    # ------------------------------
    def get_hedef_kullanici(self, obj):
        if obj.aktivite_turu != "follow":
            return None
        try:
            return {
                "id": obj.meta.get("target_id"),
                "username": obj.meta.get("target_username")
            }
        except:
            return None

    # ------------------------------
    def get_poster(self, obj):
        meta = obj.meta or {}
        return meta.get("poster")

    # ------------------------------
    def get_tarih_nice(self, obj):
        return naturaltime(obj.tarih)

    # ============================================================
    # ⭐⭐ YENİ: Beğeni & Yorum Sayısı Sistemleri ⭐⭐
    # ============================================================
    def get_like_sayisi(self, obj):
        from .models import AktiviteLike
        return AktiviteLike.objects.filter(aktivite=obj).count()

    def get_yorum_sayisi(self, obj):
        from .models import AktiviteYorum
        return AktiviteYorum.objects.filter(aktivite=obj).count()

    def get_liked_by_me(self, obj):
        from .models import AktiviteLike
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return AktiviteLike.objects.filter(aktivite=obj, kullanici=request.user).exists()
