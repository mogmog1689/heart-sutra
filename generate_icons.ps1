# Generate PWA App Icons with "般若心経" 4 characters in 2x2 layout
# ASCII only to prevent PowerShell 5.1 encoding issues
Add-Type -AssemblyName System.Drawing

function Create-SutraIcon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background (Dark temple black/navy gradient)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 28, 29, 36),
        [System.Drawing.Color]::FromArgb(255, 10, 11, 14),
        45.0
    )
    $g.FillRectangle($bgBrush, $rect)

    # Gold Enso Circle (禅の円相)
    $penWidth = [Math]::Max(3, [int]($size * 0.025))
    $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 212, 175, 55), $penWidth)
    $circleMargin = [int]($size * 0.08)
    $circleSize = $size - ($circleMargin * 2)
    $g.DrawArc($goldPen, $circleMargin, $circleMargin, $circleSize, $circleSize, -35, 310)

    # Inner decorative thin circle
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 212, 175, 55), 1.0)
    $innerMargin = [int]($size * 0.11)
    $innerSize = $size - ($innerMargin * 2)
    $g.DrawEllipse($innerPen, $innerMargin, $innerMargin, $innerSize, $innerSize)

    # Kanji Strings using Unicode chars:
    # 般 = 0x822C, 若 = 0x82E5, 心 = 0x5FC3, 経 = 0x7D4C
    $cHan  = [string][char]0x822C
    $cNya  = [string][char]0x82E5
    $cShin = [string][char]0x5FC3
    $cKyo  = [string][char]0x7D4C

    # 2x2 layout font size
    $fontSize = [float]($size * 0.28)
    $fontFamilyName = "MS Mincho"
    $kanjiFont = New-Object System.Drawing.Font($fontFamilyName, $fontSize, [System.Drawing.FontStyle]::Bold)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 226, 160))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Grid Cell Dimensions
    $halfW = $size / 2.0
    $halfH = $size / 2.0
    $offsetY = - [float]($size * 0.02) # slight optical center adjust

    # Cell 1: Top-Left "般"
    $rect1 = New-Object System.Drawing.RectangleF(0, $offsetY, $halfW, $halfH)
    $g.DrawString($cHan, $kanjiFont, $goldBrush, $rect1, $sf)

    # Cell 2: Top-Right "若"
    $rect2 = New-Object System.Drawing.RectangleF($halfW, $offsetY, $halfW, $halfH)
    $g.DrawString($cNya, $kanjiFont, $goldBrush, $rect2, $sf)

    # Cell 3: Bottom-Left "心"
    $rect3 = New-Object System.Drawing.RectangleF(0, ($halfH + $offsetY), $halfW, $halfH)
    $g.DrawString($cShin, $kanjiFont, $goldBrush, $rect3, $sf)

    # Cell 4: Bottom-Right "経"
    $rect4 = New-Object System.Drawing.RectangleF($halfW, ($halfH + $offsetY), $halfW, $halfH)
    $g.DrawString($cKyo, $kanjiFont, $goldBrush, $rect4, $sf)

    # Clean up and save PNG
    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created icon: $outputPath"
}

$dir = $PSScriptRoot
Create-SutraIcon 192 (Join-Path $dir "icon-192.png")
Create-SutraIcon 512 (Join-Path $dir "icon-512.png")
