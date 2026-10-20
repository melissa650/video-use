#!/usr/bin/env bash
# Render final de máxima calidad → out/movilidad_final.mp4
#  1. Fondo con ffmpeg directamente desde el original HDR (scripts/background.mjs)
#  2. Gráficos de Remotion en PNG con transparencia (sin pérdidas)
#  3. Composición en RGB y codificación H.264 etiquetada BT.709 (colores correctos en móvil/Instagram)
# Si existe public/music.mp3 se añade con fundidos y al 60 %.
set -euo pipefail
cd "$(dirname "$0")/.."
FPS=30
node --experimental-strip-types --no-warnings scripts/background.mjs
rm -rf out/work/overlays
npx remotion render Movilidad out/work/overlays --sequence --image-format=png \
  --props='{"withFootage":false}' --log=error

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/work/bg.mp4)
AUDIO_IN=() ; AUDIO_MAP=() ; AUDIO_FILTER=""
if [[ -f public/music.mp3 ]]; then
  AUDIO_IN=(-i public/music.mp3)
  AUDIO_FILTER=";[2:a]atrim=0:${DUR},afade=t=in:d=1,afade=t=out:st=$(echo "$DUR - 2" | bc):d=2,volume=0.6[a]"
  AUDIO_MAP=(-map '[a]' -c:a aac -b:a 192k)
else
  echo "Aviso: no hay public/music.mp3, el vídeo sale sin audio."
fi

ffmpeg -v error -y -i out/work/bg.mp4 -framerate $FPS -i out/work/overlays/element-%04d.png "${AUDIO_IN[@]}" \
  -filter_complex "[0:v]scale=in_color_matrix=bt709:in_range=tv,format=gbrp[b];[1:v]format=gbrap[o];\
[b][o]overlay=format=gbrp:shortest=1,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p[v]${AUDIO_FILTER}" \
  -map '[v]' "${AUDIO_MAP[@]}" \
  -c:v libx264 -preset slow -crf 15 -profile:v high -level:v 4.2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -movflags +faststart out/movilidad_final.mp4
echo "ok out/movilidad_final.mp4"
