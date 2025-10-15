@echo off
setlocal

set PROJECT_NAME=coinssjj

echo Creando estructura del proyecto %PROJECT_NAME%...

mkdir %PROJECT_NAME%
cd %PROJECT_NAME%

:: ========================
:: Estructura del BACKEND
:: ========================
mkdir backend
cd backend

mkdir src\auth
mkdir src\users
mkdir src\correspondence
mkdir src\shared
mkdir src\database

:: Archivos base del backend
type nul > src\main.ts
type nul > src\app.module.ts
type nul > src\auth\auth.module.ts
type nul > src\auth\auth.service.ts
type nul > src\auth\auth.controller.ts
type nul > src\users\users.module.ts
type nul > src\users\users.service.ts
type nul > src\users\users.controller.ts
type nul > src\correspondence\correspondence.module.ts
type nul > src\database\seeds.ts
type nul > src\database\database.providers.ts

echo {} > package.json
echo PORT=3000 > .env
echo {
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
} > nest-cli.json

cd ..

:: ========================
:: Estructura del FRONTEND
:: ========================
mkdir frontend
cd frontend

mkdir src\assets
mkdir src\components
mkdir src\views
mkdir src\router
mkdir src\stores
mkdir src\services

:: Archivos base del frontend
echo.> src\main.ts
echo.> src\App.vue
echo {} > package.json
echo VITE_API_URL=http://localhost:3000 > .env

:: Contenido mínimo para App.vue
(
echo ^<template^>
echo   ^<div id="app"^>
echo     ^<router-view /^>
echo   ^</div^>
echo ^</template^>
echo.
echo ^<script setup lang="ts"^>
echo ^</script^>
echo.
echo ^<style^>
echo ^</style^>
) > src\App.vue

cd ..

:: ========================
:: Archivos raíz
:: ========================
echo # COINSSJJ - Sistema de Correspondencia > README.md

(
echo node_modules/
echo dist/
echo .env
echo .DS_Store
echo *.log
echo /frontend/node_modules/
echo /backend/node_modules/
) > .gitignore

echo version: '3.8' > docker-compose.yml
echo services: >> docker-compose.yml
echo   db: >> docker-compose.yml
echo     image: postgres:15 >> docker-compose.yml
echo     environment: >> docker-compose.yml
echo       POSTGRES_DB: coinssjj >> docker-compose.yml
echo       POSTGRES_USER: coinssjj_user >> docker-compose.yml
echo       POSTGRES_PASSWORD: coinssjj_pass >> docker-compose.yml
echo     ports: >> docker-compose.yml
echo       - "5432:5432" >> docker-compose.yml
echo     volumes: >> docker-compose.yml
echo       - postgres_data:/var/lib/postgresql/data >> docker-compose.yml
echo volumes: >> docker-compose.yml
echo   postgres_data: >> docker-compose.yml

echo.
echo ✅ Estructura del proyecto %PROJECT_NAME% creada exitosamente.
echo.
echo Siguientes pasos:
echo 1. cd backend ^&^& npm init -y (luego instalaremos dependencias de NestJS)
echo 2. cd frontend ^&^& npm init -y (luego instalaremos Vue 3)
pause