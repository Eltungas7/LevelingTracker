Add-Type -AssemblyName System.Drawing
$dir = $PSScriptRoot

# Hardcoded cell bounds for shields.png (2266x1888). Rows are uneven (T7-T9 taller).
# Per-cell labels are top + bottom-right text on cosmic background. Strip dark cosmic + text.
function Clean-Shield {
  param([System.Drawing.Bitmap]$src, [int]$qx, [int]$qy, [int]$qw, [int]$qh, [string]$outPath,
        [double]$topPct = 0.30, [double]$botPct = 0.45, [double]$rightPct = 0.55, [double]$botFullPct = 0.0)

  $bmp = New-Object System.Drawing.Bitmap $qw, $qh, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $qw, $qh), $qx, $qy, $qw, $qh, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()

  $rect = New-Object System.Drawing.Rectangle 0, 0, $qw, $qh
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $qh)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  # Position-based label masks: shield art is in the LEFT-CENTER of each cell.
  # Top strip (full width) holds the upper label. Bottom-right quadrant holds the lower label.
  $topMaskEnd = [int]($qh * $topPct)
  $botMaskStart = [int]($qh * (1.0 - $botPct))
  $rightMaskStart = [int]($qw * $rightPct)
  $botFullStart = [int]($qh * (1.0 - $botFullPct))

  for ($y=0; $y -lt $qh; $y++) {
    $row = $y * $stride
    $inTopMask = ($y -lt $topMaskEnd)
    $inBotMask = ($y -ge $botMaskStart)
    $inBotFull = ($botFullPct -gt 0 -and $y -ge $botFullStart)
    for ($x=0; $x -lt $qw; $x++) {
      $i = $row + $x*4
      if ($inTopMask) { $bytes[$i+3] = 0; continue }
      if ($inBotFull) { $bytes[$i+3] = 0; continue }
      if ($inBotMask -and $x -ge $rightMaskStart) { $bytes[$i+3] = 0; continue }
      $b = $bytes[$i]; $gn = $bytes[$i+1]; $r = $bytes[$i+2]; $a = $bytes[$i+3]
      if ($a -lt 250) { $bytes[$i+3] = 0; continue }
      $v = ($r+$gn+$b)/3
      # Cosmic background = dark (v<55). Drop.
      if ($v -lt 55) { $bytes[$i+3] = 0; continue }
    }
  }

  $colCount = New-Object int[] $qw
  $rowCount = New-Object int[] $qh
  for ($y=0; $y -lt $qh; $y++) {
    $row = $y * $stride
    for ($x=0; $x -lt $qw; $x++) {
      if ($bytes[$row + $x*4 + 3] -gt 30) { $colCount[$x]++; $rowCount[$y]++ }
    }
  }
  $colThresh = [int]([Math]::Max(15, $qh * 0.08))
  $rowThresh = [int]([Math]::Max(15, $qw * 0.08))
  $minX=$qw; $maxX=-1; $minY=$qh; $maxY=-1
  for ($x=0; $x -lt $qw; $x++) { if ($colCount[$x] -ge $colThresh) { if ($x -lt $minX){$minX=$x}; if ($x -gt $maxX){$maxX=$x} } }
  for ($y=0; $y -lt $qh; $y++) { if ($rowCount[$y] -ge $rowThresh) { if ($y -lt $minY){$minY=$y}; if ($y -gt $maxY){$maxY=$y} } }
  if ($maxX -ge 0) {
    for ($y=0; $y -lt $qh; $y++) {
      $row = $y * $stride
      $inY = ($y -ge $minY -and $y -le $maxY)
      for ($x=0; $x -lt $qw; $x++) {
        if (-not ($inY -and $x -ge $minX -and $x -le $maxX)) { $bytes[$row + $x*4 + 3] = 0 }
      }
    }
  }

  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  $bmp.UnlockBits($data)

  if ($maxX -lt 0) { Write-Output "  empty"; $bmp.Dispose(); return }
  $pad = 8
  $cx = [Math]::Max(0, $minX - $pad); $cy = [Math]::Max(0, $minY - $pad)
  $cw = [Math]::Min($qw - $cx, ($maxX - $minX + 1) + 2*$pad)
  $ch = [Math]::Min($qh - $cy, ($maxY - $minY + 1) + 2*$pad)
  $crop = $bmp.Clone((New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch), $bmp.PixelFormat)
  $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output "  -> $outPath ($cw x $ch)"
  $crop.Dispose(); $bmp.Dispose()
}

# Hardcoded cell positions detected from shields.png (2266x1888)
# Rows: row1 y=120-575 (h=455), row2 y=615-1010 (h=395), row3 y=1085-1860 (h=775)
# Cols: col1 x=40-735 (w=695), col2 x=790-1485 (w=695), col3 x=1535-2230 (w=695)
$rowY = @(120, 615, 1085)
$rowH = @(455, 395, 775)
$colX = @(40, 790, 1535)
$colW = 695

$path = Join-Path $dir 'shields.png'
$src = [System.Drawing.Bitmap]::new($path)
# Per-row mask tuning: rows 1-2 have labels top+bottom-right; row 3 has labels top + bottom-CENTER.
for ($row=0; $row -lt 3; $row++) {
  for ($col=0; $col -lt 3; $col++) {
    $tier = $row*3 + $col + 1
    $qx = $colX[$col]; $qy = $rowY[$row]; $qw = $colW; $qh = $rowH[$row]
    $out = Join-Path $dir "shield$tier.png"
    Write-Output "shield$tier @ ($qx,$qy) $($qw)x$($qh)..."
    if ($row -lt 2) {
      Clean-Shield $src $qx $qy $qw $qh $out 0.30 0.45 0.55 0.0
    } else {
      # T7-T9: shield is large, label only at very bottom (full-width strip)
      Clean-Shield $src $qx $qy $qw $qh $out 0.06 0.0 1.0 0.20
    }
  }
}
$src.Dispose()
Write-Output 'done'
