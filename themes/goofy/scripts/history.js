const path = require("path");
const exec = require("child_process").exec;
const moment = require("moment");

const getHistory = (result) => {
  return result.split("\n").map((row) => {
    const data = row.split(",");
    const message = data.slice(2, data.length).join(",");
    return {
      hash: data[0],
      time: moment(data[1], "YYYY-MM-DD HH:mm:ss Z")
        .utcOffset(hexo.config.utcOffset)
        .format("YYYY/MM/DD HH:mm"),
      message,
    };
  });
};

hexo.extend.filter.register("before_post_render", function (data) {
  return new Promise((resolve) => {
    const filePath = data.full_source;
    exec(
      `git log --pretty=format:"%H,%ad,%s" --date=iso --max-count=10 ${filePath}`,
      (error, out) => {
        if (!error) data.history = getHistory(out);
        resolve(data);
      }
    );
  });
});
