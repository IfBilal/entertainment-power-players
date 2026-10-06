// Node built-ins typed inline: the app tsconfig does not include @types/node.
const { readdirSync, readFileSync, statSync } = require('fs') as {
  readdirSync: (dir: string) => string[];
  readFileSync: (file: string, encoding: 'utf8') => string;
  statSync: (path: string) => { isDirectory: () => boolean };
};
import { categoryPalette } from '../theme/accents';
import { colors } from '../theme/colors';

// Supervisor brief (white, centred, minimal, no people, one ® per full brand
// lockup). These checks pin the rules so a later edit cannot quietly bring back
// the dark mockup palette or a human image.

const srcRoot = `${process.cwd()}/src`;
const join = (...parts: string[]) => parts.join('/');
const relative = (from: string, to: string) => to.slice(from.length + 1);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry: string) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrastOnWhite(hex: string): number {
  return (1 + 0.05) / (luminance(hex) + 0.05);
}

describe('light theme contract', () => {
  const files = sourceFiles(srcRoot);

  it('uses a white canvas and surface tokens', () => {
    expect(colors.background).toBe('#FFFFFF');
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.backgroundDeep).toBe('#FFFFFF');
  });

  it('keeps text and brand accents readable on white (WCAG AA 4.5:1)', () => {
    for (const token of ['textPrimary', 'textSecondary', 'textTertiary', 'accent', 'accentOrange', 'danger'] as const) {
      expect({ token, passes: contrastOnWhite(colors[token]) >= 4.5 }).toEqual({ token, passes: true });
    }
  });

  it('limits the five category palettes to the approved slugs and light fills', () => {
    expect(Object.keys(categoryPalette).sort()).toEqual(['fashion', 'film-tv', 'gaming', 'music', 'sports']);
    for (const [slug, { fill, glyph }] of Object.entries(categoryPalette)) {
      expect({ slug, fillLuminance: luminance(fill) > 0.8 }).toEqual({ slug, fillLuminance: true });
      expect({ slug, glyphContrast: contrastOnWhite(glyph) >= 4.5 }).toEqual({ slug, glyphContrast: true });
    }
  });

  it('has no dark literal background colours in feature or component code', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/backgroundColor:\s*'#([0-9A-Fa-f]{6})'/g)) {
        if (luminance(match[1]) < 0.5) offenders.push(`${relative(srcRoot, file)}: #${match[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('does not render the retired dark aurora layer or human photo assets', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      const rel = relative(srcRoot, file);
      if (/from '.*\/Aurora'|<Aurora\b|aurora=/.test(text)) offenders.push(`${rel}: aurora`);
      if (/\.(jpe?g)['"]\)/.test(text)) offenders.push(`${rel}: jpeg require`);
    }
    expect(offenders).toEqual([]);
  });

  it('puts a single ® after every visible full brand name', () => {
    const offenders: string[] = [];
    for (const file of files) {
      // Comments are not visible text, so only code lines and JSX strings count.
      const text = readFileSync(file, 'utf8').split('\n').filter((line: string) => !/^\s*(\/\/|\/?\*)/.test(line)).join('\n');
      for (const match of text.matchAll(/(ENTERTAINMENT POWER PLAYERS|Entertainment Power Players)(®?)/g)) {
        if (match[2] !== '®') offenders.push(`${relative(srcRoot, file)}: "${match[1]}" missing ®`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
