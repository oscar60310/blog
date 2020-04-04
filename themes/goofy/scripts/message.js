hexo.extend.tag.register("info", function(args) {
  const message = args[0];
  return `<div class="msg-info">${message}</div>`;
});

hexo.extend.tag.register("warn", function(args) {
  const message = args[0];
  return `<div class="msg-warn">${message}</div>`;
});
