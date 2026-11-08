# Heart Sutra Web Server (TcpListener-based, No admin rights needed, No encoding bugs)
$port = 8080
$ip = [System.Net.IPAddress]::Any

try {
    $server = New-Object System.Net.Sockets.TcpListener($ip, $port)
    $server.Start()
} catch {
    Write-Host "[ERROR] Port $port could not be opened: $_" -ForegroundColor Red
    exit 1
}

$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Heart Sutra PWA Server is READY" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [PC]         http://localhost:$port/" -ForegroundColor Yellow
if ($localIp) {
    Write-Host " [Smartphone] http://$($localIp):$port/" -ForegroundColor Magenta
    Write-Host " (Open the link above in Chrome on your Android phone)" -ForegroundColor Gray
}
Write-Host "`nPress Ctrl + C in this terminal to stop the server.`n"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
}

try {
    while ($true) {
        $client = $server.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        $requestLine = $reader.ReadLine()
        if (-not [string]::IsNullOrEmpty($requestLine)) {
            $tokens = $requestLine.Split(" ")
            if ($tokens.Length -ge 2) {
                $rawPath = $tokens[1].Split("?")[0]
                if ($rawPath -eq "/" -or $rawPath -eq "") {
                    $rawPath = "/index.html"
                }
                
                $filePath = Join-Path $PSScriptRoot ($rawPath.TrimStart('/'))
                if (Test-Path $filePath -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $cType = $mimeTypes[$ext]
                    if (-not $cType) { $cType = "application/octet-stream" }
                    
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $cType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                } else {
                    $notFound = "HTTP/1.1 404 Not Found`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                    $nfBytes = [System.Text.Encoding]::ASCII.GetBytes($notFound)
                    $stream.Write($nfBytes, 0, $nfBytes.Length)
                }
            }
        }
        $stream.Close()
        $client.Close()
    }
} finally {
    $server.Stop()
}
