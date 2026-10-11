import fs from 'node:fs';
import path from 'node:path';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// setup.sh writes .remotion-browser when Remotion's own Chrome Headless Shell
// download is unavailable and a local Chromium was found instead.
// REMOTION_BROWSER_EXECUTABLE overrides it.
const browserFile = path.join(process.cwd(), '.remotion-browser');
const browser =
  process.env.REMOTION_BROWSER_EXECUTABLE ||
  (fs.existsSync(browserFile) ? fs.readFileSync(browserFile, 'utf8').trim() : '');
if (browser) {
  Config.setBrowserExecutable(browser);
}
