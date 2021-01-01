const crypto = require("crypto");

hexo.extend.filter.register("before_post_render", function (data) {
  data.identity = crypto.createHash("sha256").update(data.path).digest("hex");
  return data;
});
