# BerberApp API

BerberApp API, berber randevularini yonetmek icin gelistirilmis katmanli mimariye sahip bir ASP.NET Core Web API projesidir. Proje junior backend developer seviyesinde, okunabilir ve gelistirilebilir bir referans proje olarak hazirlanmistir.

## Proje Ozeti

Bu API ile kullanicilar kayit olabilir, giris yapabilir, berberleri listeleyebilir ve randevu olusturabilir. Admin rolundeki kullanicilar berber CRUD islemlerini, kullanici rol yonetimini ve randevu durum guncellemelerini yapabilir.

## Kullanilan Teknolojiler

- C#
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- SQL Server
- JWT Authentication
- Role-based Authorization
- Swagger / OpenAPI
- BCrypt.Net-Next

## Katmanli Mimari

Proje 4 ana katmandan olusur:

- `BerberApp.API`: Controller, middleware, Swagger ve uygulama konfigurasyonu
- `BerberApp.Business`: DTO, service ve business kurallari
- `BerberApp.DataAccess`: EF Core `AppDbContext` ve migrationlar
- `BerberApp.Entities`: Entity modelleri

Akis:

```text
API -> Business -> DataAccess -> Entities
```

## Temel Ozellikler

- Kullanici kayit ve giris islemleri
- BCrypt ile sifre hashleme
- JWT token uretimi
- Admin/User rol ayrimi
- Swagger uzerinden JWT authorize destegi
- Berber CRUD
- Randevu CRUD
- Randevu saat cakismasi kontrolu
- Randevu kurallari:
  - Gecmis tarihe randevu alinamaz
  - Randevu saatleri 09:00-18:00 arasindadir
  - Son slot 17:30'dur
  - Sadece `00` ve `30` dakikalari kabul edilir
  - Kullanici sadece kendi `Pending` randevusunu silebilir
- Standart API response modeli
- Global exception middleware
- DTO validation

## Kurulum

1. Repoyu klonlayin.

```bash
git clone <repo-url>
cd BerberApp.API
```

2. `BerberApp.API/appsettings.Example.json` dosyasini referans alarak `BerberApp.API/appsettings.Development.json` dosyasini olusturun.

Ornek:

```json
{
  "ConnectionStrings": {
    "SqlConnection": "Server=localhost;Database=BerberAppDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "CHANGE_ME_TO_A_LONG_SECRET_KEY_AT_LEAST_32_CHARS",
    "Issuer": "berberapi",
    "Audience": "berberapi"
  }
}
```

3. Migrationlari veritabanina uygulayin.

```bash
dotnet ef database update --project BerberApp.DataAccess --startup-project BerberApp.API
```

4. API'yi calistirin.

```bash
dotnet run --project BerberApp.API
```

5. Swagger arayuzunu acin.

```text
https://localhost:7046/swagger
```

veya launch profile'a gore:

```text
http://localhost:5159/swagger
```

## JWT Kullanimi

1. `POST /api/auth/login` endpointi ile giris yapin.
2. Response icindeki `data.token` degerini alin.
3. Swagger sag ustteki `Authorize` butonuna tiklayin.
4. Tokeni sadece token olarak yapistirin.

Swagger `Bearer` kismini otomatik ekler.

## Ornek Login Response

```json
{
  "success": true,
  "message": "Giris basarili.",
  "data": {
    "token": "...",
    "userId": 1,
    "fullName": "Serdar Test",
    "email": "serdar@example.com",
    "role": "User"
  },
  "errors": null
}
```

## Endpoint Ozeti

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users/me`
- `GET /api/users` - Admin
- `GET /api/users/{id}` - Admin
- `PATCH /api/users/{id}/role` - Admin

### Barbers

- `GET /api/barbers`
- `GET /api/barbers/{id}`
- `POST /api/barbers` - Admin
- `PUT /api/barbers/{id}` - Admin
- `DELETE /api/barbers/{id}` - Admin

### Appointments

- `GET /api/appointments` - Admin
- `GET /api/appointments/my`
- `GET /api/appointments/{id}`
- `POST /api/appointments`
- `PATCH /api/appointments/{id}/status` - Admin
- `DELETE /api/appointments/{id}`

## Roller

Varsayilan olarak kayit olan her kullanici `User` rolunde olusur.

Admin rolu vermek icin:

```http
PATCH /api/users/{id}/role
```

Body:

```json
{
  "role": "Admin"
}
```

Bu endpoint sadece Admin kullanicilar tarafindan cagrilabilir.

Ilk admin kullaniciyi olusturmak icin once normal register endpointi ile bir kullanici kaydedin. Sonra SQL Server uzerinden bu kullanicinin rolunu `Admin` yapin:

```sql
UPDATE Users
SET Role = 'Admin'
WHERE Email = 'admin@example.com';
```

Bu islemden sonra tekrar login olun. Yeni token icinde `Admin` rolu yer alacaktir.

## Standart Response Modeli

Basarili response:

```json
{
  "success": true,
  "message": null,
  "data": {},
  "errors": null
}
```

Hatali response:

```json
{
  "success": false,
  "message": "Validation hatasi.",
  "data": null,
  "errors": [
    "Email zorunludur."
  ]
}
```

## Notlar

- `appsettings.Development.json` dosyasi `.gitignore` icindedir ve GitHub'a yuklenmemelidir.
- JWT key ve SQL Server sifresi gibi hassas bilgiler repoya eklenmemelidir.
- Bu proje bilincli olarak sade tutulmustur. Repository pattern, Unit of Work gibi yapilar ileride eklenebilir; ancak mevcut hali junior seviyede daha kolay okunur ve anlatilir durumdadir.

## Docker ile Calistirma

Projede API ve SQL Server icin basit bir Docker Compose yapisi bulunur.

```bash
docker compose up -d
```

Bu komut iki container baslatir:

- `berberapp-api`
- `berberapp-sqlserver`

API adresi:

```text
http://localhost:5159/swagger
```

Ilk calistirmada SQL Server container'inin tamamen hazir hale gelmesi biraz zaman alabilir. Veritabani semasini olusturmak icin migration uygulanmalidir.

Docker SQL Server'a migration uygulamak icin:

```bash
dotnet ef database update --project BerberApp.DataAccess --startup-project BerberApp.API --connection "Server=localhost,1433;Database=BerberAppDb;User Id=sa;Password=Your_strong_password123!;TrustServerCertificate=True;"
```

Containerlari durdurmak icin:

```bash
docker compose down
```

Veritabani volume'unu da silmek isterseniz:

```bash
docker compose down -v
```

Not: `docker-compose.yml` icindeki sifre ve JWT key sadece lokal gelistirme icindir. Gercek ortamda secret/environment variable yonetimi kullanilmalidir.
