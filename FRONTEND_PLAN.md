# BerberApp Frontend Plani

Bu dokuman, BerberApp API icin gelistirilebilecek sade ve anlatilabilir bir frontend planidir. Amac backend projesini tamamlayan, CV'de gosterilebilir, junior seviyede anlasilir bir arayuz hazirlamaktir.

## Onerilen Teknoloji

- React
- Vite
- TypeScript
- React Router
- Axios veya Fetch API
- Basit CSS / Tailwind CSS

Bu proje icin en mantikli secim `React + Vite + TypeScript` olur.

Neden?

- Backend zaten ASP.NET Core Web API olarak ayri calisiyor.
- Frontend sadece API tuketecek.
- Vite kurulumu ve proje yapisi sade.
- React Router ile sayfa gecisleri kolay anlatilir.
- TypeScript DTO mantigini frontend tarafinda da gostermeyi saglar.

## Hedef Ekranlar

### Public Ekranlar

- Login
- Register
- Berber listesi

### User Ekranlari

- Kullanici profili
- Randevularim
- Yeni randevu olusturma
- Pending randevuyu silme

### Admin Ekranlari

- Admin dashboard
- Berber listesi
- Berber ekleme
- Berber guncelleme
- Berber silme
- Kullanici listesi
- Kullanici rol guncelleme
- Tum randevular
- Randevu status guncelleme

## Sayfa Yapisi

```text
/login
/register
/barbers
/appointments/my
/appointments/new
/profile
/admin
/admin/barbers
/admin/users
/admin/appointments
```

## Onerilen Klasor Yapisi

```text
src/
  api/
    axiosClient.ts
    authApi.ts
    barberApi.ts
    appointmentApi.ts
    userApi.ts
  components/
    Layout.tsx
    Navbar.tsx
    ProtectedRoute.tsx
    AdminRoute.tsx
    FormInput.tsx
    Button.tsx
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    BarbersPage.tsx
    MyAppointmentsPage.tsx
    CreateAppointmentPage.tsx
    ProfilePage.tsx
    AdminDashboardPage.tsx
    AdminBarbersPage.tsx
    AdminUsersPage.tsx
    AdminAppointmentsPage.tsx
  types/
    apiResponse.ts
    auth.ts
    barber.ts
    appointment.ts
    user.ts
  utils/
    tokenStorage.ts
    authHelpers.ts
  App.tsx
  main.tsx
```

## Auth Akisi

1. Kullanici login olur.
2. API `data.token` doner.
3. Token `localStorage` icinde saklanir.
4. Axios interceptor her istege header ekler:

```text
Authorization: Bearer TOKEN
```

5. Kullanici logout yaparsa token silinir.
6. Admin sayfalari icin token icindeki role veya login response icindeki role kontrol edilir.

## API Response Tipi

Backend standart response donuyor. Frontend tarafinda bunun tipi soyle olabilir:

```ts
export type ApiResponse<T> = {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
};
```

## Frontend Gelistirme Sirasi

1. Vite + React + TypeScript projesi olustur.
2. Routing yapisini kur.
3. Axios client ve token interceptor ekle.
4. Login/Register sayfalarini yap.
5. Navbar ve layout ekle.
6. Berber listeleme sayfasini yap.
7. Kullanici randevu akisini yap:
   - randevularim
   - randevu olustur
   - randevu sil
8. Admin panelini yap:
   - berber CRUD
   - kullanici rol yonetimi
   - randevu status yonetimi
9. Form validation ve hata mesajlarini iyilestir.
10. README'ye frontend kurulum notlari ekle.

## Tasarim Yaklasimi

Bu proje bir operasyon paneli gibi dusunulmelidir. Bu yuzden:

- Sade layout
- Net tablo/listeler
- Belirgin form alanlari
- Admin ve User ekranlarinda ayrim
- Gereksiz animasyon veya agir tasarim yok
- Mobilde de temel kullanilabilirlik

## Minimum Demo Senaryosu

CV veya GitHub demosu icin su senaryo yeterlidir:

1. Kullanici register olur.
2. Login olur.
3. Berberleri listeler.
4. Randevu olusturur.
5. Randevularim ekraninda randevusunu gorur.
6. Admin login olur.
7. Admin berber ekler.
8. Admin kullanici rolunu gunceller.
9. Admin randevu statusunu Approved yapar.

## Not

Frontend'i backend reposundan ayri bir repo olarak acmak daha temiz olur:

```text
BerberApp_API
BerberApp_UI
```

Bu ayrim CV'de de guzel anlatilir: Backend API ve onu tuketen ayri React frontend.
