
$output = @(); $log = @()

$LEVEL_BANDS = @(
  @{rank='E';from=1;to=10;xpPL=1200},@{rank='D';from=11;to=20;xpPL=1800},
  @{rank='C';from=21;to=35;xpPL=2400},@{rank='B';from=36;to=50;xpPL=3200},
  @{rank='A';from=51;to=69;xpPL=3200},@{rank='S';from=70;to=84;xpPL=9200},
  @{rank='SS';from=85;to=94;xpPL=15600},@{rank='SSS';from=95;to=99;xpPL=32000}
)
$STAT_TIERS = @(
  @{t='F';min=0},@{t='E';min=80},@{t='D';min=270},@{t='C';min=600},
  @{t='B';min=1500},@{t='A';min=2800},@{t='S';min=5000},@{t='SS';min=7000},@{t='SSS';min=8750}
)

function GetLevel($xp) {
  $lv = 1; $rem = $xp
  foreach ($b in $LEVEL_BANDS) {
    for ($i = $b.from; $i -le $b.to; $i++) {
      if ($rem -ge $b.xpPL) { $rem -= $b.xpPL; $lv = $i + 1 } else { return $lv }
    }
  }
  return [math]::Min($lv, 99)
}
function GetLvRank($lv) {
  foreach ($b in $LEVEL_BANDS) { if ($lv -ge $b.from -and $lv -le $b.to) { return $b.rank } }
  return 'SSS'
}
function GetStatTier($tot) {
  $t = 'F'
  foreach ($s in $STAT_TIERS) { if ($tot -ge $s.min) { $t = $s.t } }
  return $t
}
function StatBonus($lv) { if ($lv % 10 -eq 0) { return 10 }; return 1 }

# --- Habit data ---
$dailyXP = 460
$dailyStats = @{STR=6;DEX=6;CON=8;INT=11;VOL=9;CHA=6}
$weeklyXP   = 1610
$weeklyStats= @{STR=28;DEX=35;CON=28;INT=7;VOL=21;CHA=42}
$avoidDXP   = 50
$avoidDS    = @{VOL=3;INT=1}
$avoidMS    = @{
  7  = @{xp=75;  s=@{VOL=8}};
  14 = @{xp=150; s=@{VOL=12;INT=5}};
  30 = @{xp=350; s=@{VOL=20;INT=10;CHA=8}};
  60 = @{xp=700; s=@{VOL=30;INT=15;CHA=12;STR=5}};
  90 = @{xp=1200;s=@{VOL=40;INT=20;CHA=18;STR=10}}
}

# --- Class data ---
$CLS = [ordered]@{
  knight    =@{t=1;stats=@('STR');        mult=1.10;thr=150; reqLv=1;  qD=@{STR=3};          qW=@{STR=12};         qO=@{STR=20};              otT=10;mpD=5; mpW=25;mpO=60; mr=15}
  rogue     =@{t=1;stats=@('DEX');        mult=1.10;thr=150; reqLv=1;  qD=@{DEX=3};          qW=@{DEX=12};         qO=@{DEX=20};              otT=10;mpD=5; mpW=25;mpO=60; mr=15}
  guardian  =@{t=1;stats=@('CON');        mult=1.10;thr=150; reqLv=1;  qD=@{CON=3};          qW=@{CON=12};         qO=@{CON=20};              otT=7; mpD=5; mpW=25;mpO=60; mr=15}
  mage      =@{t=1;stats=@('INT');        mult=1.10;thr=150; reqLv=1;  qD=@{INT=3};          qW=@{INT=12};         qO=@{INT=20};              otT=10;mpD=5; mpW=25;mpO=60; mr=15}
  monk      =@{t=1;stats=@('VOL');        mult=1.10;thr=150; reqLv=1;  qD=@{VOL=3};          qW=@{VOL=12};         qO=@{VOL=20};              otT=10;mpD=5; mpW=25;mpO=60; mr=15}
  bard      =@{t=1;stats=@('CHA');        mult=1.10;thr=150; reqLv=1;  qD=@{CHA=3};          qW=@{CHA=12};         qO=@{CHA=20};              otT=10;mpD=5; mpW=25;mpO=60; mr=15}
  paladin   =@{t=2;stats=@('STR','VOL');  mult=1.12;thr=700; reqLv=40; qD=@{STR=4;VOL=3};    qW=@{STR=15;VOL=10};  qO=@{STR=25;VOL=18};       otT=7; mpD=8; mpW=35;mpO=80; mr=20}
  duelist   =@{t=2;stats=@('DEX','STR');  mult=1.12;thr=700; reqLv=40; qD=@{DEX=4;STR=3};    qW=@{DEX=12;STR=12};  qO=@{DEX=20;STR=20};       otT=7; mpD=8; mpW=35;mpO=80; mr=20}
  sentinel  =@{t=2;stats=@('CON','STR');  mult=1.12;thr=700; reqLv=40; qD=@{CON=4;STR=3};    qW=@{CON=12;STR=12};  qO=@{CON=20;STR=20};       otT=7; mpD=8; mpW=35;mpO=80; mr=20}
  archmage  =@{t=2;stats=@('INT','VOL');  mult=1.12;thr=700; reqLv=40; qD=@{INT=4;VOL=3};    qW=@{INT=12;VOL=12};  qO=@{INT=20;VOL=20};       otT=7; mpD=8; mpW=35;mpO=80; mr=20}
  crusader  =@{t=2;stats=@('VOL','STR');  mult=1.12;thr=700; reqLv=40; qD=@{VOL=4;STR=3};    qW=@{VOL=12;STR=12};  qO=@{VOL=20;STR=20};       otT=7; mpD=8; mpW=35;mpO=80; mr=20}
  enchanter =@{t=2;stats=@('CHA','DEX');  mult=1.12;thr=700; reqLv=40; qD=@{CHA=4;DEX=3};    qW=@{CHA=12;DEX=12};  qO=@{CHA=20;DEX=20};       otT=7; mpD=8; mpW=35;mpO=80; mr=20}
  templar   =@{t=3;stats=@('STR','VOL','CON');   mult=1.15;thr=2000;reqLv=60;qD=@{STR=4;VOL=4;CON=3}; qW=@{STR=15;VOL=15;CON=12};qO=@{STR=25;VOL=25;CON=20};otT=7;mpD=12;mpW=55;mpO=120;mr=30}
  assassin  =@{t=3;stats=@('DEX','STR','INT');   mult=1.15;thr=2000;reqLv=60;qD=@{DEX=4;STR=3;INT=3}; qW=@{DEX=15;STR=12;INT=12};qO=@{DEX=25;STR=20;INT=20};otT=7;mpD=12;mpW=55;mpO=120;mr=30}
  iron_warden=@{t=3;stats=@('CON','STR','DEX');  mult=1.15;thr=2000;reqLv=60;qD=@{CON=4;STR=3;DEX=3}; qW=@{CON=15;STR=12;DEX=12};qO=@{CON=25;STR=20;DEX=20};otT=7;mpD=12;mpW=55;mpO=120;mr=30}
  loremaster=@{t=3;stats=@('INT','VOL','CHA');   mult=1.15;thr=2000;reqLv=60;qD=@{INT=4;VOL=3;CHA=3}; qW=@{INT=15;VOL=12;CHA=12};qO=@{INT=25;VOL=20;CHA=20};otT=7;mpD=12;mpW=55;mpO=120;mr=30}
  warlord   =@{t=3;stats=@('VOL','STR','INT');   mult=1.15;thr=2000;reqLv=60;qD=@{VOL=4;STR=3;INT=3}; qW=@{VOL=15;STR=12;INT=12};qO=@{VOL=25;STR=20;INT=20};otT=7;mpD=12;mpW=55;mpO=120;mr=30}
  herald    =@{t=3;stats=@('CHA','DEX','CON');   mult=1.15;thr=2000;reqLv=60;qD=@{CHA=4;DEX=3;CON=3}; qW=@{CHA=15;DEX=12;CON=12};qO=@{CHA=25;DEX=20;CON=20};otT=7;mpD=12;mpW=55;mpO=120;mr=30}
}
$CQ = @('knight','rogue','guardian','mage','monk','bard','paladin','duelist','sentinel','archmage','crusader','enchanter','templar','assassin','iron_warden','loremaster','warlord','herald')

# Achievement tiers
$DAILY_ACH = @(@{n=1;r=1},@{n=10;r=1},@{n=30;r=2},@{n=100;r=4},@{n=200;r=7},@{n=365;r=13})
$WEEK_ACH  = @(@{n=1;r=1},@{n=3;r=2},@{n=10;r=3},@{n=25;r=5},@{n=50;r=11})
$RANK_ACH  = @{1=1;11=1;21=2;36=3;51=4;70=5;85=7;95=9}
$IRON_T    = @(@{n=3;r=5},@{n=7;r=10},@{n=14;r=20},@{n=30;r=35},@{n=60;r=50})
$STR_T     = @(@{n=3;r=1},@{n=7;r=2},@{n=14;r=4},@{n=30;r=6},@{n=100;r=8})
$PW_T      = @(@{n=1;r=2},@{n=3;r=5},@{n=5;r=8},@{n=10;r=10},@{n=20;r=15})
$PD_T      = @(@{n=1;r=1},@{n=10;r=1},@{n=30;r=2},@{n=100;r=4},@{n=365;r=5})
$HF_T      = @(@{n=50;r=1},@{n=200;r=3},@{n=500;r=6},@{n=1000;r=10},@{n=2500;r=15})
$SM_T      = @(@{n=100;r=1},@{n=300;r=2},@{n=500;r=3},@{n=1000;r=4},@{n=2000;r=5})
$BAL_T     = @(@{n=100;r=1},@{n=500;r=3},@{n=2000;r=7})
$MAST_ACH  = @{1=1;2=2;3=3}

# State
$s = @{
  STR=0;DEX=0;CON=0;INT=0;VOL=0;CHA=0;xp=0;level=1
  eq=$null;mp=@{};mastered=@{};qi=0
  hc=@{};wc=@{};sessions=@{};otDone=@{};claimed=@{}
  ironStrk=0;streak=0;pd=0;pw=0;hf=0
}
$STAT_KEYS = @('STR','DEX','CON','INT','VOL','CHA')
$WEEK_IDS  = @('w0','w1','w2','w3','w4')
$HABIT_IDS = @('wake7am','hydration','walk','meditation','training','journal','gratitude','dishes','bed','reading','stretching','phone')

function AS($h) { foreach ($k in $h.Keys) { $s[$k] += $h[$k] } }
function AX($v) { $s.xp += $v }
function Award($r) {
  foreach ($k in $STAT_KEYS) { $s[$k] += $r }
  $s.xp += $r * 6 * 10
}
function ChkTiers($count, $tiers, $prefix, $day) {
  foreach ($t in $tiers) {
    $key = "${prefix}_$($t.n)"
    if ($count -ge $t.n -and -not $s.claimed[$key]) {
      $s.claimed[$key] = $true
      Award($t.r)
      if ($t.r -ge 4) { $script:log += "Day ${day}: Achievement [${prefix}] x$($t.r) each stat at count $($t.n)" }
    }
  }
}
function TryEquip($day) {
  if ($s.qi -ge $CQ.Count) { return }
  $nid = $CQ[$s.qi]
  $c = $CLS[$nid]
  if ($s.level -lt $c.reqLv) { return }
  if ($c.t -ge 2) {
    $ok = $false
    foreach ($mid in $s.mastered.Keys) {
      if ($CLS[$mid].t -eq ($c.t - 1)) {
        foreach ($sk in $c.stats) {
          if ($CLS[$mid].stats -contains $sk) { $ok = $true }
        }
      }
    }
    if (-not $ok) { return }
  }
  $s.eq = $nid
  if (-not $s.mp[$nid]) { $s.mp[$nid] = 0.0 }
  $script:log += "Day ${day}: >> Equipped $($nid.ToUpper()) [T$($c.t)] — need $($c.thr) MP"
}

# --- Kickoff ---
Award(1)
$log += "Day 1: System Online — +6 all stats"

# --- Main loop ---
for ($day = 1; $day -le 365; $day++) {
  $wk   = [math]::Ceiling($day / 7)
  $isWk = ($day % 7 -eq 0)

  # Daily habits
  AX($dailyXP)
  AS($dailyStats)
  $s.streak++
  $s.ironStrk++
  $s.pd++
  $s.hf += 12
  foreach ($h in $HABIT_IDS) { $s.hc[$h] = ([int]$s.hc[$h]) + 1 }

  # Avoid habit
  AX($avoidDXP)
  AS($avoidDS)
  if ($avoidMS.ContainsKey($day)) {
    $m = $avoidMS[$day]
    AX($m.xp)
    AS($m.s)
    $log += "Day ${day}: Stay-Clean $day-day milestone! +$($m.xp) XP"
  }

  # Weekly habits
  if ($isWk) {
    AX($weeklyXP)
    AS($weeklyStats)
    $s.pw++
    $s.hf += 5
    foreach ($w in $WEEK_IDS) { $s.wc[$w] = ([int]$s.wc[$w]) + 1 }
  }

  # Class logic
  if ($s.eq) {
    $c   = $CLS[$s.eq]
    $cid = $s.eq

    # Daily quest stats + XP
    $dqXP = 0
    foreach ($sk in $c.qD.Keys) { $s[$sk] += $c.qD[$sk]; $dqXP += $c.qD[$sk] }
    AX($dqXP * 10)

    # Session tracking / onetime
    $s.sessions[$cid] = ([int]$s.sessions[$cid]) + 1
    if ($s.sessions[$cid] -ge $c.otT -and -not $s.otDone[$cid]) {
      $s.otDone[$cid] = $true
      $otXP = 0
      foreach ($sk in $c.qO.Keys) { $s[$sk] += $c.qO[$sk]; $otXP += $c.qO[$sk] }
      AX($otXP * 10)
      $log += "Day ${day}: $($cid.ToUpper()) onetime quest complete!"
    }

    # Weekly quest
    if ($isWk) {
      $wqXP = 0
      foreach ($sk in $c.qW.Keys) { $s[$sk] += $c.qW[$sk]; $wqXP += $c.qW[$sk] }
      AX($wqXP * 10)
    }

    # Mastery points
    $mp = 0.0
    foreach ($sk in $c.stats) {
      $base = $dailyStats[$sk]
      if ($avoidDS.ContainsKey($sk)) { $base += $avoidDS[$sk] }
      $mp += $base * $c.mult + $c.qD[$sk]
    }
    $mp += $c.mpD
    if ($isWk) {
      foreach ($sk in $c.stats) { $mp += $c.qW[$sk] }
      $mp += $c.mpW
    }
    $s.mp[$cid] += $mp

    # Mastery check
    if ($s.mp[$cid] -ge $c.thr -and -not $s.mastered.ContainsKey($cid)) {
      $s.mastered[$cid] = $day
      foreach ($sk in $STAT_KEYS) { $s[$sk] += $c.mr }
      AX($c.mr * 6 * 10)
      $mar = $MAST_ACH[$c.t]
      if ($mar) { Award($mar) }
      $log += "Day ${day} [Wk${wk}]: *** MASTERED $($cid.ToUpper()) (T$($c.t)) *** +$($c.mr) all stats"
      $s.qi++
      $s.eq = $null
      TryEquip $day
    }
  } else {
    TryEquip $day
  }

  # Level up
  $nl = GetLevel($s.xp)
  if ($nl -gt $s.level) {
    for ($lv = ($s.level + 1); $lv -le $nl; $lv++) {
      $b = StatBonus($lv)
      foreach ($sk in $STAT_KEYS) { $s[$sk] += $b }
      if ($lv % 5 -eq 0) { $log += "Day ${day}: Level $lv reached! [$(GetLvRank $lv)]" }
    }
    $s.level = $nl
  }

  # Rank achievements
  foreach ($rlv in $RANK_ACH.Keys) {
    $key = "rank_${rlv}"
    if ($s.level -ge $rlv -and -not $s.claimed[$key]) {
      $s.claimed[$key] = $true
      Award($RANK_ACH[$rlv])
      $log += "Day ${day}: RANK ACHIEVEMENT — Rank $(GetLvRank $s.level)! +$($RANK_ACH[$rlv]*6) stats"
    }
  }

  # Other achievements
  foreach ($h in $HABIT_IDS)  { ChkTiers ([int]$s.hc[$h])  $DAILY_ACH "dh_$h" $day }
  foreach ($w in $WEEK_IDS)   { ChkTiers ([int]$s.wc[$w])  $WEEK_ACH  "wh_$w" $day }
  ChkTiers $s.ironStrk $IRON_T "iron"   $day
  ChkTiers $s.streak   $STR_T  "streak" $day
  ChkTiers $s.pw       $PW_T   "pw"     $day
  ChkTiers $s.pd       $PD_T   "pd"     $day
  ChkTiers $s.hf       $HF_T   "hf"     $day
  foreach ($sk in $STAT_KEYS) { ChkTiers ([int]$s[$sk]) $SM_T "sm_$sk" $day }

  # Balance achievements
  $minSt = ($STAT_KEYS | ForEach-Object { [int]$s[$_] } | Measure-Object -Minimum).Minimum
  foreach ($b in $BAL_T) {
    $key = "bal_$($b.n)"
    if ($minSt -ge $b.n -and -not $s.claimed[$key]) {
      $s.claimed[$key] = $true
      Award($b.r)
      $log += "Day ${day}: BALANCE — all stats >= $($b.n)! +$($b.r*6) stats"
    }
  }

  # Monthly snapshot
  $totSt = 0; foreach ($sk in $STAT_KEYS) { $totSt += $s[$sk] }
  if ($day -in @(30,60,91,122,152,182,213,244,274,305,335,365)) {
    $eq   = if ($s.eq) { $s.eq.ToUpper() } else { "(waiting Lv gate)" }
    $mpS  = if ($s.eq) { "$([math]::Round($s.mp[$s.eq]))/$($CLS[$s.eq].thr)" } else { "" }
    $output += [PSCustomObject]@{
      Day      = "Day $day"
      Level    = "Lv$($s.level) [$(GetLvRank $s.level)]"
      StatTier = GetStatTier($totSt)
      TotalSt  = $totSt
      STR      = [int]$s.STR; DEX=[int]$s.DEX; CON=[int]$s.CON
      INT      = [int]$s.INT; VOL=[int]$s.VOL; CHA=[int]$s.CHA
      Mastered = $s.mastered.Count
      Class    = $eq
      MP       = $mpS
    }
  }
}

$totSt = 0; foreach ($sk in $STAT_KEYS) { $totSt += [int]$s[$sk] }

Write-Host "==============================="
Write-Host "  YEAR-1 PERFECT PLAY SIM"
Write-Host "==============================="
$output | Format-Table -AutoSize

Write-Host ""
Write-Host "=== KEY EVENTS ==="
$log | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== YEAR-END STATE (Day 365) ==="
Write-Host "Level:       Lv$($s.level) [$(GetLvRank $s.level)]"
Write-Host "Stat Tier:   $(GetStatTier $totSt) (total $totSt)"
Write-Host "STR:$($s.STR)  DEX:$($s.DEX)  CON:$($s.CON)  INT:$($s.INT)  VOL:$($s.VOL)  CHA:$($s.CHA)"
Write-Host "Total XP:    $([math]::Round($s.xp))"
Write-Host "Classes:     $($s.mastered.Count) mastered"
if ($s.eq) {
  Write-Host "Equipped:    $($s.eq.ToUpper()) — $([math]::Round($s.mp[$s.eq]))/$($CLS[$s.eq].thr) MP"
}
