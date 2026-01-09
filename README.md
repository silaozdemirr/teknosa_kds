# teknosa_kds
Teknosa Mağazaları için KDS

Bu proje, Teknosa benzeri bir perakende organizasyonunun şube performanslarının yönetici düzeyinde izlenmesini ve veri temelli karar destek çıktılarının sunulmasını amaçlamaktadır. Uygulama Node.js (Express) tabanlı RESTful bir API ile geliştirilmiş olup, MVC mimarisi uygulanmıştır. Veritabanında şube, performans, lokasyon ve nüfus odaklı metrikler tutulmakta; istemci tarafında ise performans karşılaştırmaları, nüfus bazlı kârlılık analizleri, yoğunluk haritaları, ısı haritası, sıralama çıktıları ve yönetimsel özet kartları görselleştirilmektedir.

Senaryo, İzmir yerelindeki şubelerin yıllık gelir, gider, kâr, müşteri ve nüfus ilişkili verilerini temel alır. Yönetici, yıllara göre şube performanslarını karşılaştırabilir, verimsiz şubeleri tespit edebilir, yeni şube açılması önerilen ilçeleri görebilir ve kapanması önerilen şubeleri değerlendirebilir. Sistemde iki temel iş kuralı bulunmaktadır: (1) Nüfusa göre normalize edilmiş kârlılık metriği ile yatırım önceliği belirleme, (2) Çok yıllı toplam müşteri ve kâr verileri üzerinden kapanma veya genişleme önerisi üretme. Bu çerçevede uygulama kısmen karar destek sistemi niteliği taşımaktadır.

Node.js ve npm kurulumu gereklidir. Proje klonlandıktan sonra npm install ile bağımlılıklar yüklenir. .env.example dosyası referans alınarak .env hazırlanır ve port ile veritabanı bağlantı bilgileri tanımlanır. Veritabanı tabloları oluşturulduktan sonra npm start ile uygulama çalıştırılır. Varsayılan API adresi http://localhost:3000 olup istemci tarafı bu uç noktaya bağlanır.

API Endpoint Listesi
GET /subeler → Şube listesi ve ilgili ilçe bilgisi
GET /performans/:id → Seçili şubenin çok yıllı performans verileri
GET /api/toplam-sube → Toplam şube sayısı
GET /api/bubble-yeni-ilce → Yeni şube önerisi yapılan ilçe
GET /api/kapat-ilce → Kapatılması önerilen ilçe
GET /nufus-kds/:yil → Nüfusa göre normalize kârlılık analizi
GET /kar-siralama/:yil → İlgili yılda kâra göre top5 ve low5 sıralama
GET /sube-lokasyonlar → Şube lokasyonları
GET /sube-yogunluk-toplam → Çok yıllı müşteri-kâr toplamları (ısı haritası)
GET /subeler-demo → Yönetim ekranı için demo şube listesi