// Baut alle Kartendaten neu: node scripts/build-all.mjs [--check]
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const mapshaper = path.join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper');
const run = (...args) => execFileSync(process.execPath, args, { stdio: 'inherit', cwd: ROOT });

// Schwerpunktregion Nahost (Ägypten, Syrien, Libanon, Jordanien, Palästina/Israel, Gaza,
// Westjordanland) in voller Auflösung, alles andere auf 35 % der Stützpunkte vereinfacht
const FULL_DETAIL = [651, 652, 660, 663, 665, 666, 6511, 6631];

run('scripts/01-extract.mjs');
run(mapshaper, 'build/01-cshapes-subset.geojson',
  '-simplify', 'variable', `percentage=[${FULL_DETAIL}].indexOf(gw) > -1 ? 1 : 0.35`, 'keep-shapes',
  '-o', 'build/02-simplified.geojson', 'precision=0.0001');
run('scripts/04-base.mjs');
run('scripts/02-patch.mjs', ...process.argv.slice(2));
run('scripts/03-finalize.mjs');
run('scripts/05-overlays.mjs');
run('scripts/06-events.mjs');
run('scripts/07-nahost.mjs');
run('scripts/08-admin.mjs');
