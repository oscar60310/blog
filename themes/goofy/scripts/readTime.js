const { default: readTimeEstimate } = require("read-time-estimate");
const humanizeDuration = require("humanize-duration");
const MIN_TIME = 2;

hexo.extend.filter.register("after_post_render", async function (data) {
  const { duration } = readTimeEstimate(data.content, 100, 20, 300, ["img"]);
  data.readTime = humanizeDuration(Math.max(duration, MIN_TIME) * 60 * 1000, {
    language: "zh_TW",
    units: ["m"],
    round: true,
  });
  return data;
});
