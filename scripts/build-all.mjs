// Baut alle Kartendaten neu: node scripts/build-all.mjs [--check]
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const mapshaper = path.join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper');
const run = (...args) => execFileSync(process.execPath, args, { stdio: 'inherit', cwd: ROOT });

run('scripts/01-extract.mjs');
run(mapshaper, 'build/01-cshapes-subset.geojson', '-simplify', '35%', 'keep-shapes', '-o', 'build/02-simplified.geojson', 'precision=0.0001');
run('scripts/04-base.mjs');
run('scripts/02-patch.mjs', ...process.argv.slice(2));
run('scripts/03-finalize.mjs');
run('scripts/05-overlays.mjs');
run('scripts/06-events.mjs');
