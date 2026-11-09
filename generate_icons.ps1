# Generate PWA App Icons with "般若心経" (Centered, Android Maskable Safe Zone)
# ASCII only to prevent PowerShell 5.1 encoding issues
Add-Type -AssemblyName System.Drawing

function Create-SutraIcon([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Full Background (Ensures maskable icons fill corners without white bars)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 30, 32, 42),
        [System.Drawing.Color]::FromArgb(255, 10, 11, 14),
        45.0
    )
    $g.FillRectangle($bgBrush, $rect)

    # Gold Enso Circle (Safe-zone diameter = 64% of size)
    $penWidth = [Math]::Max(2, [int]($size * 0.016))
    $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 223, 184, 65), $penWidth)
    $circleSize = [int]($size * 0.63)
    $circleMargin = [int](($size - $circleSize) / 2)
    $g.DrawArc($goldPen, $circleMargin, $circleMargin, $circleSize, $circleSize, -30, 310)

    # Inner decorative thin circle
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(75, 223, 184, 65), 1.0)
    $innerSize = [int]($size * 0.57)
    $innerMargin = [int](($size - $innerSize) / 2)
    $g.DrawEllipse($innerPen, $innerMargin, $innerMargin, $innerSize, $innerSize)

    # Kanji Strings using Unicode:
    # 般 = 0x822C, 若 = 0x82E5, 心 = 0x5FC3, 経 = 0x7D4C
    $cHan  = [string][char]0x822C
    $cNya  = [string][char]0x82E5
    $cShin = [string][char]0x5FC3
    $cKyo  = [string][char]0x7D4C

    # Font: Compact and centered within 60% safe zone
    $fontSize = [float]($size * 0.188)
    $kanjiFont = New-Object System.Drawing.Font("MS Mincho", $fontSize, [System.Drawing.FontStyle]::Bold)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 244, 212))

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Center coordinates and offsets
    $cx = [float]($size * 0.5)
    $cy = [float]($size * 0.5)
    $offX = [float]($size * 0.115)
    $offY = [float]($size * 0.100)
    $cellSize = [float]($fontSize * 1.4)

    # Helper function to draw centered character
    function DrawChar([string]$txt, [float]$x, [float]$y) {
        $r = New-Object System.Drawing.RectangleF(($x - $cellSize / 2.0), ($y - $cellSize / 2.0), $cellSize, $cellSize)
        $g.DrawString($txt, $kanjiFont, $goldBrush, $r, $sf)
    }

    # Top-Left "般"
    DrawChar $cHan  ($cx - $offX) ($cy - $offY)

    # Top-Right "若"
    DrawChar $cNya  ($cx + $offX) ($cy - $offY)

    # Bottom-Left "心"
    DrawChar $cShin ($cx - $offX) ($cy + $offY)

    # Bottom-Right "経"
    DrawChar $cKyo  ($cx + $offX) ($cy + $offY)

    # Clean up and save PNG
    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created centered icon: $outputPath"
}

$dir = $PSScriptRoot
Create-SutraIcon 192 (Join-Path $dir "icon-192.png")
Create-SutraIcon 512 (Join-Path $dir "icon-512.png")
