const CACHE_NAME = 'Budget-Tracker_V01'
const DATA_CACHE_NAME = 'data-cache-v1'

const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png', 
    './icons/icon-128x128.png', 
    './icons/icon-144x144.png', 
    './icons/icon-152x152.png', 
    './icons/icon-192x192.png', 
    './icons/icon-384x384.png', 
    './icons/icon-512x512.png'
];

// install

self.addEventListener('install', function(event) {
    console.log('Service Worker Being Installed');

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    )
    self.skipWaiting();
})

//activate and remove old data

self.addEventListener('activate', function(event){
    console.log('service worker is being activated');

    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        return caches.delete(key);
                    }
                })
            )
        })
    )

    self.clients.claim();
})

//intercept fetch requests

self.addEventListener('fetch', function(event){
    if (event.request.url.includes("/api/")){
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then( response=> {
                    if (response.status === 200) {
                      cache.put(event.request.url, response.clone());
                    }
        
                    return response;
                  })
                  .catch(err => {
                    return cache.match(event.request);
                  });
              }).catch(err => console.log(err))
            );
            return;
        };
        event.respondWith(
            fetch(event.request).catch(function () {
              return caches.match(evt.request).then(function (response) {
                if (response) {
                  return response;
                } else if (event.request.headers.get("accept").includes("text/html")) {
                  return caches.match("/");
                }
              });
            })
        );
});
