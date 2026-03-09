@echo off
chcp 65001 >nul
cls
echo ========================================
echo   ЗАПУСК СЕРВЕРА BAJAR
echo ========================================
echo.

cd /d D:\bajar\code

echo Проверка старых процессов...
taskkill /F /IM node.exe >nul 2>&1

echo Запуск сервера...
echo.
echo ✅ Сервер запускается на http://localhost:3000
echo.
echo ⚠️  НЕ ЗАКРЫВАЙТЕ ЭТО ОКНО!
echo.
echo Для остановки нажмите Ctrl+C
echo ========================================
echo.

npm start

pause
