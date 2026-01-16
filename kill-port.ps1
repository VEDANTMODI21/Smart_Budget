# PowerShell script to kill processes on port 5000
Write-Host "🔍 Finding processes on port 5000..." -ForegroundColor Yellow

$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "🛑 Stopping process: $($proc.ProcessName) (PID: $pid)" -ForegroundColor Red
            Stop-Process -Id $pid -Force
        }
    }
    Write-Host "✅ Port 5000 is now free!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No processes found on port 5000" -ForegroundColor Cyan
}
