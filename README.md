# 🥊 LinçedIn — Çok Oyunculu LinkedIn Boss Linçleme Oyunu

![LinçedIn Logo](./assets/lincein_logo.jpg)

**LinçedIn**, LinkedIn'de sürekli *"Bugün bir mülakatta..."* diye başlayan, *"Agree?"* diye soran, motivasyon kasan ve ahkam kesen profilleri Boss yapıp arkadaşlarınızla birlikte 2D arenada yumrukladığınız gerçek zamanlı çok oyunculu (multiplayer) bir tarayıcı oyunudur.

Canlı Adres: **[https://lincedin.ketware.com](https://lincedin.ketware.com)**

---

## 🏗️ Mimari & Teknolojiler

### Backend (.NET 8 Kurumsal N-Tier Mimari)
* **Core**: Generic Repository (`IEntityRepository`, `EfEntityRepositoryBase`), Result pattern (`IDataResult`, `IResult`), IoC ve Extensions.
* **Entities**: `Room`, `Boss`, `PunchLog` entity'leri, DTO'lar (`CreateRoomDto`, `PagedResponseDto`).
* **DataAccess**: Entity Framework Core + PostgreSQL (`BossBattleDbContext`).
* **Business**: `RoomManager`, `BossManager`, FluentValidation ve Autofac modülleri.
* **WebAPI**: REST Controller'lar, Swagger ve gerçek zamanlı çok oyunculu senkronizasyon için **SignalR `GameHub`**.

### Frontend (2D Oyun İstemcisi)
* **React + Vite + Tailwind CSS**
* **SignalR Client**: Oyuncu hareketleri, odaya katılım, anlık Boss canı, kadın/erkek karakter çizimi ve vuruş efektleri.
* **Web Audio API**: Dış ses dosyasına ihtiyaç duymadan gerçek zamanlı sentezlenen yumruk & zafer sesleri.
* **Canvas Confetti**: Boss devrildiğinde zafer kutlaması.

---

## 🔒 Güvenlik & Gizlilik (Git ve .env)
Tüm veritabanı şifreleri, portlar ve sunucu ayarları `.env` dosyasında tutulur ve `.gitignore` ile korunmaktadır. 
Projeyi GitHub'a gönderdiğinizde şifreleriniz depoya **asla sızmaz**.

---

## 🚀 Docker ile Yayına Alma (Canlı Sunucu & Local)

### 1. Ortam Değişkenlerini Hazırlama
Depoda bulunan `.env.example` şablonunu kopyalayarak `.env` dosyanızı oluşturun ve şifrenizi belirleyin:

```bash
cp .env.example .env
```

`.env` içeriği örneği:
```ini
POSTGRES_DB=linkedin_boss_battle_db
POSTGRES_USER=postgres
POSTGRES_EXTERNAL_PORT=39472

APP_PORT=39470
APP_URL=https://lincedin.ketware.com
ALLOWED_ORIGINS=https://lincedin.ketware.com,http://localhost:39470,http://localhost:5173
```

### 2. Docker Konteynerlerini Başlatma
Sunucuda veya yerelde tek bir komutla ayağa kaldırın:

```bash
docker compose up -d --build
```

Bu komut:
1. **PostgreSQL** veritabanı konteynerini başlatır ve sağlık kontrolü (healthcheck) yapar.
2. Frontend'i build eder ve **.NET Core WebAPI** içerisine gömerek tek bir hafif konteynerde çalıştırır.
3. Otomatik olarak veritabanı tablolarını oluşturur ve örnek Boss'ları tohumlar (seed eder).

---

## 💻 Yerel Geliştirme (Local Development)

### 1. Backend'i Başlatma
```bash
cd WebAPI
dotnet run
```
Swagger UI: `http://localhost:39470/swagger`

### 2. Frontend'i Başlatma
```bash
cd frontend
npm install
npm run dev
```
Oyun Arayüzü: `http://localhost:5173`

---

## 🎮 Nasıl Oynanır?
1. **"Linç Başlat"** butonuna basarak linçlemek istediğin kişinin adını, görselini ve linç sebebini gir.
2. Takma adını ve karakter tipini (👧 Kadın / 👦 Erkek) seç ve odaya gir!
3. **WASD** veya **Yön Tuşları** ile gez.
4. **BOŞLUK (SPACE)** tuşuna basarak veya Boss'a tıklayarak yumruk at!
5. Boss hasar aldıkça canı yeşilden sarıya, turuncuya ve kırmızıya döner; etrafında alevler yükselir!
6. En çok hasarı vererek liderlik tablosunda **MVP** ol!
