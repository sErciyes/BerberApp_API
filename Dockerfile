FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["BerberApp.API/BerberApp.API.csproj", "BerberApp.API/"]
COPY ["BerberApp.Business/BerberApp.Business.csproj", "BerberApp.Business/"]
COPY ["BerberApp.DataAccess/BerberApp.DataAccess.csproj", "BerberApp.DataAccess/"]
COPY ["BerberApp.Entities/BerberApp.Entities.csproj", "BerberApp.Entities/"]

RUN dotnet restore "BerberApp.API/BerberApp.API.csproj"

COPY . .
WORKDIR "/src/BerberApp.API"
RUN dotnet publish "BerberApp.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BerberApp.API.dll"]
