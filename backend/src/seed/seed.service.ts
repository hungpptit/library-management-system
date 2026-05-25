import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type SeedDef = {
  id: string;
  route: string;
  method: string;
  type: string;
  message?: string;
  probability?: number;
  severity?: string;
};

@Injectable()
export class SeedService {
  private seeds: SeedDef[] = [];

  constructor() {
    try {
      const p = path.join(process.cwd(), 'backend', 'seeded-errors.json');
      const raw = fs.readFileSync(p, 'utf8');
      this.seeds = JSON.parse(raw) as SeedDef[];
    } catch (e) {
      this.seeds = [];
    }
  }

  getAll(): SeedDef[] {
    return this.seeds;
  }

  match(route: string, method: string): SeedDef[] {
    const m = method.toUpperCase();
    return this.seeds.filter((s) => {
      const regex = new RegExp(s.route);
      return (s.method || 'GET').toUpperCase() === m && regex.test(route);
    });
  }
}
