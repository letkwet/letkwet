import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
];

self.addEventListener('install', (event) => {
	self.skipWaiting();

	// Cache assets individually so one failure doesn't abort the whole install.
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		const results = await Promise.allSettled(
			ASSETS.map((path) => cache.add(path))
		);
		const failed = results.filter((r) => r.status === 'rejected');
		if (failed.length === ASSETS.length) {
			throw new Error('All assets failed to cache');
		}
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk and take control of clients immediately.
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	const isHead = event.request.method === 'HEAD';

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (!url.pathname.includes('songs.json') && ASSETS.includes(url.pathname)) {
			return cache.match(event.request);
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			if (response.status === 200 && !isHead) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			return cache.match(event.request);
		}
	}

	event.respondWith(respond());
});
