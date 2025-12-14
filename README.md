# KütüpBox


> **Yazılım Laboratuvarı I – 2. Proje**  
> Kocaeli Üniversitesi · Bilgisayar Mühendisliği  
> Geliştirenler: **Sadık Gölpek**, **Çağatay Altıntopaç**


## Genel Bakış

KütüpBox, kullanıcıların içerikleri (film, dizi, kitap vb.) keşfedebildiği, kütüphanesine ekleyebildiği, değerlendirme ve yorum yapabildiği sosyal etkileşim odaklı bir web platformudur. Sistem; kullanıcı profilleri, takip mekanizması ve kişiselleştirilmiş akış (feed) yapısı üzerine kuruludur.

Bu depo, platformun **frontend (React)** ve **backend (Django REST)** bileşenlerini içeren bütünleşik bir yapıyı temsil eder.Mobil uyumlu çalışır.


<img width="709" height="801" alt="image" src="https://github.com/user-attachments/assets/d0c4f616-6e56-4ce5-8982-8214aa44ddce" />



---

## Temel Amaç

Projenin temel amacı, kullanıcıların içerikler üzerinden sosyal etkileşime girebildiği, kişisel kütüphanelerini oluşturabildiği ve takip ettikleri kişilerin aktivitelerini bir akış ekranında görüntüleyebildiği ölçeklenebilir bir platform geliştirmektir.


<img width="652" height="764" alt="image" src="https://github.com/user-attachments/assets/b3a08cf3-5033-4c78-ba69-09efc01de697" />

---

## Sistem Mimarisi (Özet)

* **Frontend:** React + Material UI
* **Backend:** Python Django + Django REST Framework
* **Veritabanı:** PostgreSQL
* **İletişim:** RESTful API

Frontend ve backend katmanları birbirinden bağımsız çalışacak şekilde tasarlanmıştır.

<img width="999" height="444" alt="image" src="https://github.com/user-attachments/assets/6209d3db-17e1-44b2-8042-759c5e4a43f8" />

---

## Mevcut Durum ve Bilinen Kısıtlar

* Akış (Feed) ve Profil sayfaları, bileşenlerin kapsamlı yapısı ve yoğun veri gösterimi nedeniyle **ilk açılışta görece geç yüklenebilmektedir**.
* Bu durum, sistemin çalışmasını engelleyen kritik bir problem oluşturmamakta olup **fakat canlıya alma (deployment) açısından büyük bir risk teşkil etmektedir**.
* Performans iyileştirmeleri (bileşen ayrıştırma, render optimizasyonları vb.) ilerleyen geliştirme aşamalarında ele alınması planlanan konular arasındadır.
* Bu haliyle tam işlevli çalışıyor fakat geç açılma durumu projenin performansını düşürüyor.
---

<img width="517" height="526" alt="image" src="https://github.com/user-attachments/assets/aa78961c-1866-4f24-879f-7960334ef8e9" />

<img width="675" height="700" alt="image" src="https://github.com/user-attachments/assets/9ae66b07-8dd4-41e2-b8a4-af682c6da15d" />



## Geliştirme Durumu

Bu proje, üniversite kapsamında geliştirilen bir **okul projesidir** ve ileride hatalarımıza yönelik aktif geliştirme yapılabilir. 




---

## Not

Bu proje akademik ve deneysel amaçlarla geliştirilmekte olup, mimari kararlar ve teknik tercihler zaman içerisinde revize edilebilir.
