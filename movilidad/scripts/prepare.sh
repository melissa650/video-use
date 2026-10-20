#!/usr/bin/env bash
# Intermedios SOLO para la vista previa en Remotion Studio y `npm run render-remotion-only`.
# El render final (npm run render) y las portadas (npm run cover) leen directamente el original.
#   hq.mp4         → original HDR (HLG) → SDR BT.709 a 30 fps, escalado ×1,5
#   last_frame.png → fotograma congelado del cierre (0:33,80)
set -euo pipefail
cd "$(dirname "$0")/../public"
TONEMAP="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:param=0.3:desat=0,zscale=t=bt709:m=bt709:r=tv:d=error_diffusion,format=yuv420p"
ffmpeg -v error -y -i movilidad_original.mov \
  -vf "fps=30,$TONEMAP,scale=1620:2880:flags=lanczos,unsharp=5:5:0.6:3:3:0" \
  -c:v libx264 -crf 12 -preset slow -g 10 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -an hq.mp4
ffmpeg -v error -y -i hq.mp4 -vf "select=eq(n\,1014)" -frames:v 1 last_frame.png
