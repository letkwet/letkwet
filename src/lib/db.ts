import { openDB, type DBSchema } from 'idb';

export interface ISong {
	key: string;
	artists: string[];
	album?: string;
	title: string;
	lyrics: string;
}

export interface IMeta {
	last_modified: number;
}

export interface IRecent {
	key: string;
	title: string;
	artists: string[];
	viewedAt: number;
}

interface SongRecord extends ISong {
	titleLC: string;
	artistsLC: string[];
}

interface LetkwetDB extends DBSchema {
	songs: {
		key: string;
		value: SongRecord;
		indexes: {
			artists: string;
			title: string;
			titleLC: string;
			artistsLC: string;
		};
	};
	_meta: {
		key: number;
		value: IMeta;
	};
	recent: {
		key: string;
		value: IRecent;
		indexes: { viewedAt: number };
	};
}

const DB_NAME = 'letkwet';
const DB_VERSION = 2;

function normalizeSong(song: ISong): SongRecord {
	return {
		...song,
		titleLC: song.title.toLowerCase(),
		artistsLC: song.artists.map((a) => a.toLowerCase())
	};
}

const dbPromise = openDB<LetkwetDB>(DB_NAME, DB_VERSION, {
	async upgrade(db, oldVersion, _newVersion, transaction) {
		if (oldVersion < 1) {
			const songsStore = db.createObjectStore('songs', { keyPath: 'key' });
			songsStore.createIndex('artists', 'artists', { multiEntry: true });
			songsStore.createIndex('title', 'title', { unique: false });
			songsStore.createIndex('titleLC', 'titleLC', { unique: false });
			songsStore.createIndex('artistsLC', 'artistsLC', { multiEntry: true });

			db.createObjectStore('_meta', { keyPath: 'last_modified' });
		}

		if (oldVersion < 2) {
			const recentStore = db.createObjectStore('recent', { keyPath: 'key' });
			recentStore.createIndex('viewedAt', 'viewedAt', { unique: false });

			if (db.objectStoreNames.contains('songs')) {
				const songsStore = transaction.objectStore('songs');
				if (!songsStore.indexNames.contains('titleLC')) {
					songsStore.createIndex('titleLC', 'titleLC', { unique: false });
				}
				if (!songsStore.indexNames.contains('artistsLC')) {
					songsStore.createIndex('artistsLC', 'artistsLC', { multiEntry: true });
				}

				let cursor = await songsStore.openCursor();
				while (cursor) {
					const value = cursor.value as SongRecord;
					value.titleLC = value.title?.toLowerCase();
					value.artistsLC = value.artists?.map((a) => a.toLowerCase());
					await cursor.update(value);
					cursor = await cursor.continue();
				}
			}
		}
	}
});

export async function updateSongs(songs: ISong[], last_modified: number): Promise<void> {
	const db = await dbPromise;
	const tx = db.transaction(['songs', '_meta'], 'readwrite');
	await tx.objectStore('songs').clear();
	const songsStore = tx.objectStore('songs');
	for (const song of songs) {
		await songsStore.put(normalizeSong(song));
	}
	await tx.objectStore('_meta').put({ last_modified });
	await tx.done;
}

export async function getSong(key: string): Promise<ISong | undefined> {
	const db = await dbPromise;
	return db.get('songs', key);
}

export async function getMeta(): Promise<IMeta | undefined> {
	const db = await dbPromise;
	const all = await db.getAll('_meta', undefined, 1);
	return all[0];
}

export async function artistsAggregate(): Promise<{ artist: string; songCount: number }[]> {
	const db = await dbPromise;
	const tx = db.transaction('songs', 'readonly');
	const index = tx.store.index('artists');

	const counts = new Map<string, number>();
	let cursor = await index.openKeyCursor();
	while (cursor) {
		const artist = cursor.key as string;
		counts.set(artist, (counts.get(artist) ?? 0) + 1);
		cursor = await cursor.continue();
	}
	await tx.done;

	return [...counts.entries()]
		.map(([artist, songCount]) => ({ artist, songCount }))
		.sort((a, b) => b.songCount - a.songCount);
}

export async function getSongsByArtist(artist: string): Promise<ISong[]> {
	const db = await dbPromise;
	return db.getAllFromIndex('songs', 'artistsLC', artist.toLowerCase());
}

export async function searchSongsByTitle(query: string): Promise<ISong[]> {
	const db = await dbPromise;
	const q = query.toLowerCase();
	const range = IDBKeyRange.bound(q, q + '\uffff');
	return db.getAllFromIndex('songs', 'titleLC', range, 10);
}

export async function searchArtistsByName(query: string): Promise<string[]> {
	const db = await dbPromise;
	const q = query.toLowerCase();
	const range = IDBKeyRange.bound(q, q + '\uffff');

	const tx = db.transaction('songs', 'readonly');
	const index = tx.store.index('artistsLC');

	const artists = new Set<string>();
	let cursor = await index.openKeyCursor(range);
	while (cursor && artists.size < 10) {
		artists.add(cursor.key as string);
		cursor = await cursor.continue();
	}
	await tx.done;

	return [...artists];
}

export async function recordRecent(song: { key: string; title: string; artists: string[] }): Promise<void> {
	const db = await dbPromise;
	await db.put('recent', {
		key: song.key,
		title: song.title,
		artists: song.artists,
		viewedAt: Date.now()
	});
}

export async function getRecent(limit = 10): Promise<IRecent[]> {
	const db = await dbPromise;
	const tx = db.transaction('recent', 'readonly');
	const index = tx.store.index('viewedAt');

	const recents: IRecent[] = [];
	let cursor = await index.openCursor(undefined, 'prev');
	while (cursor && recents.length < limit) {
		recents.push(cursor.value);
		cursor = await cursor.continue();
	}
	await tx.done;

	return recents;
}

export default dbPromise;
