import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Every visible full brand name in the admin must carry one ®.
// Comments are excluded: they are not rendered.
const srcRoot = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

describe('admin brand contract', () => {
  it('adds ® to every visible full brand name', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(srcRoot)) {
      const text = readFileSync(file, 'utf8').split('\n').filter((line) => !/^\s*(\/\/|\/?\*)/.test(line)).join('\n');
      for (const match of text.matchAll(/(ENTERTAINMENT POWER PLAYERS|Entertainment Power Players)(®?)/g)) {
        if (match[2] !== '®') offenders.push(`${relative(srcRoot, file)}: "${match[1]}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps the dark brown overlay and texture out of the stylesheet', () => {
    const css = readFileSync(join(srcRoot, 'index.css'), 'utf8');
    expect(css).not.toMatch(/34,\s*27,\s*20/);
    expect(css).not.toMatch(/radial-gradient\(circle at/);
    expect(css).not.toMatch(/--font-serif/);
  });
});
