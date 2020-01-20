function toggleMenu() {
  var nav = document.getElementsByClassName("site-header-nav")[0];
  if (nav.style.display == "inline-flex") {
    nav.style.display = "none";
  } else {
    nav.style.display = "inline-flex";
  }
}

jQuery(function() {
  // 回到顶部
  function toTop() {
    var $toTop = $(".gotop");

    $(window).on("scroll", function() {
      if ($(window).scrollTop() >= $(window).height()) {
        $toTop.css("display", "block").fadeIn();
      } else {
        $toTop.fadeOut();
      }
    });

    $toTop.on("click", function(evt) {
      var $obj = $("body,html");
      $obj.animate(
        {
          scrollTop: 0
        },
        240
      );

      evt.preventDefault();
    });
  }
  function adjust_search_box_width() {
    if ($(".post-directory").length) {
      if ($(".post-directory").is(":visible")) {
        $("#site_search").width(300);
      }
    }
    var searchbar_width = $("#site_search").width();
    $("#search_box").width(searchbar_width - 65);
  }

  $(window).on("resize", function() {
    adjust_search_box_width();
  });
  toTop();
  adjust_search_box_width();
});

function loadGeopattern() {
  jQuery(document).ready(function($) {
    // geopattern
    $(".geopattern").each(function() {
      $(this).geopattern($(this).data("pattern-id"));
    });
    // hljs.initHighlightingOnLoad();
  });
}

function loadLozad() {
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
}
