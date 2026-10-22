import type { ChordInfo } from '../components/constants';
import { StandardGuitar } from './chord_generator';
import { TONES, FLAT_KEY_MAPS } from './chord_generator';

export interface ChordColumn {
	chord?: string;
	lyric: string;
}

export type Line = ChordColumn[];

export interface Section {
	type: 'verse' | 'chorus' | 'bridge' | 'none' | 'comment';
	label?: string;
	lines: Line[];
}

export interface ParsedSong {
	title?: string;
	artists: string[];
	album?: string;
	key?: string;
	sections: Section[];
}

export interface ChordDefinition {
	info?: ChordInfo;
	noDiagram?: boolean;
	transposable: boolean;
}

export type DefineMap = Map<string, ChordDefinition>;

interface ParsedDefine extends ChordDefinition {
	name: string;
}

const SHARP_TO_FLAT: Record<string, string> = {
	'C#': 'Db',
	'D#': 'Eb',
	'F#': 'Gb',
	'G#': 'Ab',
	'A#': 'Bb'
};

const SECTION_ALIASES: Record<string, { type: Section['type']; end?: boolean }> = {
	start_of_verse: { type: 'verse' },
	sov: { type: 'verse' },
	end_of_verse: { type: 'verse', end: true },
	eov: { type: 'verse', end: true },
	start_of_chorus: { type: 'chorus' },
	soc: { type: 'chorus' },
	end_of_chorus: { type: 'chorus', end: true },
	eoc: { type: 'chorus', end: true },
	start_of_bridge: { type: 'bridge' },
	sob: { type: 'bridge' },
	end_of_bridge: { type: 'bridge', end: true },
	eob: { type: 'bridge', end: true }
};

export function transposeRoot(root: string, semitones: number): string {
	if (/^N\.?C\.?$/i.test(root)) return root;
	let sharpRoot = root;
	if (FLAT_KEY_MAPS[root]) sharpRoot = FLAT_KEY_MAPS[root];
	const idx = TONES.indexOf(sharpRoot);
	if (idx < 0) return root;

	const wasFlat = root.includes('b') || FLAT_KEY_MAPS[root] !== undefined;
	const newIdx = (idx + semitones + 12) % 12;
	let newRoot = TONES[newIdx];
	if (wasFlat && SHARP_TO_FLAT[newRoot]) {
		newRoot = SHARP_TO_FLAT[newRoot];
	}
	return newRoot;
}

export function transposeChordName(name: string, semitones: number): string {
	if (/^N\.?C\.?$/i.test(name)) return name;
	const slashIdx = name.indexOf('/');
	if (slashIdx > 0) {
		const main = name.slice(0, slashIdx);
		const bass = name.slice(slashIdx + 1);
		return transposeChordName(main, semitones) + '/' + transposeChordName(bass, semitones);
	}
	const match = name.match(/^([A-G])(#|b)?(.*)$/);
	if (!match) return name;
	const [, letter, acc, suffix] = match;
	return transposeRoot(letter + (acc ?? ''), semitones) + suffix;
}

function parseDirective(line: string): { name: string; arg: string } | null {
	const trimmed = line.trim();
	if (!trimmed.startsWith('{') || !trimmed.includes('}')) return null;
	const content = trimmed.slice(1, trimmed.indexOf('}')).trim();
	if (content.includes(':')) {
		const idx = content.indexOf(':');
		return { name: content.slice(0, idx).trim().toLowerCase(), arg: content.slice(idx + 1).trim() };
	}
	const parts = content.split(/\s+/);
	return { name: parts[0].toLowerCase(), arg: parts.slice(1).join(' ') };
}

function normalizeFretToken(token: string): number {
	const t = token.trim().toLowerCase();
	if (t === 'x' || t === 'n' || t === '-1' || t === '-') return -1;
	const n = parseInt(t, 10);
	return isNaN(n) ? -1 : n;
}

function normalizeFingerToken(token: string): number {
	const t = token.trim();
	const lower = t.toLowerCase();
	if (lower === 'x' || lower === '-' || lower === '0' || t === '') return 0;
	if (/^[a-zA-Z]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
	const n = parseInt(t, 10);
	return isNaN(n) || n <= 0 ? 0 : n;
}

function deriveBarres(frets: number[]): number[] {
	const fretted = frets.filter((f) => f > 0).sort((a, b) => a - b);
	if (fretted.length < 2) return [];
	const lowest = fretted[0];
	const count = fretted.filter((f) => f === lowest).length;
	return count >= 2 ? [lowest] : [];
}

function convertDefineFrets(rawFrets: number[], baseFret: number): { frets: number[]; baseFret: number } {
	const physical = rawFrets.map((f) => (f <= 0 ? f : f + baseFret - 1));
	const frettedPhys = physical.filter((p) => p > 0);
	if (frettedPhys.length === 0) {
		return { frets: rawFrets, baseFret: 0 };
	}
	const maxP = Math.max(...frettedPhys);
	const W = Math.max(baseFret, maxP - 3);
	const appFrets = physical.map((p) => (p <= 0 ? p : p - W + 1));
	return { frets: appFrets, baseFret: W };
}

function parseDefineAttributes(arg: string): {
	baseFret: number;
	frets?: number[];
	fingers?: number[];
	copyFrom?: string;
	diagramOff?: boolean;
	keys?: boolean;
} {
	const tokens = arg.split(/\s+/).filter(Boolean);
	const attrs: ReturnType<typeof parseDefineAttributes> = { baseFret: 1 };
	let i = 0;
	while (i < tokens.length) {
		const token = tokens[i].replace(/:$/, '').toLowerCase();
		if (token === 'base-fret' || token === 'base_fret') {
			attrs.baseFret = parseInt(tokens[++i], 10) || 1;
		} else if (token === 'frets') {
			const values: number[] = [];
			while (++i < tokens.length && !isAttributeName(tokens[i])) {
				values.push(normalizeFretToken(tokens[i]));
			}
			attrs.frets = values;
			continue;
		} else if (token === 'fingers') {
			const values: number[] = [];
			while (++i < tokens.length && !isAttributeName(tokens[i])) {
				values.push(normalizeFingerToken(tokens[i]));
			}
			attrs.fingers = values;
			continue;
		} else if (token === 'copy' || token === 'copyall') {
			attrs.copyFrom = tokens[++i];
		} else if (token === 'diagram') {
			attrs.diagramOff = tokens[++i]?.toLowerCase() === 'off';
		} else if (token === 'keys') {
			attrs.keys = true;
		}
		i++;
	}
	return attrs;
}

function isAttributeName(token: string): boolean {
	const t = token.replace(/:$/, '').toLowerCase();
	return [
		'base-fret',
		'base_fret',
		'frets',
		'fingers',
		'copy',
		'copyall',
		'diagram',
		'display',
		'format',
		'keys'
	].includes(t);
}

function resolveCopy(
	name: string,
	copyFrom: string,
	defines: DefineMap,
	defaultStrings = 6
): ChordDefinition {
	const existing = defines.get(copyFrom) ?? defines.get(copyFrom.toLowerCase());
	if (existing) return { ...existing, transposable: false };

	// Fall back to the built-in generator as the "config" equivalent.
	const parsed = parseChordName(copyFrom);
	const builtIns = StandardGuitar.getChords(parsed.key, parsed.suffix);
	if (builtIns.length > 0) {
		return { info: builtIns[0], transposable: false };
	}
	return { noDiagram: true, transposable: false };
}

function parseChordName(name: string): { key: string; suffix: string } {
	const match = name.match(/^([A-G][#b]?)(.*)$/);
	if (match) {
		return { key: match[1], suffix: match[2] || 'maj' };
	}
	return { key: name, suffix: 'maj' };
}

function buildDefine(name: string, arg: string, defines: DefineMap): ChordDefinition {
	const attrs = parseDefineAttributes(arg);

	if (attrs.keys) {
		return { noDiagram: true, transposable: false };
	}

	if (attrs.copyFrom) {
		return resolveCopy(name, attrs.copyFrom, defines);
	}

	if (attrs.diagramOff || (!attrs.frets && !attrs.copyFrom)) {
		return { noDiagram: true, transposable: false };
	}

	if (!attrs.frets) {
		return { noDiagram: true, transposable: false };
	}

	const rawFrets = attrs.frets;
	const fingers = attrs.fingers?.slice(0, rawFrets.length);
	const converted = convertDefineFrets(rawFrets, attrs.baseFret);
	const info: ChordInfo = {
		frets: converted.frets,
		baseFret: converted.baseFret,
		fingers: fingers ?? undefined,
		barres: deriveBarres(converted.frets)
	};
	return { info, transposable: false };
}

function parseInlineLine(line: string): Line {
	const columns: ChordColumn[] = [];
	let lyricBuffer = '';
	let current: ChordColumn | null = null;
	let i = 0;

	while (i < line.length) {
		if (line[i] === '[') {
			const close = line.indexOf(']', i);
			if (close > i) {
				if (lyricBuffer) {
					if (current) {
						current.lyric += lyricBuffer;
					} else {
						columns.push({ lyric: lyricBuffer });
					}
					lyricBuffer = '';
				}
				const chord = line.slice(i + 1, close).trim();
				current = chord ? { chord, lyric: '' } : null;
				if (current) {
					columns.push(current);
				}
				i = close + 1;
				continue;
			}
		}
		lyricBuffer += line[i];
		i++;
	}

	if (lyricBuffer) {
		if (current) {
			current.lyric += lyricBuffer;
		} else {
			columns.push({ lyric: lyricBuffer });
		}
	}

	if (columns.length === 0) {
		columns.push({ lyric: '' });
	}

	return columns;
}

export function parseChordPro(source: string): { song: ParsedSong; defines: DefineMap } {
	const song: ParsedSong = { artists: [], sections: [] };
	const defines: DefineMap = new Map();

	let current: Section = { type: 'none', lines: [] };
	const flush = () => {
		if (current.lines.length > 0) {
			song.sections.push(current);
			current = { type: 'none', lines: [] };
		}
	};

	const lines = source.replace(/\r\n/g, '\n').split('\n');

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();
		if (!line.trim()) continue;

		const directive = parseDirective(line);
		if (directive) {
			const { name, arg } = directive;

			if (name === 'title' || name === 't') {
				song.title = arg;
				continue;
			}
			if (name === 'artist' || name === 'subtitle' || name === 'a') {
				song.artists.push(arg);
				continue;
			}
			if (name === 'album') {
				song.album = arg;
				continue;
			}
			if (name === 'key') {
				song.key = arg;
				continue;
			}
			if (name === 'comment' || name === 'c') {
				flush();
				song.sections.push({ type: 'comment', lines: [[{ lyric: arg }]] });
				continue;
			}
			if (name === 'define') {
				let defineArg = arg;
				let transposable = false;
				let chordName = '';
				if (defineArg.startsWith('[')) {
					const close = defineArg.indexOf(']');
					if (close > 0) {
						chordName = defineArg.slice(1, close).trim();
						defineArg = defineArg.slice(close + 1).trim();
						transposable = true;
					}
				}
				if (!chordName) {
					const parts = defineArg.split(/\s+/);
					chordName = parts[0];
					defineArg = parts.slice(1).join(' ');
				}
				if (chordName) {
					const def = buildDefine(chordName, defineArg, defines);
					def.transposable = transposable;
					defines.set(chordName, def);
				}
				continue;
			}

			const section = SECTION_ALIASES[name];
			if (section) {
				if (section.end) {
					flush();
				} else {
					flush();
					current = { type: section.type, label: arg || undefined, lines: [] };
				}
				continue;
			}

			// Unknown directive: ignore gracefully.
			continue;
		}

		current.lines.push(parseInlineLine(line));
	}
	flush();

	return { song, defines };
}

export function transposeSong(song: ParsedSong, semitones: number): ParsedSong {
	if (semitones === 0) return song;
	return {
		...song,
		sections: song.sections.map((section) => ({
			...section,
			lines: section.lines.map((line) =>
				line.map((col) =>
					col.chord
						? { ...col, chord: transposeChordName(col.chord, semitones) }
						: col
				)
			)
		}))
	};
}

export function transposeDefines(defines: DefineMap, semitones: number): DefineMap {
	if (semitones === 0) return defines;
	const result: DefineMap = new Map();
	for (const [name, def] of defines) {
		if (def.transposable) {
			result.set(transposeChordName(name, semitones), def);
		} else {
			result.set(name, def);
		}
	}
	return result;
}

export function definitionToChordInfo(def: ChordDefinition): ChordInfo | null {
	return def.info ?? null;
}
