import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

@Injectable()
export class LoggingService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'backend', 'seed-logs');
    ensureDir(this.baseDir);
  }

  appendActivation(entry: any) {
    const p = path.join(this.baseDir, 'seeded_activations.log');
    fs.appendFileSync(p, JSON.stringify(entry) + '\n');
  }

  appendError(entry: any) {
    const p = path.join(this.baseDir, 'errors.log');
    fs.appendFileSync(p, JSON.stringify(entry) + '\n');
  }

  writeReport(text: string) {
    const p = path.join(this.baseDir, 'report.md');
    fs.writeFileSync(p, text, 'utf8');
  }
}
