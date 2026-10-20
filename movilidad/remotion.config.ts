import {Config} from '@remotion/cli/config';

// PNG sin pérdidas para cada fotograma (máxima calidad antes de codificar)
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(14);
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Navegador propio opcional (p. ej. REMOTION_BROWSER=/ruta/headless_shell). Sin la variable,
// Remotion descarga y usa su propio Chrome Headless Shell.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
