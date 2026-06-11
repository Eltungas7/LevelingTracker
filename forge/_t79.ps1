Add-Type -AssemblyName System.Drawing
$dir = $PSScriptRoot

function Clean-T79Cell {
  param([System.Drawing.Bitmap]$src, [int]$qx, [int]$qy, [int]$qw, [int]$qh, [string]$outPath, [bool]$floodFill = $true)

  $bmp = New-Object System.Drawing.Bitmap $qw, $qh, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $qw, $qh), $qx, $qy, $qw, $qh, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()

  $rect = New-Object System.Drawing.Rectangle 0, 0, $qw, $qh
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $stride = $data.Stride
  $bytes = New-Object byte[] ($stride * $qh)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  $topMaskEnd = [int]($qh * 0.33)
  $botMaskStart = [int]($qh * 0.72)
  $rightMaskStart = [int]($qw * 0.94)
  $leftMaskEnd = [int]($qw * 0.03)

  # Mark label/edge strips transparent.
  for ($y=0; $y -lt $qh; $y++) {
    $row = $y * $stride
    $inTop = ($y -lt $topMaskEnd)
    $inBot = ($y -ge $botMaskStart)
    for ($x=0; $x -lt $qw; $x++) {
      $i = $row + $x*4
      if ($inTop -or $inBot -or $x -ge $rightMaskStart -or $x -lt $leftMaskEnd) { $bytes[$i+3] = 0 }
    }
  }

  if (-not $floodFill) {
    # Skip flood-fill — just keep label/edge masks. Item retains cosmic background.
    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
    $bmp.UnlockBits($data)
    # Quick tight crop based on opaque pixel bounds
    $bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bb = New-Object byte[] ($bmpData.Stride * $qh)
    [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bb, 0, $bb.Length)
    $bmp.UnlockBits($bmpData)
    $minX=$qw; $maxX=-1; $minY=$qh; $maxY=-1
    for ($y=0; $y -lt $qh; $y++) { for ($x=0; $x -lt $qw; $x++) { if ($bb[$y*$bmpData.Stride + $x*4 + 3] -gt 30) { if ($x -lt $minX){$minX=$x}; if ($y -lt $minY){$minY=$y}; if ($x -gt $maxX){$maxX=$x}; if ($y -gt $maxY){$maxY=$y} } } }
    if ($maxX -lt 0) { Write-Output "  empty"; $bmp.Dispose(); return }
    $pad = 6
    $cx = [Math]::Max(0, $minX - $pad); $cy = [Math]::Max(0, $minY - $pad)
    $cw = [Math]::Min($qw - $cx, ($maxX - $minX + 1) + 2*$pad)
    $ch = [Math]::Min($qh - $cy, ($maxY - $minY + 1) + 2*$pad)
    $crop = $bmp.Clone((New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch), $bmp.PixelFormat)
    $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "  -> $outPath ($cw x $ch) [no flood]"
    $crop.Dispose(); $bmp.Dispose()
    return
  }
  # Flood-fill: start from every already-transparent edge pixel, expand into cosmic-like neighbors.
  # Cosmic-like = v < 75 (covers dark blue/purple/black with stars between).
  $visited = New-Object byte[] ($qw * $qh)
  $queue = New-Object System.Collections.Queue
  # Seed with every transparent pixel on the perimeter of the unmasked window.
  for ($y=$topMaskEnd; $y -lt $botMaskStart; $y++) {
    foreach($x in $leftMaskEnd, ($rightMaskStart-1)) {
      $idx = $y * $qw + $x
      if ($visited[$idx] -eq 0) { $visited[$idx] = 1; $queue.Enqueue($idx) }
    }
  }
  for ($x=$leftMaskEnd; $x -lt $rightMaskStart; $x++) {
    foreach($y in $topMaskEnd, ($botMaskStart-1)) {
      $idx = $y * $qw + $x
      if ($visited[$idx] -eq 0) { $visited[$idx] = 1; $queue.Enqueue($idx) }
    }
  }

  # BFS with depth tracking. Stop flood at MAX_DEPTH so interior cosmic survives.
  # Use parallel depth array. Each enqueued pixel carries depth.
  $depth = New-Object int[] ($qw * $qh)
  $maxDepth = 999999
  while ($queue.Count -gt 0) {
    $idx = $queue.Dequeue()
    $y = [int]($idx / $qw); $x = $idx - ($y * $qw)
    $i = $y * $stride + $x * 4
    $d0 = $depth[$idx]
    $a = $bytes[$i+3]
    if ($a -gt 0) {
      $b = $bytes[$i]; $gn = $bytes[$i+1]; $r = $bytes[$i+2]
      $v = ($r + $gn + $b) / 3
      # Pixels close to the edge get stripped more aggressively (cosmic + faint).
      # Pixels deep inside need to be very dark (clear cosmic black).
      $threshold = if ($d0 -lt 25) { 90 } elseif ($d0 -lt 50) { 60 } else { 35 }
      if ($v -ge $threshold) { continue }  # too bright for this depth, stop spread
      $bytes[$i+3] = 0
    }
    foreach($dxdy in @(@(-1,0),@(1,0),@(0,-1),@(0,1))) {
      $nx = $x + $dxdy[0]; $ny = $y + $dxdy[1]
      if ($nx -lt $leftMaskEnd -or $ny -lt $topMaskEnd -or $nx -ge $rightMaskStart -or $ny -ge $botMaskStart) { continue }
      $nidx = $ny * $qw + $nx
      if ($visited[$nidx] -eq 0) {
        $visited[$nidx] = 1
        $depth[$nidx] = $d0 + 1
        $queue.Enqueue($nidx)
      }
    }
  }

  # Bounding box trim
  $colCount = New-Object int[] $qw
  $rowCount = New-Object int[] $qh
  for ($y=0; $y -lt $qh; $y++) {
    $row = $y * $stride
    for ($x=0; $x -lt $qw; $x++) {
      if ($bytes[$row + $x*4 + 3] -gt 30) { $colCount[$x]++; $rowCount[$y]++ }
    }
  }
  $colThresh = [int]([Math]::Max(8, $qh * 0.05))
  $rowThresh = [int]([Math]::Max(8, $qw * 0.05))
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

$path = Join-Path $dir 'tier7-9.png'
$src = [System.Drawing.Bitmap]::new($path)
$W=$src.Width; $H=$src.Height
$titleH = [int]($H * 0.09)
$gridH = $H - $titleH
$colW = [int]($W / 3)
$cellW = [int]($colW / 2)
$cellH = [int]($gridH / 2)
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
    Write-Output "$($q.slot)$tier @ ($($q.qx),$($q.qy)) $($q.qw)x$($q.qh)..."
    # T7 has light armor that survives flood-fill. T8 and T9 are entirely cosmic-themed, so
    # flood-fill destroys them — keep their cosmic background (label-mask only).
    $useFlood = ($tier -eq 7)
    Clean-T79Cell $src $q.qx $q.qy $q.qw $q.qh $out $useFlood
  }
}
$src.Dispose()
Write-Output 'done'
