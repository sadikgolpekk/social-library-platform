from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from django.core.mail import send_mail
from django.db.models import Q, Avg
from django.utils import timezone
from django.db.models import Count, Avg, Q


import requests
import json

from .models import (
    Profil, Takip,
    Puan, Yorum, Kutuphane,
    OzelListe, OzelListeIcerik,
    Aktivite
)
from .serializers import (
    UserSerializer, ProfilSerializer, TakipSerializer,
    PuanSerializer, YorumSerializer, KutuphaneSerializer,
    OzelListeSerializer, OzelListeIcerikSerializer,
    AktiviteSerializer,
)

from .utils import log_yaz  # sende vardı, kullanmaya devam ediyorum

TMDB_KEY = "c8d973e1530b37fd71b286ed8a9ca483"


# ------------------------------------------------------------
# 🔹 Standart ViewSet’ler
# ------------------------------------------------------------

class KullaniciGorunum(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class ProfilGorunum(viewsets.ModelViewSet):
    queryset = Profil.objects.all().select_related("kullanici")
    serializer_class = ProfilSerializer
    permission_classes = [permissions.AllowAny]


class TakipGorunum(viewsets.ModelViewSet):
    queryset = Takip.objects.all().select_related("takip_eden", "takip_edilen")
    serializer_class = TakipSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        takip = serializer.save()

        # Takip edilen kişinin username ve avatarını alıyoruz
        hedef = takip.takip_edilen
        hedef_profil = getattr(hedef, "profil", None)

        Aktivite.objects.create(
            kullanici=takip.takip_eden,
            aktivite_turu="follow",
            content_id=None,
            content_type=None,
            meta={
                "takip_edilen_id": hedef.id,
                "takip_edilen_username": hedef.username,
                "takip_edilen_avatar": hedef_profil.avatar if hedef_profil else None,
            },
        )




    def destroy(self, request, *args, **kwargs):
        takip = self.get_object()

        Aktivite.objects.create(
            kullanici=takip.takip_eden,
            aktivite_turu="unfollow",
            meta={
                "target_id": takip.takip_edilen.id,
                "target_username": takip.takip_edilen.username,
            },
        )

        return super().destroy(request, *args, **kwargs)



class PuanGorunum(viewsets.ModelViewSet):
    queryset = Puan.objects.all().select_related("kullanici")
    serializer_class = PuanSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get("kullanici")
        content_id = request.data.get("content_id")
        content_type = request.data.get("content_type")
        puan_deger = request.data.get("puan")

        if not all([user_id, content_id, content_type, puan_deger]):
            return Response({"hata": "kullanici, content_id, content_type, puan zorunlu"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"hata": "Kullanıcı bulunamadı"}, status=404)

        puan_obj, created = Puan.objects.update_or_create(
            kullanici=user,
            content_id=content_id,
            defaults={
                "content_type": content_type,
                "puan": puan_deger,
                "tarih": timezone.now(),
            }
        )

        # Aktivite: rating
        Aktivite.objects.update_or_create(
            kullanici=user,
            content_id=content_id,
            content_type=content_type,
            aktivite_turu="rating",
            defaults={
                "meta": {"puan": puan_deger},
                "tarih": timezone.now(),
            }
        )

        serializer = self.get_serializer(puan_obj)
        return Response(serializer.data, status=201)


class YorumGorunum(viewsets.ModelViewSet):
    queryset = Yorum.objects.all().select_related("kullanici").order_by("-tarih")
    serializer_class = YorumSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get("kullanici")
        content_id = request.data.get("content_id")
        content_type = request.data.get("content_type")
        yorum_metin = request.data.get("yorum")

        if not all([user_id, content_id, content_type, yorum_metin]):
            return Response({"hata": "kullanici, content_id, content_type, yorum zorunlu"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"hata": "Kullanıcı bulunamadı"}, status=404)

        yorum = Yorum.objects.create(
            kullanici=user,
            content_id=content_id,
            content_type=content_type,
            yorum=yorum_metin,
        )

        # Aktivite: review
        excerpt = yorum_metin[:200]
        Aktivite.objects.create(
            kullanici=user,
            content_id=content_id,
            content_type=content_type,
            aktivite_turu="review",
            meta={"excerpt": excerpt},
        )

        serializer = self.get_serializer(yorum)
        return Response(serializer.data, status=201)


class KutuphaneGorunum(viewsets.ModelViewSet):
    queryset = Kutuphane.objects.all().select_related("kullanici")
    serializer_class = KutuphaneSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get("kullanici")
        content_id = request.data.get("content_id")
        content_type = request.data.get("content_type")
        durum = request.data.get("durum")

        if not all([user_id, content_id, content_type, durum]):
            return Response({"hata": "kullanici, content_id, content_type, durum zorunlu"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"hata": "Kullanıcı bulunamadı"}, status=404)

        # 🔥 Doğru kullanım → durum artık defaults içinde
        kutu, created = Kutuphane.objects.update_or_create(
            kullanici=user,
            content_id=content_id,
            defaults={
                "content_type": content_type,
                "durum": durum,
                "tarih": timezone.now()
            }
        )

        # Aktivite kaydı
        Aktivite.objects.create(
            kullanici=user,
            content_id=content_id,
            content_type=content_type,
            aktivite_turu="library",
            meta={"durum": durum},
        )

        serializer = self.get_serializer(kutu)
        return Response(serializer.data, status=201)



class OzelListeGorunum(viewsets.ModelViewSet):
    serializer_class = OzelListeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # PATCH, DELETE, PUT sırasında tüm listeleri izin ver
        if self.request.method in ["PATCH", "DELETE", "PUT"]:
            return OzelListe.objects.all()

        kullanici = self.request.GET.get("kullanici")
        if not kullanici:
            return OzelListe.objects.none()

        return OzelListe.objects.filter(kullanici_id=kullanici)



class OzelListeIcerikGorunum(viewsets.ModelViewSet):
    queryset = OzelListeIcerik.objects.all().select_related("liste")
    serializer_class = OzelListeIcerikSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        liste_id = request.data.get("liste")
        content_id = request.data.get("content_id")
        content_type = request.data.get("content_type")

        if not all([liste_id, content_id, content_type]):
            return Response({"hata": "liste, content_id, content_type zorunlu"}, status=400)

        try:
            liste = OzelListe.objects.select_related("kullanici").get(id=liste_id)
        except OzelListe.DoesNotExist:
            return Response({"hata": "Liste bulunamadı"}, status=404)

        obj, created = OzelListeIcerik.objects.get_or_create(
            liste=liste,
            content_id=content_id,
            defaults={"content_type": content_type}
        )

        # Aktivite: list_add
        Aktivite.objects.create(
            kullanici=liste.kullanici,
            content_id=content_id,
            content_type=content_type,
            aktivite_turu="list_add",
            meta={"liste_adi": liste.ad},
        )

        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=201)


class AktiviteGorunum(viewsets.ReadOnlyModelViewSet):
    queryset = Aktivite.objects.all().select_related("kullanici").order_by("-tarih")
    serializer_class = AktiviteSerializer
    permission_classes = [permissions.AllowAny]


# ------------------------------------------------------------
# 🔹 Kullanıcı İşlemleri (Kayıt / Giriş / Şifre)
# ------------------------------------------------------------

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def kullanici_kayit(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not all([username, email, password]):
        return Response({"hata": "Tüm alanlar zorunludur"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"hata": "Bu kullanıcı adı zaten alınmış!"}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({"hata": "Bu e-posta zaten kullanılıyor!"}, status=400)

    user = User.objects.create(
        username=username,
        email=email,
        password=make_password(password)
    )
    Profil.objects.create(kullanici=user)

    try:
        send_mail(
            subject="📚 Sosyal Kütüphane – Kayıt Başarılı",
            message=f"Hoş geldin {username}! Sisteme başarıyla kayıt oldun.",
            from_email=None,
            recipient_list=[email],
            fail_silently=True,
        )
    except:
        pass

    log_yaz(f"Kayıt: {username} – {email}")
    return Response({"mesaj": "Kayıt başarılı!"}, status=201)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def kullanici_giris(request):
    username_or_email = request.data.get('username')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response({'hata': 'Tüm alanlar zorunludur.'}, status=400)

    try:
        if '@' in username_or_email:
            user = User.objects.get(email=username_or_email)
            username = user.username
        else:
            username = username_or_email
    except User.DoesNotExist:
        return Response({'hata': 'Kullanıcı bulunamadı.'}, status=404)

    user = authenticate(username=username, password=password)
    if user:
        return Response({
            'mesaj': f'Hoş geldin {user.username}!',
            'id': user.id,
            'username': user.username,
            'email': user.email
        })
    return Response({'hata': 'Kullanıcı adı veya şifre hatalı.'}, status=401)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def sifre_sifirla(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"hata": "Bu e-posta bulunamadı"}, status=404)

    import random, string
    yeni_sifre = "".join(random.choices(string.ascii_letters + string.digits, k=10))
    user.password = make_password(yeni_sifre)
    user.save()

    try:
        send_mail(
            subject="🔐 Sosyal Kütüphane - Şifre Sıfırlama",
            message=f"Merhaba {user.username},\n\nYeni Şifreniz: {yeni_sifre}",
            from_email=None,
            recipient_list=[email],
            fail_silently=True,
        )
    except:
        pass

    print(f"ŞİFRE SIFIRLANDI: {email} -> {yeni_sifre}")
    return Response({"mesaj": "Yeni şifre e-postaya gönderildi!"})
    

# ------------------------------------------------------------
# 🔹 Global Arama (Keşfet)
# ------------------------------------------------------------

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def global_arama(request):
    q = request.GET.get("q", "").strip()
    if q == "":
        return Response({"hata": "Boş arama yapılamaz"}, status=400)

    # 1) TMDB
    tmdb_sonuclari = []
    try:
        url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_KEY}&language=tr-TR&query={q}"
        res = requests.get(url).json()
        for f in res.get("results", [])[:8]:
            tmdb_sonuclari.append({
                "id": f.get("id"),
                "baslik": f.get("title"),
                "ozet": f.get("overview", ""),
                "yil": f.get("release_date", "")[:4],
                "kapak": f"https://image.tmdb.org/t/p/w500{f.get('poster_path')}" if f.get('poster_path') else ""
            })
    except Exception as e:
        print("TMDB Hatası:", e)

    # 2) Google Books
    google_sonuclari = []
    try:
        url = f"https://www.googleapis.com/books/v1/volumes?q={q}&langRestrict=tr"
        res = requests.get(url).json()
        for item in res.get("items", [])[:8]:
            info = item.get("volumeInfo", {})
            google_sonuclari.append({
                "id": item.get("id"),
                "baslik": info.get("title"),
                "yazarlar": info.get("authors", []),
                "aciklama": info.get("description", ""),
                "kapak": info.get("imageLinks", {}).get("thumbnail", "")
            })
    except Exception as e:
        print("Google Books Hatası:", e)

    return Response({
        "tmdb_sonuclari": tmdb_sonuclari,
        "google_kitap_sonuclari": google_sonuclari,
    })


# ------------------------------------------------------------
# 🔹 İçerik Detay (film/kitap + platform puanı + yorumlar)
# ------------------------------------------------------------

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def icerik_detay(request, tur, id):
    veri = {}

    # Kullanıcı id'si opsiyonel (kullanıcının kendi puanı için)
    user_id = request.GET.get("user_id")

    # ---- 1) Film Detay (TMDB) ----
    if tur == "film":
        try:
            url = f"https://api.themoviedb.org/3/movie/{id}?api_key={TMDB_KEY}&language=tr-TR"
            res = requests.get(url).json()

            veri = {
                "id": id,
                "tur": "film",
                "baslik": res.get("title"),
                "kapak": f"https://image.tmdb.org/t/p/w500{res.get('poster_path')}" if res.get("poster_path") else "",
                "ozet": res.get("overview"),
                "yil": res.get("release_date", "")[:4],
                "yonetmen": "",
            }

            # Yönetmen
            credits = requests.get(
                f"https://api.themoviedb.org/3/movie/{id}/credits?api_key={TMDB_KEY}&language=tr-TR"
            ).json()
            for kisi in credits.get("crew", []):
                if kisi.get("job") == "Director":
                    veri["yonetmen"] = kisi.get("name")
                    break

        except:
            return Response({"hata": "Film bulunamadı"}, status=404)

    # ---- 2) Kitap Detay (Google Books) ----
    elif tur == "kitap":
        try:
            url = f"https://www.googleapis.com/books/v1/volumes/{id}"
            res = requests.get(url).json()
            info = res.get("volumeInfo", {})

            veri = {
                "id": id,
                "tur": "kitap",
                "baslik": info.get("title"),
                "kapak": info.get("imageLinks", {}).get("thumbnail", ""),
                "aciklama": info.get("description", ""),
                "yazarlar": info.get("authors", []),
            }

        except:
            return Response({"hata": "Kitap bulunamadı"}, status=404)

    else:
        return Response({"hata": "Tür hatalı"}, status=400)

    # ---- Platform puanı & yorumlar ----
    puanlar = Puan.objects.filter(content_id=id)
    ort_puan = puanlar.aggregate(Avg("puan"))["puan__avg"] or 0
    oy_sayisi = puanlar.count()

    yorum_qs = Yorum.objects.filter(content_id=id).select_related("kullanici").order_by("-tarih")
    yorum_seri = YorumSerializer(yorum_qs, many=True).data

    kullanici_puani = None
    if user_id:
        try:
            u = User.objects.get(id=user_id)
            p = Puan.objects.filter(kullanici=u, content_id=id).first()
            if p:
                kullanici_puani = p.puan
        except User.DoesNotExist:
            pass

    veri.update({
        "platform_puani": round(float(ort_puan), 2) if ort_puan else 0,
        "oy_sayisi": oy_sayisi,
        "yorumlar": yorum_seri,
        "kullanici_puani": kullanici_puani,
    })

    return Response(veri)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def feed(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"hata": "Kullanıcı bulunamadı"}, status=404)

    sayfa = int(request.GET.get("sayfa", 1))
    limit = int(request.GET.get("limit", 15))
    offset = (sayfa - 1) * limit

    # ❗ SADECE TAKİP EDİLEN KULLANICILAR
    takip_edilen_ids = list(
        user.following.values_list("takip_edilen_id", flat=True)
    )

    # ❗ TAKİP EDİLEN YOKSA BOŞ FEED
    if not takip_edilen_ids:
        return Response({
            "sayfa": sayfa,
            "sonraki_sayfa": None,
            "toplam": 0,
            "aktiviteler": []
        })

    # ❗ AKIŞTA GÖRÜNECEK İZİNLİ AKTİVİTE TÜRLERİ
    izinli_tipler = ["review", "rating", "follow"]

    # ❗ SADECE 3 TÜR AKTİVİTEYİ AL
    qs = (
        Aktivite.objects.filter(
            kullanici_id__in=takip_edilen_ids,
            aktivite_turu__in=izinli_tipler  # 🔥 Asıl kritik filtre
        )
        .select_related("kullanici")
        .order_by("-tarih")
    )

    toplam = qs.count()
    slice_qs = qs[offset:offset + limit]

    serializer = AktiviteSerializer(slice_qs, many=True)

        # --- Beğenilen aktiviteler ---
    liked_ids = set(
        AktiviteLike.objects.filter(kullanici=user)
        .values_list("aktivite_id", flat=True)
    )

    # --- Her aktiviteye liked_by_me ekle ---
    for a in serializer.data:
        a["liked_by_me"] = a["id"] in liked_ids


    sonraki_sayfa = None
    if toplam > offset + limit:
        sonraki_sayfa = sayfa + 1

    return Response({
        "sayfa": sayfa,
        "sonraki_sayfa": sonraki_sayfa,
        "toplam": toplam,
        "aktiviteler": serializer.data,
    })






@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def kullanici_ara(request):
    q = request.GET.get("q", "").strip()

    if q == "":
        return Response([], status=200)

    users = User.objects.filter(username__icontains=q)[:20]

    sonuc = [
        {
            "id": u.id,
            "username": u.username,
        }
        for u in users
    ]

    return Response(sonuc)



@api_view(["DELETE"])
def takip_sil(request):
    takip_eden = request.GET.get("takip_eden")
    takip_edilen = request.GET.get("takip_edilen")

    if not takip_eden or not takip_edilen:
        return Response({"hata": "Eksik parametre"}, status=400)

    try:
        obj = Takip.objects.get(takip_eden_id=takip_eden, takip_edilen_id=takip_edilen)
        obj.delete()
        return Response({"mesaj": "Takipten çıkıldı"}, status=204)
    except Takip.DoesNotExist:
        return Response({"hata": "Takip kaydı bulunamadı"}, status=404)















@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def kutuphane_durum(request):
    kullanici = request.GET.get("kullanici")
    content_id = request.GET.get("content_id")
    content_type = request.GET.get("content_type")

    if not all([kullanici, content_id, content_type]):
        return Response({"durum": None})

    obj = Kutuphane.objects.filter(
        kullanici_id=kullanici,
        content_id=content_id,
        content_type=content_type
    ).first()

    if obj:
        return Response({"durum": obj.durum})
    return Response({"durum": None})




@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def ozel_listeleri_getir(request):
    kullanici = request.GET.get("kullanici")
    if not kullanici:
        return Response([], status=200)

    listeler = OzelListe.objects.filter(kullanici_id=kullanici)

    data = [{"id": l.id, "ad": l.ad} for l in listeler]
    return Response(data)



@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def ozel_liste_icerik_kontrol(request):
    kullanici = request.GET.get("kullanici")
    content_id = request.GET.get("content_id")

    if not all([kullanici, content_id]):
        return Response({"listeler": []})

    liste_ids = OzelListeIcerik.objects.filter(
        liste__kullanici_id=kullanici,
        content_id=content_id
    ).values_list("liste_id", flat=True)

    return Response({"listeler": list(liste_ids)})




# api/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Kutuphane

@api_view(["DELETE"])
def kutuphane_sil(request):
    kullanici = request.GET.get("kullanici")
    content_id = request.GET.get("content_id")

    if not kullanici or not content_id:
        return Response(
            {"error": "kullanici ve content_id gereklidir."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # İlgili tüm kütüphane kayıtlarını sil 
    silinen = Kutuphane.objects.filter(
        kullanici_id=kullanici,
        content_id=content_id
    ).delete()

    return Response(status=status.HTTP_204_NO_CONTENT)





@api_view(["DELETE"])
def ozel_liste_sil(request):
    liste_id = request.GET.get("liste")
    kullanici = request.GET.get("kullanici")

    if not liste_id or not kullanici:
        return Response({"hata": "liste ve kullanici zorunlu"}, status=400)

    try:
        liste = OzelListe.objects.get(id=liste_id, kullanici_id=kullanici)
    except OzelListe.DoesNotExist:
        return Response({"hata": "Liste bulunamadı veya yetki yok."}, status=404)

    liste.delete()
    return Response(status=204)






@api_view(["PATCH"])
def ozel_liste_duzenle(request):
    liste_id = request.data.get("liste")
    kullanici = request.data.get("kullanici")
    yeni_ad = request.data.get("ad")
    yeni_aciklama = request.data.get("aciklama")

    if not liste_id or not kullanici:
        return Response({"hata": "liste ve kullanici zorunlu"}, status=400)

    try:
        liste = OzelListe.objects.get(id=liste_id, kullanici_id=kullanici)
    except OzelListe.DoesNotExist:
        return Response({"hata": "Liste bulunamadı veya yetki yok."}, status=404)

    if yeni_ad is not None:
        liste.ad = yeni_ad

    if yeni_aciklama is not None:
        liste.aciklama = yeni_aciklama

    liste.save()

    return Response(OzelListeSerializer(liste).data, status=200)







@api_view(["DELETE"])
def ozel_liste_icerik_sil(request):
    liste_id = request.GET.get("liste")
    kullanici = request.GET.get("kullanici")
    content_id = request.GET.get("content_id")

    if not all([liste_id, kullanici, content_id]):
        return Response({"hata": "liste, kullanici, content_id zorunlu"}, status=400)

    try:
        liste = OzelListe.objects.get(id=liste_id, kullanici_id=kullanici)
    except OzelListe.DoesNotExist:
        return Response({"hata": "Liste bulunamadı veya yetki yok."}, status=404)

    silinen = OzelListeIcerik.objects.filter(
        liste=liste,
        content_id=content_id
    ).delete()

    return Response(status=204)





def vitrin_icerik_detay(tur, content_id):
    """
    Vitrin için içerik detaylarını çeker (film/kitap)
    """
    # ---- Filmler ----
    if tur == "film":
        try:
            url = f"https://api.themoviedb.org/3/movie/{content_id}?api_key={TMDB_KEY}&language=tr-TR"
            r = requests.get(url).json()

            return {
                "id": content_id,
                "tur": "film",
                "baslik": r.get("title"),
                "ozet": r.get("overview", ""),
                "kapak": f"https://image.tmdb.org/t/p/w500{r.get('poster_path')}" if r.get("poster_path") else "",
            }
        except:
            return None

    # ---- Kitaplar ----
    if tur == "kitap":
        try:
            url = f"https://www.googleapis.com/books/v1/volumes/{content_id}"
            r = requests.get(url).json()
            info = r.get("volumeInfo", {})

            return {
                "id": content_id,
                "tur": "kitap",
                "baslik": info.get("title"),
                "ozet": info.get("description", ""),
                "kapak": info.get("imageLinks", {}).get("thumbnail", ""),
            }
        except:
            return None

    return None









@api_view(["GET"])
def vitrin_en_yuksek_puanli(request):
    # ---- Filmlerin Puan Ortalamaları ----
    film_puanlar = (
        Puan.objects.filter(content_type="film")
        .values("content_id")
        .annotate(ortalama=Avg("puan"))
        .order_by("-ortalama")[:10]
    )

    # ---- Kitapların Puan Ortalamaları ----
    kitap_puanlar = (
        Puan.objects.filter(content_type="kitap")
        .values("content_id")
        .annotate(ortalama=Avg("puan"))
        .order_by("-ortalama")[:10]
    )

    filmler = []
    for f in film_puanlar:
        detay = vitrin_icerik_detay("film", f["content_id"])
        if detay:
            detay["ortalama_puan"] = float(f["ortalama"])
            filmler.append(detay)

    kitaplar = []
    for k in kitap_puanlar:
        detay = vitrin_icerik_detay("kitap", k["content_id"])
        if detay:
            detay["ortalama_puan"] = float(k["ortalama"])
            kitaplar.append(detay)

    return Response({
        "filmler": filmler,
        "kitaplar": kitaplar
    })




@api_view(["GET"])
def vitrin_en_populer(request):
    # Yorum sayıları
    yorum_populer = (
        Yorum.objects.values("content_id", "content_type")
        .annotate(yorum_sayisi=Count("id"))
    )

    # Özel liste eklenme sayıları
    liste_populer = (
        OzelListeIcerik.objects.values("content_id", "content_type")
        .annotate(liste_sayisi=Count("id"))
    )

    skor_map = {}

    # yorum skor
    for y in yorum_populer:
        key = (y["content_id"], y["content_type"])
        skor_map[key] = skor_map.get(key, 0) + y["yorum_sayisi"]

    # özel liste skor
    for l in liste_populer:
        key = (l["content_id"], l["content_type"])
        skor_map[key] = skor_map.get(key, 0) + l["liste_sayisi"]

    # ilk 20
    sirali = sorted(skor_map.items(), key=lambda x: x[1], reverse=True)[:20]

    sonuc = []
    for (content_id, content_type), skor in sirali:
        detay = vitrin_icerik_detay(content_type, content_id)
        if detay:
            detay["populer_skor"] = skor
            sonuc.append(detay)

    return Response({
        "populer": sonuc
    })








@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def gelismis_filtre(request):
    tur = request.GET.get("tur")
    min_puan = float(request.GET.get("min_puan", 0))
    max_puan = float(request.GET.get("max_puan", 10))
    sirala = request.GET.get("sirala")

    # --- 1) TÜRE GÖRE FILTRE ---
    puan_qs = (
        Puan.objects.values("content_id", "content_type")
        .annotate(
            ortalama=Avg("puan"),
            oy_sayisi=Count("id")
        )
    )

    # Tür seçilmişse filtrele
    if tur:
        puan_qs = puan_qs.filter(content_type=tur)

    sonuc_listesi = []

    # --- 2) PUAN ARALIĞINA GÖRE FİLTRE ---
    for p in puan_qs:
        ortalama = float(p["ortalama"] or 0)

        if not (min_puan <= ortalama <= max_puan):
            continue

        content_id = p["content_id"]
        content_type = p["content_type"]

        detay = vitrin_icerik_detay(content_type, content_id)
        if not detay:
            continue

        detay["ortalama_puan"] = ortalama
        detay["oy_sayisi"] = p["oy_sayisi"]

        sonuc_listesi.append(detay)

    # --- 3) SIRALAMA ---
    # En yüksek puan
    if sirala == "puan":
        sonuc_listesi.sort(key=lambda x: x.get("ortalama_puan", 0), reverse=True)

    # En popüler (yorum + liste toplamı)
    elif sirala == "populerlik":
        for item in sonuc_listesi:
            yorum_sayisi = Yorum.objects.filter(
                content_id=item["id"],
                content_type=item["tur"]
            ).count()

            liste_sayisi = OzelListeIcerik.objects.filter(
                content_id=item["id"],
                content_type=item["tur"]
            ).count()

            item["populer_skor"] = yorum_sayisi + liste_sayisi

        sonuc_listesi.sort(key=lambda x: x.get("populer_skor", 0), reverse=True)

    return Response({"sonuclar": sonuc_listesi})









from .models import AktiviteLike, AktiviteYorum

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def aktivite_like(request):
    user_id = request.data.get("kullanici")
    aktivite_id = request.data.get("aktivite")

    if not user_id or not aktivite_id:
        return Response({"hata": "kullanici ve aktivite zorunlu"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"hata": "Kullanıcı bulunamadı"}, status=404)

    try:
        aktivite = Aktivite.objects.get(id=aktivite_id)
    except Aktivite.DoesNotExist:
        return Response({"hata": "Aktivite bulunamadı"}, status=404)

    # Toggle (varsa sil, yoksa ekle)
    mevcut = AktiviteLike.objects.filter(kullanici=user, aktivite=aktivite).first()

    if mevcut:
        mevcut.delete()
        return Response({"mesaj": "Beğeni kaldırıldı", "liked": False})

    AktiviteLike.objects.create(
        kullanici=user,
        aktivite=aktivite,
    )
    return Response({"mesaj": "Beğenildi", "liked": True})





@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def aktivite_yorum(request):
    user_id = request.data.get("kullanici")
    aktivite_id = request.data.get("aktivite")
    yorum_metin = request.data.get("yorum")

    if not all([user_id, aktivite_id, yorum_metin]):
        return Response({"hata": "kullanici, aktivite, yorum zorunlu"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"hata": "Kullanıcı bulunamadı"}, status=404)

    try:
        aktivite = Aktivite.objects.get(id=aktivite_id)
    except Aktivite.DoesNotExist:
        return Response({"hata": "Aktivite bulunamadı"}, status=404)

    yorum = AktiviteYorum.objects.create(
        kullanici=user,
        aktivite=aktivite,
        yorum=yorum_metin
    )

    return Response({
        "mesaj": "Yorum eklendi",
        "yorum": {
            "id": yorum.id,
            "kullanici": user.username,
            "yorum": yorum.yorum,
            "tarih": yorum.tarih
        }
    }, status=201)



@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def aktivite_yorumlar(request, aktivite_id):
    try:
        from .models import AktiviteYorum
        aktivite_yorumlari = (
            AktiviteYorum.objects
            .filter(aktivite_id=aktivite_id)
            .select_related("kullanici")
            .order_by("-tarih")
        )

        sonuc = []
        for y in aktivite_yorumlari:
            sonuc.append({
                "id": y.id,
                "kullanici_adi": y.kullanici.username,
                "kullanici_avatar": getattr(y.kullanici.profil, "avatar", None),
                "yorum": y.yorum,
                "tarih": y.tarih.strftime("%d.%m.%Y %H:%M"),
            })

        return Response({"yorumlar": sonuc})

    except Exception as e:
        print("Yorumlar getirilemedi:", e)
        return Response({"yorumlar": []})

