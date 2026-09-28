#!/usr/bin/env bash
log=$1
while :; do
  memory=$(free -m | awk '/^Mem:/ {printf "used=%dM available=%dM/%dM", $3, $7, $2} /^Swap:/ {printf " swap=%dM", $3}')
  pressure=$(awk '/^some/ {sub("avg10=", "", $2); printf "psi10=%s", $2}' /proc/pressure/memory 2>/dev/null)
  groups=$(ps -eo rss=,args= | awk '
    $2 == "awk" {next}
    /next-server|server\.js/ {rss["server"] += $1; next}
    /ms-playwright\/webkit/ {rss["webkit"] += $1; next}
    /ms-playwright\/chromium/ {rss["chromium"] += $1; next}
    /playwright/ {rss["runner"] += $1; next}
    END {for (name in rss) printf "%s=%dM ", name, rss[name] / 1024}')
  echo "memory $(date -u +%T) $memory $pressure $groups" | tee -a "$log"
  ps -eo pid=,rss=,args= --sort=-rss | head -6 | cut -c1-160 >> "$log"
  sleep 5
done
