Package.on_use(function (api, where) {
  api.use('jquery', 'client');

  api.add_files("js/radial-context-menu.js", 'client');
  api.add_files("css/context-menu.css", 'client');
});
