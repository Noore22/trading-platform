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
    }
    $statusRes = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/mt5/status" -Method Get -Headers $headers
    Write-Output "MT5 Status Response:"
    $statusRes | ConvertTo-Json -Depth 5
} catch {
    Write-Error $_
}
