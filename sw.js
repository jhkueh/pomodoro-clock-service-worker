self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/pomodoro-clock-service-worker/',
        '/pomodoro-clock-service-worker/index.html',
        '/pomodoro-clock-service-worker/css/style.css',
        '/pomodoro-clock-service-worker/js/app.js',
        '/pomodoro-clock-service-worker/sound/KeyChimes.mp3',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        // if resource match cache
        if (response !== undefined) {
            return response;
        }

        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(function(response) {
            // fetch resource from network, then save a copy in cache

            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            var responseClone = response.clone();

            caches.open('v1').then(function(cache) {
                cache.put(event.request, responseClone);
            });
            return response;
        }).catch(function() {
            return caches.match('/pomodoro-clock-service-worker/sound/KeyChimes.mp3');
        });
    }));
});
