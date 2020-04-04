hexo.extend.tag.register("image", function(args) {
  const fileName = args[0];
  const description = args[1];
  const pagePath = this.path;
  const url_for = hexo.extend.helper.get("url_for").bind(hexo);

  const imageSrc = url_for(`${pagePath}/${fileName}`);

  let content = `<img src=${imageSrc} />`;

  if (description) {
    content += `<p class="img-desc">${description}</p>`;
  }
  return content;
});
