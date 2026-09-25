# Stage 1: Build Frontend (React + Vite + Tailwind)
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build .NET Backend (N-Tier Architecture)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Core/Core.csproj", "Core/"]
COPY ["Entities/Entities.csproj", "Entities/"]
COPY ["DataAccess/DataAccess.csproj", "DataAccess/"]
COPY ["Business/Business.csproj", "Business/"]
COPY ["WebAPI/WebAPI.csproj", "WebAPI/"]
RUN dotnet restore "WebAPI/WebAPI.csproj"

COPY . .
# Copy compiled frontend into WebAPI wwwroot for unified serving
COPY --from=frontend-build /app/frontend/dist /src/WebAPI/wwwroot

WORKDIR "/src/WebAPI"
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Lightweight Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WebAPI.dll"]
