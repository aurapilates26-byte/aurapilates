# Télécharge backup.sql depuis le serveur prod puis restaure en local (schéma actuel + admin/superadmin).
# Usage : npm run restore-from-server
# Prérequis : clé SSH %USERPROFILE%\.ssh\id_ed25519_aura (passphrase demandée au téléchargement).

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backup = Join-Path $Root "backup.sql"
$Key = Join-Path $env:USERPROFILE ".ssh\id_ed25519_aura"
$Remote = "aurapilates@178.162.253.65:~/backup.sql"

Write-Host "→ Téléchargement du backup prod…" -ForegroundColor Cyan
scp -P 1979 -i $Key $Remote $Backup
if (-not (Test-Path $Backup)) {
  throw "backup.sql introuvable après scp"
}

$lines = (Get-Content $Backup).Count
$size = (Get-Item $Backup).Length
Write-Host "  Fichier : $Backup ($size octets, $lines lignes)" -ForegroundColor Green

Set-Location $Root
$env:PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION = "restore-from-server-local"
npm run restore-backup-local
