const geoPattern = () => {
  const doms = document.querySelectorAll(".geo-pattern");
  doms.forEach(dom => {
    const pattern = GeoPattern.generate(dom.getAttribute("data-pattern"));
    dom.style["background-image"] = pattern.toDataUrl();
  });
};

geoPattern();

tocbot.init({
  // Where to render the table of contents.
  tocSelector: ".toc",
  // Where to grab the headings to build the table of contents.
  contentSelector: ".content",
  // Which headings to grab inside of the contentSelector element.
  headingSelector: "h1, h2, h3",
  // For headings inside relative or absolute positioned containers within content.
  hasInnerContainers: true,
  positionFixedSelector: ".toc",
  positionFixedClass: "toc-fix",
  fixedSidebarOffset: document.querySelector(".post-content").offsetTop
});
