export type ChordInfo = {
  frets: Array<number>,
  barres?: Array<any>
  capo?: false,
  baseFret?: number,
  fingers?: Array<number>
}

export type Instrument = {
  fretsOnChord: number,
  name: string,
  strings: number,
  tuning: Array<string>
}

export const instrument_offsets: {
  [key: number]: number
} = {
  4: 0,
  6: -1
}
