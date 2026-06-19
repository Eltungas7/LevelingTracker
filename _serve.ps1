$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$port = 8765
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"
$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.svg'  = 'image/svg+xml'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.ttf'  = 'font/ttf'
  '.otf'  = 'font/otf'
  '.txt'  = 'text/plain; charset=utf-8'
}
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($rel -eq '/' -or $rel -eq '') { $rel = '/index.html' }
      $path = Join-Path $root ($rel.TrimStart('/'))
      if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }
      if (Test-Path $path -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($path).ToLower()
        $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $ctx.Response.ContentType = $ct
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $ctx.Response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found: $rel")
        $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
      }
    } catch {
      $ctx.Response.StatusCode = 500
      $msg = [System.Text.Encoding]::UTF8.GetBytes("Error: $_")
      try { $ctx.Response.OutputStream.Write($msg, 0, $msg.Length) } catch {}
    } finally {
      $ctx.Response.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop(); $listener.Close()
}
