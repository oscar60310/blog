const crypto = require("crypto");

const getHash = (path) =>
  crypto.createHash("sha256").update(path).digest("hex");

hexo.extend.filter.register("before_post_render", function (data) {
  data.identity = getHash(data.path);
  return data;
});

hexo.extend.generator.register("post_id", function (locals) {
  return {
    path: "posts.json",
    data: locals.posts.map((post) => ({
      id: getHash(post.path),
      path: post.path,
      title: post.title,
    })),
  };
});
