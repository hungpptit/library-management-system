import * as fs from 'fs';
import * as path from 'path';

function readLines(p: string): string[] {
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
}

function main() {
  const root = path.join(process.cwd(), 'backend');
  const seededPath = path.join(root, 'seeded-errors.json');
  const activationsPath = path.join(root, 'seed-logs', 'seeded_activations.log');
  const errorsPath = path.join(root, 'seed-logs', 'errors.log');

  const seeds = fs.existsSync(seededPath) ? JSON.parse(fs.readFileSync(seededPath, 'utf8')) : [];
  const N = seeds.length;

  const activationLines = readLines(activationsPath);
  const activatedIds = new Set<string>();
  for (const l of activationLines) {
    try {
      const obj = JSON.parse(l);
      if (obj && obj.seedId) activatedIds.add(obj.seedId);
    } catch (e) {}
  }
  const n = activatedIds.size;

  const errorLines = readLines(errorsPath);
  let M = 0;
  for (const l of errorLines) {
    try {
      const obj = JSON.parse(l);
      if (!obj.isSeeded) M += 1;
    } catch (e) {}
  }

  let report = `# Seed Error Report\n\n`;
  report += `- N (seeded faults inserted): ${N}\n`;
  report += `- n (seeded faults detected by tests): ${n}\n`;
  report += `- M (non-seeded real faults detected): ${M}\n\n`;

  if (n === 0) {
    report += 'Cannot compute estimate because n = 0 (no seeded faults detected).\n';
  } else {
    const Rhat = (M * (N / n));
    const remain = Rhat - M;
    report += `- Estimated total real faults R̂ = M * (N / n) = ${Rhat.toFixed(2)}\n`;
    report += `- Estimated undetected faults (Remain) = R̂ - M = ${remain.toFixed(2)}\n`;
  }

  const outPath = path.join(root, 'seed-logs', 'report.md');
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(report);
  console.log(`Wrote report to ${outPath}`);
}

main();
