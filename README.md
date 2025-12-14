# KütüpBox


> **Yazılım Laboratuvarı I – 2. Proje**  
> Kocaeli Üniversitesi · Bilgisayar Mühendisliği  
> Geliştirenler: **Sadık Gölpek**, **Çağatay Altıntopaç**


## Genel Bakış

KütüpBox, kullanıcıların içerikleri (film, dizi, kitap vb.) keşfedebildiği, kütüphanesine ekleyebildiği, değerlendirme ve yorum yapabildiği sosyal etkileşim odaklı bir web platformudur. Sistem; kullanıcı profilleri, takip mekanizması ve kişiselleştirilmiş akış (feed) yapısı üzerine kuruludur.

Bu depo, platformun **frontend (React)** ve **backend (Django REST)** bileşenlerini içeren bütünleşik bir yapıyı temsil eder.

---

## Temel Amaç

Projenin temel amacı, kullanıcıların içerikler üzerinden sosyal etkileşime girebildiği, kişisel kütüphanelerini oluşturabildiği ve takip ettikleri kişilerin aktivitelerini bir akış ekranında görüntüleyebildiği ölçeklenebilir bir platform geliştirmektir.

---

## Sistem Mimarisi (Özet)

* **Frontend:** React + Material UI
* **Backend:** Python Django + Django REST Framework
* **Veritabanı:** PostgreSQL
* **İletişim:** RESTful API

Frontend ve backend katmanları birbirinden bağımsız çalışacak şekilde tasarlanmıştır.

---

## Mevcut Durum ve Bilinen Kısıtlar

* Akış (Feed) ve Profil sayfaları, bileşenlerin kapsamlı yapısı ve yoğun veri gösterimi nedeniyle **ilk açılışta görece geç yüklenebilmektedir**.
* Bu durum, sistemin çalışmasını engelleyen kritik bir problem oluşturmamakta olup **fakat canlıya alma (deployment) açısından büyük bir risk teşkil etmektedir**.
* Performans iyileştirmeleri (bileşen ayrıştırma, render optimizasyonları vb.) ilerleyen geliştirme aşamalarında ele alınması planlanan konular arasındadır.
* Bu haliyle tam işlevli çalışıyor fakat geç açılma durumu projenin performansını düşürüyor.
---

## Geliştirme Durumu

Bu proje, üniversite kapsamında geliştirilen bir **okul projesidir** ve ileride hatalarımıza yönelik aktif geliştirme yapılabilir. 




---

## Not

Bu proje akademik ve deneysel amaçlarla geliştirilmekte olup, mimari kararlar ve teknik tercihler zaman içerisinde revize edilebilir.
