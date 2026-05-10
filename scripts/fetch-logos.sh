#!/usr/bin/env bash
# Bootstraps brand logos into public/logos/ using Google's S2 favicon service.
# Re-run any time domains change in src/bracket.js.
set -u
cd "$(dirname "$0")/.." || exit 1
mkdir -p public/logos

DOMAINS=(
  in-n-out.com shakeshack.com fiveguys.com wendys.com bk.com whataburger.com mcdonalds.com culvers.com
  chick-fil-a.com popeyes.com raisingcanes.com kfc.com wingstop.com buffalowildwings.com jackinthebox.com pandaexpress.com
  chipotle.com tacobell.com subway.com jerseymikes.com qdoba.com panerabread.com dominos.com papajohns.com
  olivegarden.com thecheesecakefactory.com texasroadhouse.com applebees.com chilis.com ihop.com wafflehouse.com pizzahut.com
)

for d in "${DOMAINS[@]}"; do
  out="public/logos/$d.png"
  if curl -fsSL "https://www.google.com/s2/favicons?domain=$d&sz=128" -o "$out" && [ -s "$out" ]; then
    echo "ok:   $d ($(wc -c < "$out" | tr -d ' ') bytes)"
  else
    echo "MISS: $d"
    rm -f "$out"
  fi
done
