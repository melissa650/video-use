#!/usr/bin/env bash
# Vista previa para Remotion Studio (npm run dev): clips en SDR a 30 fps y el fotograma del cierre.
# El render final (npm run render) lee directamente los originales de public/clips.
set -euo pipefail
cd "$(dirname "$0")/../public"
mkdir -p preview
TONEMAP="zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:param=0.3:desat=0,zscale=t=bt709:m=bt709:r=tv:d=error_diffusion,format=yuv420p"
for f in clips/*.mov; do
  n=$(basename "$f" .mov)
  ffmpeg -v error -y -i "$f" -vf "fps=30,$TONEMAP" -c:v libx264 -crf 16 -preset fast -g 10 -an \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 preview/$n.mp4
done
# Cierre: IMG_9385 a 0:08,6
ffmpeg -v error -y -ss 8.6 -i clips/IMG_9385.mov -frames:v 1 -vf "$TONEMAP" preview/outro.png
