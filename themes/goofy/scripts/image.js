hexo.extend.tag.register("image", function (args) {
  const fileName = args[0];
  const description = args[1];
  let responsive = false;
  let full = false;
  for (let i = 2; i < args.length; i++) {
    if (args[i].toUpperCase() === "RESPONSIVE") responsive = true;
    if (args[i].toUpperCase() === "FULL") full = true;
  }

  const pagePath = this.path;
  const url_for = hexo.extend.helper.get("url_for").bind(hexo);

  const imageSrc = url_for(`${pagePath}/${fileName}`);

  let content = "";
  const imageAttr = {
    alt: description || fileName,
    style: "",
  };
  if (responsive) {
    imageAttr["class"] = "lozad";
    imageAttr["data-src"] = `${imageSrc}-w800.jpg`;
    imageAttr["data-srcset"] = `${imageSrc}-w400.jpg   400w,
    ${imageSrc}-w600.jpg   600w,
    ${imageSrc}-w800.jpg   800w,
    ${imageSrc}-w1000.jpg  1000w`;
  } else {
    imageAttr["src"] = imageSrc;
  }
  if (full) {
    imageAttr["style"] += " width:100%;";
  }
  content = `<div class="mid"><img ${Object.keys(imageAttr)
    .map((attr) => `${attr}="${imageAttr[attr]}"`)
    .join(" ")} /></div>`;
  if (description) {
    content += `<p class="img-desc">${description}</p>`;
  }
  return content;
});
