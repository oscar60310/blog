const geoPattern = () => {
  const doms = document.querySelectorAll(".geo-pattern");
  doms.forEach(dom => {
    const pattern = GeoPattern.generate(dom.getAttribute("data-pattern"));
    dom.style["background-image"] = pattern.toDataUrl();
  });
};

geoPattern();
