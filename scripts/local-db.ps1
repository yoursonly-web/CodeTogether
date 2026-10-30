param([ValidateSet('start', 'stop', 'status')][string]$DatabaseAction = 'status')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot '.runtime'
$controlPath = Join-Path $runtimeRoot 'pgsql/bin/pg_ctl.exe'
$databasePath = Join-Path $runtimeRoot 'postgres-data'
if (-not (Test-Path -LiteralPath $controlPath) -or -not (Test-Path -LiteralPath (Join-Path $databasePath 'PG_VERSION'))) {
  throw 'Project-local PostgreSQL is not initialized on this computer. Use your PostgreSQL installation and DATABASE_URL, or complete local database setup.'
}
if ($DatabaseAction -eq 'start') {
  & $controlPath status -D $databasePath 2>$null
  if ($LASTEXITCODE -eq 0) { Write-Output 'Project-local PostgreSQL is already running.'; exit 0 }
  & $controlPath start -D $databasePath -l (Join-Path $runtimeRoot 'postgres.log') -o '-h 127.0.0.1 -p 5432' -w
} elseif ($DatabaseAction -eq 'stop') {
  & $controlPath stop -D $databasePath -m fast -w
} else {
  & $controlPath status -D $databasePath
}
exit $LASTEXITCODE
