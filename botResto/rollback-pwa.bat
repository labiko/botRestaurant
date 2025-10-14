@echo off
echo ========================================
echo ROLLBACK COMPLET PWA - Bot Resto
echo ========================================
echo.
echo Ce script va annuler toutes les modifications PWA
echo et restaurer l'application a l'etat precedent.
echo.
pause

echo.
echo [1/5] Suppression du manifest.webmanifest...
if exist "src\manifest.webmanifest" (
    del "src\manifest.webmanifest"
    echo OK - Manifest supprime
) else (
    echo SKIP - Manifest deja supprime
)

echo.
echo [2/5] Suppression des icones PWA...
if exist "src\assets\icon\icon-72x72.png" (
    rmdir /S /Q "src\assets\icon"
    echo OK - Icones supprimees
) else (
    echo SKIP - Icones deja supprimees
)

echo.
echo [3/5] Suppression du script de generation...
if exist "generate-pwa-icons.js" (
    del "generate-pwa-icons.js"
    echo OK - Script supprime
) else (
    echo SKIP - Script deja supprime
)

echo.
echo [4/5] Restauration index.html...
git checkout src\index.html
if %ERRORLEVEL% EQU 0 (
    echo OK - index.html restaure
) else (
    echo ERREUR - Impossible de restaurer index.html
)

echo.
echo [5/5] Restauration angular.json...
git checkout angular.json
if %ERRORLEVEL% EQU 0 (
    echo OK - angular.json restaure
) else (
    echo ERREUR - Impossible de restaurer angular.json
)

echo.
echo ========================================
echo ROLLBACK TERMINE !
echo ========================================
echo.
echo L'application est maintenant revenue a l'etat precedent.
echo Vous pouvez relancer : ionic serve
echo.
pause
