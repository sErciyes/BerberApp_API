# Azure Deploy Rehberi

Bu proje icin en temiz yayin modeli:

- API: Azure App Service
- Veritabani: Azure SQL Database
- UI: Azure Static Web Apps

## 1. Azure SQL olustur

Azure Portal uzerinden:

- `SQL Database` olustur
- Database name: `BerberAppDb`
- Yeni bir SQL Server olustur ya da mevcut server sec
- Firewall tarafinda kendi IP adresine izin ver
- Gerekirse `Allow Azure services and resources to access this server` secenegini ac

Ornek production connection string:

```text
Server=tcp<YOUR_SERVER>.database.windows.net,1433;Initial Catalog=BerberAppDb;Persist Security Info=False;User ID=<YOUR_USER>;Password=<YOUR_PASSWORD>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## 2. API icin Azure App Service olustur

Portal uzerinden:

- `App Service` olustur
- Runtime stack: `.NET 8 (LTS)`
- Operating System: `Linux`

App Service > Environment variables bolumunde su ayarlari ekle:

```text
ConnectionStrings__SqlConnection
Jwt__Key
Jwt__Issuer
Jwt__Audience
Frontend__BaseUrl
Email__UseSmtp
Email__ShowDevelopmentTokens
Email__Smtp__Host
Email__Smtp__Port
Email__Smtp__EnableSsl
Email__Smtp__UserName
Email__Smtp__Password
Email__Smtp__FromEmail
Email__Smtp__FromName
Sms__ShowDevelopmentCodes
Seed__Enabled
ASPNETCORE_ENVIRONMENT
```

Onerilen production degerleri:

```text
Email__UseSmtp=true
Email__ShowDevelopmentTokens=false
Sms__ShowDevelopmentCodes=false
Seed__Enabled=false
ASPNETCORE_ENVIRONMENT=Production
```

## 3. UI icin Azure Static Web App olustur

Portal uzerinden:

- `Static Web App` olustur
- Deployment source: `GitHub`
- Repository olarak bu repoyu sec
- Build preset: `React`
- App location: `BerberApp.UI`
- Api location: bos
- Output location: `dist`

UI tarafi build sirasinda su iki variable'a ihtiyac duyar:

```text
VITE_API_BASE_URL=https://<YOUR_API_APP>.azurewebsites.net/api
VITE_CHAT_HUB_URL=https://<YOUR_API_APP>.azurewebsites.net/hubs/chat
```

## 4. GitHub secret ve variable'lari

Repository > Settings > Secrets and variables > Actions altinda:

### Secrets

```text
AZURE_API_WEBAPP_PUBLISH_PROFILE
AZURE_STATIC_WEB_APPS_API_TOKEN
```

### Variables

```text
AZURE_API_WEBAPP_NAME
VITE_API_BASE_URL
VITE_CHAT_HUB_URL
```

## 5. Publish profile alma

Azure App Service > Overview > `Get publish profile`

Indirdigin XML dosyasinin icerigini:

```text
AZURE_API_WEBAPP_PUBLISH_PROFILE
```

secret olarak GitHub'a yapistir.

## 6. Static Web App deployment token alma

Azure Static Web App > Overview > `Manage deployment token`

Buradaki token'i:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN
```

secret olarak GitHub'a ekle.

## 7. GitHub Actions workflow'lari

Repoda hazir workflow dosyalari bulunur:

- `.github/workflows/deploy-api-azure.yml`
- `.github/workflows/deploy-ui-azure-static-web-apps.yml`

Bu workflow'lar `main` branch'e push oldugunda veya manuel tetiklendiginde deploy yapar.

## 8. Migration

Azure SQL'e semayi ilk kez olusturmak icin lokal makineden ya da pipeline icinden migration uygulayin.

Lokal komut:

```bash
dotnet ef database update --project BerberApp.DataAccess --startup-project BerberApp.API --connection "Server=tcp:<YOUR_SERVER>.database.windows.net,1433;Initial Catalog=BerberAppDb;Persist Security Info=False;User ID=<YOUR_USER>;Password=<YOUR_PASSWORD>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

## 9. Canli adresler

Deploy tamamlandiginda tipik adresler:

- API: `https://<api-app-name>.azurewebsites.net/swagger`
- UI: `https://<static-web-app-name>.azurestaticapps.net`
