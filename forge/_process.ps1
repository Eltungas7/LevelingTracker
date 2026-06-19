Add-Type -AssemblyName System.Drawing
$dir = $PSScriptRoot

function Clean-Quadrant {
  param([System.Drawing.Bitmap]$src, [int]$qx, [int]$qy, [int]$qw, [int]$qh,
        [int]$labelTopSkip, [int]$labelBottomSkip, [string]$outPath)

  $bmp = New-Object System.Drawing.Bitmap $qw, $qh, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $qw, $qh), $qx, $qy, $qw, $qh, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  $rect = New-Object System.Drawing.Rectangle 0, 0, $qw, $qh
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $qh)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  # Single-pass: clear label strips + checker pixels.
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
      if ($sat -le 14) {
        $v = ($r+$gn+$b)/3
        # wide checker band: any low-sat grey 90-220 + near-white + near-black frame.
        if (($v -ge 90 -and $v -le 220) -or $v -ge 235 -or $v -le 25) {
          $bytes[$i+3] = 0
        }
      }
    }
  }

  # Count opaque pixels per row & column to identify content vs sparse noise.
  $colCount = New-Object int[] $qw
  $rowCount = New-Object int[] $qh
  for ($y=0; $y -lt $qh; $y++) {
    $row = $y * $stride
    for ($x=0; $x -lt $qw; $x++) {
      if ($bytes[$row + $x*4 + 3] -gt 30) { $colCount[$x]++; $rowCount[$y]++ }
    }
  }
  # Content threshold: a row/col counts only if it has at least N opaque pixels.
  $colThresh = [int]([Math]::Max(5, $qh * 0.03))
  $rowThresh = [int]([Math]::Max(5, $qw * 0.03))
  $minX=$qw; $maxX=-1; $minY=$qh; $maxY=-1
  for ($x=0; $x -lt $qw; $x++) { if ($colCount[$x] -ge $colThresh) { if ($x -lt $minX){$minX=$x}; if ($x -gt $maxX){$maxX=$x} } }
  for ($y=0; $y -lt $qh; $y++) { if ($rowCount[$y] -ge $rowThresh) { if ($y -lt $minY){$minY=$y}; if ($y -gt $maxY){$maxY=$y} } }
  # Clear any pixels outside the content bbox so residue noise is gone in the crop too.
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

function Process-TierSheet([string]$file, [int]$tier) {
  $path = Join-Path $dir $file
  Write-Output "Processing $file (tier $tier)..."
  $src = [System.Drawing.Bitmap]::new($path)
  $W=$src.Width; $H=$src.Height
  $titleH = [int]($H * 0.09)
  $gridH = $H - $titleH
  $cellW = [int]($W / 2)
  $cellH = [int]($gridH / 2)
  $labelTop = [int]($cellH * 0.16)
  $labelBot = [int]($cellH * 0.04)
  $quads = @(
    @{slot='armor';     qx=0;       qy=$titleH;        qw=$cellW;    qh=$cellH},
    @{slot='gauntlets'; qx=$cellW;  qy=$titleH;        qw=$W-$cellW; qh=$cellH},
    @{slot='helmet';    qx=0;       qy=$titleH+$cellH; qw=$cellW;    qh=$gridH-$cellH},
    @{slot='boots';     qx=$cellW;  qy=$titleH+$cellH; qw=$W-$cellW; qh=$gridH-$cellH}
  )
  foreach($q in $quads) {
    $out = Join-Path $dir "$($q.slot)$tier.png"
    Clean-Quadrant $src $q.qx $q.qy $q.qw $q.qh $labelTop $labelBot $out
  }
  $src.Dispose()
}

function Process-Tier7-9 {
  $path = Join-Path $dir 'tier7-9.png'
  Write-Output "Processing tier7-9.png (T7/T8/T9)..."
  $src = [System.Drawing.Bitmap]::new($path)
  $W=$src.Width; $H=$src.Height
  $titleH = [int]($H * 0.09)
  $gridH = $H - $titleH
  $colW = [int]($W / 3)
  $cellW = [int]($colW / 2)
  $cellH = [int]($gridH / 2)
  $labelTop = [int]($cellH * 0.18)
  $labelBot = [int]($cellH * 0.05)
  $tiers = @(7, 8, 9)
  for ($t=0; $t -lt 3; $t++) {
    $tier = $tiers[$t]
    $colX = $t * $colW
    $quads = @(
      @{slot='armor';     qx=$colX;          qy=$titleH;        qw=$cellW; qh=$cellH},
      @{slot='gauntlets'; qx=$colX+$cellW;   qy=$titleH;        qw=$colW-$cellW; qh=$cellH},
      @{slot='helmet';    qx=$colX;          qy=$titleH+$cellH; qw=$cellW; qh=$gridH-$cellH},
      @{slot='boots';     qx=$colX+$cellW;   qy=$titleH+$cellH; qw=$colW-$cellW; qh=$gridH-$cellH}
    )
    foreach($q in $quads) {
      $out = Join-Path $dir "$($q.slot)$tier.png"
      Clean-Quadrant $src $q.qx $q.qy $q.qw $q.qh $labelTop $labelBot $out
    }
  }
  $src.Dispose()
}

function Process-Shields {
  $path = Join-Path $dir 'shields.png'
  Write-Output "Processing shields.png (T1-T9)..."
  $src = [System.Drawing.Bitmap]::new($path)
  $W=$src.Width; $H=$src.Height
  $titleH = [int]($H * 0.04)
  $gridH = $H - $titleH
  $cellW = [int]($W / 3)
  $cellH = [int]($gridH / 3)
  # Shield art is in the LEFT half of each cell; text labels are top + bottom-right.
  $artW = [int]($cellW * 0.55)
  $labelTop = [int]($cellH * 0.18)
  $labelBot = [int]($cellH * 0.10)
  for ($row=0; $row -lt 3; $row++) {
    for ($col=0; $col -lt 3; $col++) {
      $tier = $row*3 + $col + 1
      $qx = $col * $cellW
      $qy = $titleH + $row * $cellH
      $out = Join-Path $dir "shield$tier.png"
      Clean-Quadrant $src $qx $qy $artW $cellH $labelTop $labelBot $out
    }
  }
  $src.Dispose()
}

Process-Shields
Write-Output 'done'
