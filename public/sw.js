self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/justica.png",
    badge: "/justica.png",
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
