import type { ChordInfo } from "../components/constants";

const TONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const FLAT_KEY_MAPS: {
  [key: string]: string;
} = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const SUFFIXES = {
  maj: ["ma", "maj", "M", ""],
  min: ["min", "m", "-"],
  sus2: ["sus2", "2"],
  sus4: ["sus", "sus4"],
  dim: ["dim", "o"],
  halfDim: ["m7b5", "m7(b5)", "0"],
  aug: ["aug", "+"],
  "5": ["5"],
  "6": ["6"],
  "7": ["7"],
  maj7: ["ma7", "maj7", "M7"],
  min7: ["min7", "m7"],
  mM7: ["mM7", "m(M7)", "min(maj7)"],
}

export const StandardGuitar = {
  instrument: {
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    fretsOnChord: 4,
    name: "guitar",
    strings: 6,
  },
  chordShapes: [
    // C Shapes
    { suffix: SUFFIXES.maj, baseKey: "C", shape: [-1, 3, 2, 0, 1, 0] },
    // { name: "Cshape", suffix: "min", baseKey: "C", shape: [-1, 3, 1, 0, 1, -1]},
    { suffix: SUFFIXES.sus2, baseKey: "C", shape: [-1, 3, 0, 0, 1, 0] },
    { suffix: SUFFIXES.sus4, baseKey: "C", shape: [-1, 3, 3, 0, 1, 1] },
    { suffix: SUFFIXES.aug, baseKey: "C", shape: [-1, 3, 2, 1, 1, 3] },
    { suffix: SUFFIXES["6"], baseKey: "C", shape: [-1, 3, 2, 2, 1, 0] },
    { suffix: SUFFIXES["7"], baseKey: "C", shape: [-1, 3, 2, 3, 1, 0] },
    { suffix: SUFFIXES.maj7, baseKey: "C", shape: [-1, 3, 2, 0, 0, 0] },
    { suffix: SUFFIXES.mM7, baseKey: "C", shape: [-1, 3, 1, 0, 0, 0] },

    // A Shapes
    { suffix: SUFFIXES.maj, baseKey: "A", shape: [-1, 0, 2, 2, 2, 0] },
    { suffix: SUFFIXES.min, baseKey: "A", shape: [-1, 0, 2, 2, 1, 0] },
    { suffix: SUFFIXES.sus2, baseKey: "A", shape: [-1, 0, 2, 2, 0, 0] },
    { suffix: SUFFIXES.sus4, baseKey: "A", shape: [-1, 0, 2, 2, 3, 0] },
    { suffix: SUFFIXES.dim, baseKey: "A", shape: [-1, 0, 1, 2, 1, 0] },
    { suffix: SUFFIXES.halfDim, baseKey: "A", shape: [-1, 0, 1, 0, 1, -1] },
    { suffix: SUFFIXES.aug, baseKey: "A", shape: [-1, 0, 3, 2, 2, 0] },
    { suffix: SUFFIXES["5"], baseKey: "A", shape: [-1, 0, 2, -1, -1, -1] },
    { suffix: SUFFIXES["6"], baseKey: "A", shape: [-1, 0, 2, 2, 2, 2] },
    { suffix: SUFFIXES["7"], baseKey: "A", shape: [-1, 0, 2, 0, 2, 0] },
    { suffix: SUFFIXES.maj7, baseKey: "A", shape: [-1, 0, 2, 1, 2, 0] },
    { suffix: SUFFIXES.min7, baseKey: "A", shape: [-1, 0, 2, 0, 1, 0] },
    { suffix: SUFFIXES.mM7, baseKey: "A", shape: [-1, 0, 2, 1, 1, 0] },

    // G Shapes
    { suffix: SUFFIXES.maj, baseKey: "G", shape: [3, 2, 0, 0, 0, 3] },
    { suffix: SUFFIXES.min, baseKey: "G", shape: [3, 1, 0, 0, -1, -1] },
    { suffix: SUFFIXES.sus2, baseKey: "G", shape: [3, 2, 0, 2, 0, 3] },
    { suffix: SUFFIXES.sus4, baseKey: "G", shape: [3, 2, 0, 0, 1, 3] },
    { suffix: SUFFIXES["6"], baseKey: "G", shape: [3, 2, 0, 0, 1, 0] },
    { suffix: SUFFIXES["7"], baseKey: "G", shape: [3, 2, 0, 0, 0, 1] },
    { suffix: SUFFIXES.maj7, baseKey: "G", shape: [3, 2, 0, 0, 0, 2] },

    // E Shapes
    { suffix: SUFFIXES.maj, baseKey: "E", shape: [0, 2, 2, 1, 0, 0] },
    { suffix: SUFFIXES.min, baseKey: "E", shape: [0, 2, 2, 0, 0, 0] },
    { suffix: SUFFIXES.sus2, baseKey: "E", shape: [0, 2, 2, 1, 0, 0] },
    { suffix: SUFFIXES.sus4, baseKey: "E", shape: [0, 2, 4, 1, 0, 0] },
    { suffix: SUFFIXES.dim, baseKey: "E", shape: [0, 1, 2, 0, 4, 0] },
    { suffix: SUFFIXES.halfDim, baseKey: "E", shape: [0, 1, 0, 0, 3, 0] },
    { suffix: SUFFIXES.aug, baseKey: "E", shape: [0, 3, 2, 1, 1, 0] },
    { suffix: SUFFIXES["5"], baseKey: "E", shape: [0, 2, -1, -1, -1, -1] },
    { suffix: SUFFIXES["6"], baseKey: "E", shape: [0, 2, 2, 1, 2, 0] },
    { suffix: SUFFIXES["7"], baseKey: "E", shape: [0, 2, 0, 1, 0, 0] },
    { suffix: SUFFIXES.maj7, baseKey: "E", shape: [0, 2, 1, 1, 0, 0] },
    { suffix: SUFFIXES.min7, baseKey: "E", shape: [0, 2, 0, 0, 0, 0] },
    { suffix: SUFFIXES.mM7, baseKey: "E", shape: [0, 2, 1, 0, 0, 0] },

    // D Shapes
    { suffix: SUFFIXES.maj, baseKey: "D", shape: [-1, -1, 0, 2, 3, 2] },
    { suffix: SUFFIXES.min, baseKey: "D", shape: [-1, -1, 0, 2, 3, 1] },
    { suffix: SUFFIXES.sus2, baseKey: "D", shape: [-1, -1, 0, 2, 3, 0] },
    { suffix: SUFFIXES.sus4, baseKey: "D", shape: [-1, -1, 0, 2, 3, 3] },
    { suffix: SUFFIXES.dim, baseKey: "D", shape: [-1, -1, 0, 1, 3, 1] },
    { suffix: SUFFIXES.halfDim, baseKey: "D", shape: [-1, -1, 0, 1, 1, 1] },
    { suffix: SUFFIXES.aug, baseKey: "D", shape: [-1, -1, 0, 3, 3, 2] },
    { suffix: SUFFIXES["6"], baseKey: "D", shape: [-1, -1, 0, 2, 0, 2] },
    { suffix: SUFFIXES["7"], baseKey: "D", shape: [-1, -1, 0, 2, 1, 2] },
    { suffix: SUFFIXES.maj7, baseKey: "D", shape: [-1, -1, 0, 2, 2, 2] },
    { suffix: SUFFIXES.min7, baseKey: "D", shape: [-1, -1, 0, 2, 1, 1] },
    { suffix: SUFFIXES.mM7, baseKey: "D", shape: [-1, -1, 0, 2, 2, 1] },
  ],

  getChords(key: string, suffix = "maj"): ChordInfo[] {
    if (key.includes('b')) { key = FLAT_KEY_MAPS[key] }
    if (!key) return [];
    return this.chordShapes.filter(s => s.suffix.includes(suffix))
      .map(({ baseKey, shape }): ChordInfo => {
        let fretOffset = TONES.indexOf(key) - TONES.indexOf(baseKey);
        if (fretOffset < 0) fretOffset = TONES.length + fretOffset;
        return {
          baseFret: fretOffset,
          frets: fretOffset === 0
            ? shape
            : shape.map((note) => note >= 0 ? note + 1 : note)
        };
      })
      .sort((a, b) => (a.baseFret || 0) - (b.baseFret || 0));
  }
};

