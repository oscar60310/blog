hexo.extend.tag.register("image", function (args) {
  const fileName = args[0];
  const description = args[1];
  let responsive = false;
  for (let i = 2; i < args.length; i++) {
    if (args[i].toUpperCase() === "RESPONSIVE") responsive = true;
  }

  const pagePath = this.path;
  const url_for = hexo.extend.helper.get("url_for").bind(hexo);

  const imageSrc = url_for(`${pagePath}/${fileName}`);

  let content = "";

  if (responsive) {
    content = `<div class="mid">
    <img
      alt="${description || fileName}"
      class="lozad"
      data-src="${imageSrc}-w800.jpg"
      data-srcset="
      ${imageSrc}-w400.jpg   400w,
      ${imageSrc}-w600.jpg   600w,
      ${imageSrc}-w800.jpg   800w,
      ${imageSrc}-w1000.jpg  1000w
      "
    />
  </div>`;
  } else {
    content = `<div class="mid"><img src=${imageSrc}  alt="${
      description || fileName
    }"/></div>`;
  }

  if (description) {
    content += `<p class="img-desc">${description}</p>`;
  }
  return content;
});
