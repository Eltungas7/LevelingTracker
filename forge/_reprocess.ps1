Add-Type -AssemblyName System.Drawing
$dir = $PSScriptRoot
# Reprocess specific items with wider saturation tolerance (handles tinted checker around glowy items).
function Clean-QuadrantWide {
  param([System.Drawing.Bitmap]$src, [int]$qx, [int]$qy, [int]$qw, [int]$qh,
        [int]$labelTopSkip, [int]$labelBottomSkip, [string]$outPath, [int]$satMax = 24)

  $bmp = New-Object System.Drawing.Bitmap $qw, $qh, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $qw, $qh), $qx, $qy, $qw, $qh, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  $rect = New-Object System.Drawing.Rectangle 0, 0, $qw, $qh
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $qh)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  $bottomStart = $qh - $labelBottomSkip
  for ($y=0; $y -lt $qh; $y++) {
    $row = $y * $stride
    $inLabel = ($y -lt $labelTopSkip) -or ($y -ge $bottomStart)
    for ($x=0; $x -lt $qw; $x++) {
      $i = $row + $x*4
      if ($inLabel) { $bytes[$i+3] = 0; continue }
      $b = $bytes[$i]; $gn = $bytes[$i+1]; $r = $bytes[$i+2]; $a = $bytes[$i+3]
      if ($a -lt 250) { $bytes[$i+3] = 0; continue }
      $mx = $r; if ($gn -gt $mx) {$mx=$gn}; if ($b -gt $mx) {$mx=$b}
      $mn = $r; if ($gn -lt $mn) {$mn=$gn}; if ($b -lt $mn) {$mn=$b}
      $sat = $mx - $mn
      if ($sat -le $satMax) {
        $v = ($r+$gn+$b)/3
        if (($v -ge 90 -and $v -le 220) -or $v -ge 235 -or $v -le 25) {
          $bytes[$i+3] = 0
        }
      }
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
  $colThresh = [int]([Math]::Max(5, $qh * 0.03))
  $rowThresh = [int]([Math]::Max(5, $qw * 0.03))
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
  $pad = 6
  $cx = [Math]::Max(0, $minX - $pad); $cy = [Math]::Max(0, $minY - $pad)
  $cw = [Math]::Min($qw - $cx, ($maxX - $minX + 1) + 2*$pad)
  $ch = [Math]::Min($qh - $cy, ($maxY - $minY + 1) + 2*$pad)
  $crop = $bmp.Clone((New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch), $bmp.PixelFormat)
  $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output "  -> $outPath ($cw x $ch)"
  $crop.Dispose(); $bmp.Dispose()
}

# Reprocess armor5 alone with very wide saturation tolerance for the yellow glow
$jobs = @(
  @{src='tier5.png'; tier=5; slot='armor'; sat=42}
)
foreach($j in $jobs) {
  $path = Join-Path $dir $j.src
  $src = [System.Drawing.Bitmap]::new($path)
  $W=$src.Width; $H=$src.Height
  $titleH = [int]($H * 0.09); $gridH = $H - $titleH
  $cellW = [int]($W / 2); $cellH = [int]($gridH / 2)
  $labelTop = [int]($cellH * 0.16); $labelBot = [int]($cellH * 0.04)
  switch ($j.slot) {
    'armor'     { $qx=0;       $qy=$titleH;        $qw=$cellW;    $qh=$cellH }
    'gauntlets' { $qx=$cellW;  $qy=$titleH;        $qw=$W-$cellW; $qh=$cellH }
    'helmet'    { $qx=0;       $qy=$titleH+$cellH; $qw=$cellW;    $qh=$gridH-$cellH }
    'boots'     { $qx=$cellW;  $qy=$titleH+$cellH; $qw=$W-$cellW; $qh=$gridH-$cellH }
  }
  $out = Join-Path $dir "$($j.slot)$($j.tier).png"
  Write-Output "Reprocessing $($j.slot)$($j.tier)..."
  Clean-QuadrantWide $src $qx $qy $qw $qh $labelTop $labelBot $out $j.sat
  $src.Dispose()
}
Write-Output 'done'
