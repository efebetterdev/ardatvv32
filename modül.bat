@echo off
title Modül Yükleyici
cls
color 0A

NET SESSION >nul 2>&1
if %errorLevel% == 0 (
    set admin=ADMIN
    color 0C
) else (
    set admin=STANDART
    color 0A
)

echo.
echo ==============================
echo  NPM MODUL YUKLEYICI
echo ==============================
echo.
echo [Kullanici]: %username%
echo [Yetki]: %admin%
echo [Tarih]: %date%
echo [Saat]: %time%
echo ==============================
echo.

:menu
echo.
echo [1] Modulleri Yukle (npm install)
echo [2] Gelistirme Modullerini Yukle
echo [3] Global Modul Yukle
echo [4] Modulleri Guncelle
echo [5] Cikis
echo.

set /p secim=Seciminiz (1-5): 

if %secim%==1 goto npm_install
if %secim%==2 goto npm_dev
if %secim%==3 goto npm_global
if %secim%==4 goto npm_update
if %secim%==5 goto cikis

echo Hatali secim! 1-5 arasinda bir sayi girin.
pause
goto menu

:npm_install
cls
color 0B
echo.
echo ===== MODUL YUKLEME (npm install) =====
echo.
npm install
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Moduller yuklendi!
    color 0A
) else (
    echo.
    echo [HATA] Moduller yuklenemedi!
    color 0C
)
pause
goto menu

:npm_dev
cls
color 0D
echo.
echo ===== GELISTIRME MODULLERI (npm install --save-dev) =====
echo.
npm install --save-dev
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Gelistirme modulleri yuklendi!
    color 0A
) else (
    echo.
    echo [HATA] Moduller yüklenemedi!
    color 0C
)
pause
goto menu

:npm_global
cls
color 0E
echo.
echo ===== GLOBAL MODUL YUKLEME =====
echo.
set /p modul=Modül adı: 
npm install -g %modul%
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] %modul% global modulu yuklendi!
    color 0A
) else (
    echo.
    echo [HATA] %modul% modulu yuklenemedi!
    color 0C
)
pause
goto menu

:npm_update
cls
color 0B
echo.
echo ===== MODUL GUNCELLEME (npm update) =====
echo.
npm update
if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Moduller guncellendi!
    color 0A
) else (
    echo.
    echo [HATA] Moduller guncellenemedi!
    color 0C
)
pause
goto menu

:cikis
cls
color 0F
echo.
echo ===== CIKIS YAPILIYOR =====
echo.
echo Modul Yukleyici kapatiliyor...
timeout /t 2 >nul
exit