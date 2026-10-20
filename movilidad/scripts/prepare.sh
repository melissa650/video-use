#!/usr/bin/env bash
# Prepara los intermedios de public/ a partir de public/movilidad_comprimido.mp4.
# El original es HDR (HLG / BT.2020, grabado con iPhone): se convierte a SDR BT.709 con
# mapeo de tonos para mantener el color real (sin esto la piel sale blanquecina y lavada).
#   hq.mp4         → SDR BT.709, escalado ×1,5 con lanczos + enfoque suave. El zoom de
#                    Remotion (≤1,5×) solo reduce, así que la imagen no se ve borrosa.
#   last_frame.png → fotograma 1052 de hq.mp4 (congelado del cierre)
set -euo pipefail
cd "$(dirname "$0")/../public"
TONEMAP="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:param=0.3:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
ffmpeg -v error -y -i movilidad_comprimido.mp4 \
  -vf "$TONEMAP,scale=1620:2880:flags=lanczos,unsharp=5:5:0.6:3:3:0" \
  -c:v libx264 -crf 12 -preset slow -g 10 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -an hq.mp4
ffmpeg -v error -y -i hq.mp4 -vf "select=eq(n\,1052)" -frames:v 1 last_frame.png
