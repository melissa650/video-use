#!/usr/bin/env bash
# Regenera los intermedios de public/ a partir de public/movilidad_comprimido.mp4:
#   graded.mp4     → exposición/contraste corregidos
#   ex1_slow.mp4   → 0:00–0:03,50 corregido y a 0,4× con interpolación (258 fotogramas)
#   last_frame.png → fotograma 1052 de graded.mp4 (congelado del cierre)
set -euo pipefail
cd "$(dirname "$0")/../public"
G="curves=all='0/0 0.05/0.065 0.18/0.27 0.4/0.52 0.7/0.79 1/1',eq=contrast=1.04:saturation=1.06"
ffmpeg -v error -y -i movilidad_comprimido.mp4 -vf "$G" -c:v libx264 -crf 12 -preset slow -g 10 -pix_fmt yuv420p -an graded.mp4
ffmpeg -v error -y -t 3.5 -i movilidad_comprimido.mp4 \
  -vf "$G,setpts=PTS/0.4,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
  -c:v libx264 -crf 12 -preset slow -g 10 -pix_fmt yuv420p -an ex1_slow.mp4
ffmpeg -v error -y -i graded.mp4 -vf "select=eq(n\,1052)" -frames:v 1 last_frame.png
