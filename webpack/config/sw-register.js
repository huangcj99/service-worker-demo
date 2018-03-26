var cacheVersion = 'v1.0.1';

// 安装服务工作线程
self.addEventListener('install', function(event){
  console.log('已安装');

  // 需要缓存的资源
  var cacheFiles = [
    'common.js'
  ];

  console.log('service worker: run into install');
  event.waitUntil(
    caches.open(cacheVersion)
      .then(function(cache) {
        console.log(cache);
        return cache.addAll(cacheFiles);
      })
  );
});

// 新的service worker线程被激活（其实和离线包一样存在"二次生效"的机理）
self.addEventListener('activate', function (event) {
    console.log('service worker: run into activate');

    event.waitUntil(caches.keys().then(function (cacheNames) {
        console.log(cacheNames);
        return Promise.all(cacheNames.map(function (cacheName) {
            // 注意这里cacheVersion也可以是一个数组
            if(cacheName !== cacheVersion){
                console.log('service worker: clear cache' + cacheName);
                return caches.delete(cacheName);
            }
        }));
    }));
});

// 拦截请求并响应
self.addEventListener('fetch', function (event) {
    console.log('-------------');
    console.log('service worker: run into fetch');
    event.respondWith(caches.match(event.request).then(function (response) {
        console.log(event);
        // 发现匹配的响应缓存
        if(response){
            console.log('service worker 匹配并读取缓存：' + event.request.url);
            return response;
        }
        console.log('没有匹配上：' + event.request.url);
        return fetch(event.request);
        /*var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(function(response){
            if(!response || response.status !== 200 || response.type !== 'basic'){
                return response;
            }
            var responseToCache = response.clone();
            caches.open(cacheVersion).then(function (cache) {
                console.log(cache);
                cache.put(fetchRequest, responseToCache);
            });
            return response;
        });*/
    }));
});
