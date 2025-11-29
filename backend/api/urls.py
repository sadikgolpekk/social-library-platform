from django.urls import path, include
from rest_framework import routers
from .views import (
    KullaniciGorunum, ProfilGorunum, TakipGorunum,
    PuanGorunum, YorumGorunum, KutuphaneGorunum,
    OzelListeGorunum, OzelListeIcerikGorunum,
    AktiviteGorunum,
    kullanici_kayit, kullanici_giris, sifre_sifirla,
    global_arama, icerik_detay, feed,kullanici_ara,takip_sil,kutuphane_durum,kutuphane_durum,ozel_liste_icerik_kontrol,ozel_listeleri_getir,kutuphane_sil,ozel_liste_sil,ozel_liste_icerik_sil,ozel_liste_duzenle
)

router = routers.DefaultRouter()
router.register("kullanicilar", KullaniciGorunum)
router.register("profil", ProfilGorunum)
router.register("takip", TakipGorunum)
router.register("puan", PuanGorunum)          # ← EKLENDİ
router.register("yorum", YorumGorunum)        # ← EKLENDİ
router.register("kutuphane", KutuphaneGorunum)
router.register("aktivite", AktiviteGorunum, basename="aktivite")
router.register("ozel-liste", OzelListeGorunum, basename="ozel-liste")
router.register("ozel-liste-icerik", OzelListeIcerikGorunum, basename="ozel-liste-icerik")


urlpatterns = [
    path("", include(router.urls)),

    # Kayıt / Giriş / Şifre
    path("kayit/", kullanici_kayit),
    path("giris/", kullanici_giris),
    path("sifre-sifirla/", sifre_sifirla),

    # Arama & Detay
    path("global-arama/", global_arama),
    path("icerik-detay/<str:tur>/<str:id>/", icerik_detay),

    # Akış (Feed)
    path("feed/<int:user_id>/", feed),



    path("kullanici-ara/", kullanici_ara),
    path("takip-sil/", takip_sil),



    path("kutuphane-durum/", kutuphane_durum),
    path("ozel-listeler/", ozel_listeleri_getir),
    path("ozel-liste-icerik-kontrol/", ozel_liste_icerik_kontrol),


    path("kutuphane-sil/", kutuphane_sil, name="kutuphane_sil"),



  path("ozel-liste-sil/",ozel_liste_sil),
  path("ozel-liste-duzenle/",ozel_liste_duzenle),
  path("ozel-liste-icerik-sil/",ozel_liste_icerik_sil),



]
