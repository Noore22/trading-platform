$loginBody = @{
    username = "admin"
    password = "admin123"
}
try {
    $loginRes = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/auth/login" -Method Post -Body $loginBody
    $token = $loginRes.access_token
    Write-Output "Access Token obtained: $token"

    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $settingsBody = @{
        default_lot_size = 0.02
        risk_percentage = 2.0
        max_trades = 5
        trading_hours_start = "08:00"
        trading_hours_end = "18:00"
        allowed_symbols = "EURUSD,GBPUSD"
        news_filter_enabled = $true
        take_profit = 50.0
        stop_loss = 30.0
        trailing_stop = 10.0
        max_daily_loss = 100.0
        max_daily_profit = 200.0
    } | ConvertTo-Json

    $settingsRes = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/settings/1" -Method Put -Headers $headers -Body $settingsBody
    Write-Output "Settings Update Response:"
    $settingsRes | ConvertTo-Json -Depth 5
} catch {
    Write-Error $_
}
