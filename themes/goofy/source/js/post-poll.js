document.querySelectorAll(".poll-options>button").forEach((dom) => {
  dom.addEventListener("click", function () {
    document.querySelector(".poll-options").innerHTML = "謝謝。";
    // dataLayer.push({ helpful: this.value === "y" });
    dataLayer.push({
      event: "post-poll",
      action: `vote-${this.value}`,
      label: identifier,
    });
  });
});
