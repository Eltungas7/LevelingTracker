Add-Type -AssemblyName System.Drawing

# Split each forge material strip into 3 transparent per-tier PNGs.
# Sources: img/forge/{Timber,Hide,Crystal,Iron}.png (2260x448, two bg flavors).
# Splits are found by detecting empty (green-only) column gaps between content
# blobs, since icons aren't always centered in thirds (Timber especially).
# Output: img/materials/{family}_{1..3}.png cropped to content with a small margin.

$srcDir = 'C:\Users\Tuni\Desktop\LevelingTracker\img\forge'
$dstDir = 'C:\Users\Tuni\Desktop\LevelingTracker\img\materials'
$map = @(
  @{ src='Timber.png';  family='timber';  yMaxPct=1.00 },
  @{ src='Hide.png';    family='scroll';  yMaxPct=0.78 },
  @{ src='Crystal.png'; family='crystal'; yMaxPct=0.78 },
  @{ src='Iron.png';    family='gear';    yMaxPct=0.78 }
)

# Pixel is "green" when green dominates by a clear margin. The strips ship in two
# bg flavors: bright ~RGB(57,248,5) and dark muted ~RGB(73,124,52). The combined
# dominance check catches both while ignoring near-white sparkles (R≈G≈B).
function Is-Green($r, $g, $b) {
  if ($g -le $r) { return $false }
  if ($g -le $b) { return $false }
  if ($g -lt 90) { return $false }
  return (($g - $r) + ($g - $b)) -gt 80
}

# Soft despill: clamp green channel toward max(r,b) for tinted edge pixels.
function Despill($r, $g, $b) {
  $cap = [Math]::Max($r, $b) + 25
  if ($g -gt $cap) { return $cap }
  return $g
}

# Find 2 split columns (gaps between the 3 icon blobs). Walks column densities,
# finds the longest empty runs that aren't at the edges.
function Find-Splits($strip) {
  $w = $strip.Width; $h = $strip.Height
  $isContent = New-Object bool[] $w
  for ($x = 0; $x -lt $w; $x++) {
    $count = 0
    for ($y = 0; $y -lt $h; $y += 4) {  # sample every 4th row for speed
      $p = $strip.GetPixel($x, $y)
      if (-not (Is-Green $p.R $p.G $p.B)) { $count++ }
    }
    $isContent[$x] = ($count -ge 2)
  }

  # Find empty runs (gaps). Each gap = (startX, endX).
  # Use ArrayList of PSCustomObject to avoid PS5.1's unary-comma quirk with
  # arithmetic-containing array literals.
  $gaps = New-Object System.Collections.ArrayList
  $inGap = $true; $gapStart = 0
  for ($x = 0; $x -lt $w; $x++) {
    if (-not $isContent[$x]) {
      if (-not $inGap) { $inGap = $true; $gapStart = $x }
    } else {
      if ($inGap) {
        $inGap = $false
        if ($gapStart -gt 0) {
          $endX = $x - 1
          [void]$gaps.Add([PSCustomObject]@{ Start = $gapStart; End = $endX })
        }
      }
    }
  }

  $candidates = @($gaps | Where-Object {
    $mid = ($_.Start + $_.End) / 2
    ($mid -gt $w * 0.15) -and ($mid -lt $w * 0.85)
  } | Sort-Object { -($_.End - $_.Start) })

  if ($candidates.Count -lt 2) {
    Write-Warning ('Only ' + $candidates.Count + ' gap(s) found - falling back to equal thirds.')
    $t = [int]($w / 3)
    return @($t, 2 * $t)
  }

  $top2 = @($candidates | Select-Object -First 2 | Sort-Object { ($_.Start + $_.End) / 2 })
  $split1 = [int]((($top2[0].Start) + ($top2[0].End)) / 2)
  $split2 = [int]((($top2[1].Start) + ($top2[1].End)) / 2)
  return @($split1, $split2)
}

foreach ($entry in $map) {
  $srcPath = Join-Path $srcDir $entry.src
  Write-Output "Processing $($entry.src) -> $($entry.family)_{1..3}.png"
  $strip = [System.Drawing.Bitmap]::new($srcPath)
  $w = $strip.Width; $h = $strip.Height

  $splits = Find-Splits $strip
  Write-Output "  splits at x=$($splits[0]), x=$($splits[1])"

  $tiles = @(
    @{ x = 0;           w = $splits[0] },
    @{ x = $splits[0];  w = $splits[1] - $splits[0] },
    @{ x = $splits[1];  w = $w - $splits[1] }
  )

  # Some strips have a baked-in text label in the bottom band; yMaxPct caps the
  # row range that counts toward content bounds so labels get cropped off.
  $yContentMax = [int]($h * $entry.yMaxPct)

  for ($i = 0; $i -lt 3; $i++) {
    $xOff = $tiles[$i].x
    $tw   = $tiles[$i].w
    $tile = [System.Drawing.Bitmap]::new($tw, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $minX = $tw; $minY = $h; $maxX = -1; $maxY = -1
    for ($y = 0; $y -lt $h; $y++) {
      for ($x = 0; $x -lt $tw; $x++) {
        $p = $strip.GetPixel($xOff + $x, $y)
        if (Is-Green $p.R $p.G $p.B) {
          $tile.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
          $g2 = Despill $p.R $p.G $p.B
          $tile.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($p.A, $p.R, $g2, $p.B))
          # Pixels below yContentMax (i.e. baked label area) still get keyed/
          # despilled, but they do NOT widen the bounding box, so the final crop
          # excludes them.
          if ($y -lt $yContentMax) {
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
          }
        }
      }
    }

    $margin = 12
    $cx = [Math]::Max(0, $minX - $margin)
    $cy = [Math]::Max(0, $minY - $margin)
    $cw = [Math]::Min($tw - $cx, $maxX - $minX + 1 + 2 * $margin)
    $ch = [Math]::Min($h  - $cy, $maxY - $minY + 1 + 2 * $margin)
    $rect = [System.Drawing.Rectangle]::new($cx, $cy, $cw, $ch)
    $cropped = $tile.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $outPath = Join-Path $dstDir ("{0}_{1}.png" -f $entry.family, ($i + 1))
    $cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output ('  ' + $outPath + ' (' + $cw + 'x' + $ch + ')')

    $tile.Dispose()
    $cropped.Dispose()
  }
  $strip.Dispose()
}
Write-Output "Done."
