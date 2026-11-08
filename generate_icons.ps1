# Generate PWA App Icons (192x192 and 512x512 PNG)
# ASCII only to prevent PowerShell 5.1 encoding issues
Add-Type -AssemblyName System.Drawing

function Create-SutraIcon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background (Dark luxury temple black)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 30, 32, 40),
        [System.Drawing.Color]::FromArgb(255, 12, 13, 16),
        45.0
    )
    $g.FillRectangle($bgBrush, $rect)

    # Gold Enso Circle
    $penWidth = [Math]::Max(4, [int]($size * 0.04))
    $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 212, 175, 55), $penWidth)
    $circleMargin = [int]($size * 0.16)
    $circleSize = $size - ($circleMargin * 2)
    $g.DrawArc($goldPen, $circleMargin, $circleMargin, $circleSize, $circleSize, -30, 310)

    # Red Stamp
    $stampSize = [int]($size * 0.15)
    $stampX = [int]($size * 0.68)
    $stampY = [int]($size * 0.68)
    $stampBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 217, 56, 41))
    $g.FillRectangle($stampBrush, $stampX, $stampY, $stampSize, $stampSize)

    # Kanji 'Kei' inside stamp ([char]0x7D4C)
    $charKei = [string][char]0x7D4C
    $stampFont = New-Object System.Drawing.Font("MS Mincho", [float]($stampSize * 0.65), [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $stampRect = New-Object System.Drawing.RectangleF($stampX, $stampY, $stampSize, $stampSize)
    $g.DrawString($charKei, $stampFont, $whiteBrush, $stampRect, $sf)

    # Main Kanji 'Shin' ([char]0x5FC3)
    $charShin = [string][char]0x5FC3
    $fontSize = [float]($size * 0.44)
    $kanjiFont = New-Object System.Drawing.Font("MS Mincho", $fontSize, [System.Drawing.FontStyle]::Bold)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 228, 168))
    $centerRect = New-Object System.Drawing.RectangleF(0, [float]($size * 0.02), $size, $size)
    $g.DrawString($charShin, $kanjiFont, $goldBrush, $centerRect, $sf)

    # Clean up and save
    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created icon: $outputPath"
}

$dir = $PSScriptRoot
Create-SutraIcon 192 (Join-Path $dir "icon-192.png")
Create-SutraIcon 512 (Join-Path $dir "icon-512.png")
