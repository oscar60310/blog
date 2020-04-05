const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

hexo.extend.tag.register("temp", function(args) {
  const fileName = args[0];
  const filePath = path.join(
    process.cwd(),
    hexo.config.include_path,
    `${fileName}.ejs`
  );
  const data = fs.readFileSync(filePath, "utf-8");
  const url_for = hexo.extend.helper.get("url_for").bind(hexo);
  return ejs.render(data, { ...this, url_for });
});
