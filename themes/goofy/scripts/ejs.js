const ejs = require("ejs");

const options = {};

function ejsRenderer(data, locals) {
  return ejs.render(
    data.text,
    Object.assign({ filename: data.path }, locals),
    options
  );
}

ejsRenderer.compile = function(data) {
  return ejs.compile(
    data.text,
    {
      filename: data.path
    },
    options
  );
};

hexo.extend.renderer.register("ejs", "html", ejsRenderer, true);
