self.addEventListener("install",(function(){self.skipWaiting()})),self.addEventListener("activate",(function(){self.registration.unregister().then((function(){return self.clients.matchAll()})).then((function(n){n.forEach(n=>n.navigate(n.url))}))}));