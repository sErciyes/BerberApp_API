# LinkedIn Post Taslagi

Son donemde ASP.NET Core ve React kullanarak gelistirdigim `BerberApp` projesini biraz daha gercek dunya senaryolarina yaklastirdim.

Projede sadece temel CRUD endpointleri degil, dogrudan is kurali tarafina da odaklandim:

- JWT authentication ve role-based authorization
- katmanli mimari (`API -> Business -> DataAccess -> Entities`)
- email ve telefon dogrulama akislari
- SignalR ile kullanici-berber mesajlasma
- harita uzerinden yakin dukkanlari listeleme
- 30 dakikalik slot mantigi ile randevu olusturma
- aktif randevusu olan kullanicinin yeni randevu alamamasi gibi business rule'lar
- berberlerin kendi gunluk randevu akisini gorebilmesi

Bu projeyi gelistirirken en cok hosuma giden kisim, sadece endpoint yazmak degil; kullanici akisi, roller, kurallar ve ekran davranislarini birlikte dusunmek oldu.

Hala gelistirmeye devam ediyorum ama bu surec bana ozellikle backend mimarisi, auth yapilari, real-time iletisim ve is kurali modelleme tarafinda ciddi pratik kazandirdi.

GitHub:
[repo-link-buraya]

#dotnet #aspnetcore #webapi #react #signalr #softwaredevelopment #backend #juniordeveloper

---

## Daha Kisa Versiyon

ASP.NET Core ile gelistirdigim `BerberApp` projesinde JWT auth, role-based authorization, SignalR mesajlasma, email/telefon dogrulama, harita tabanli dukkan listeleme ve randevu business rule'lari uzerinde calistim.

Ozellikle CRUD'in otesine gecip is kurali dusunmek guzel bir deneyimdi:
- aktif randevu varken yeni randevu alamama
- 30 dakikalik slot sistemi
- berber tarafinda gunluk randevu takibi
- kullanici/berber gercek zamanli mesajlasma

Projeyi gelistirmeye devam ediyorum.

GitHub:
[repo-link-buraya]
