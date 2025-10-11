@echo off
REM =========================================
REM BACKUP AVANT NETTOYAGE EMOJI NUMÉROS
REM =========================================
REM Date: 2025-10-11
REM Objectif: Sauvegarder france_product_options AVANT modifications
REM =========================================

echo ========================================
echo BACKUP france_product_options
echo ========================================

REM Créer le répertoire de backup s'il n'existe pas
if not exist backups mkdir backups

REM Timestamp pour le nom du fichier
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo.
echo [1/2] Backup table complete en cours...

REM OPTION 1: BACKUP TABLE COMPLÈTE (RECOMMANDÉ)
"C:\Program Files\PostgreSQL\17\bin\pg_dump" --table=france_product_options --data-only "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" > "backups\france_product_options_backup_%TIMESTAMP%.sql"

if %errorlevel% equ 0 (
    echo [OK] Backup cree: backups\france_product_options_backup_%TIMESTAMP%.sql
) else (
    echo [ERREUR] Echec du backup!
    pause
    exit /b 1
)

echo.
echo ========================================
echo VERIFICATION
echo ========================================
dir backups\*%TIMESTAMP%*

echo.
echo ========================================
echo BACKUP TERMINE AVEC SUCCES!
echo ========================================
echo.
echo Vous pouvez maintenant executer NETTOYAGE_EMOJI_NUMEROS.sql
echo.
echo Pour restaurer en cas de probleme:
echo psql "postgresql://postgres:p4zN25F7Gfw9Py@db.vywbhlnzvfqtiurwmrac.supabase.co:5432/postgres" ^< backups\france_product_options_backup_%TIMESTAMP%.sql
echo.
pause
