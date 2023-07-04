import Dexie from 'dexie';

export class LetkwetDb extends Dexie {
  songs!: Dexie.Table<ISong, string>;
  _meta!: Dexie.Table<IMeta, string>;
  
  constructor() {  
    super("letkwet");
    
    this.version(1).stores({
      songs: '&key,*artists,title',
      _meta: 'last_modified'
    });
  }

  updateSongs(songs: ISong[], last_modified: number): Promise<any> {
    const addingSongs = this.songs.bulkPut(songs);
    const updatingMeta = this._meta.add({last_modified});
    return Promise.all([addingSongs, updatingMeta]);
  }
}

export interface ISong {
  key: string,
  artists: string[],
  album?: string,
  title: string,
  lyrics: string
}

export interface IMeta {
  last_modified: number,
}

let db = new LetkwetDb();

export default db;
