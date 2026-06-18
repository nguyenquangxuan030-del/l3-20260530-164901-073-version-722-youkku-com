document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      menuToggle.classList.toggle("open");
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-hero-dot"));
        show(target);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-rail]").forEach(function (rail) {
    var name = rail.getAttribute("data-rail");
    var left = document.querySelector('[data-rail-left="' + name + '"]');
    var right = document.querySelector('[data-rail-right="' + name + '"]');

    function move(direction) {
      rail.scrollBy({ left: direction * Math.max(320, rail.clientWidth * 0.75), behavior: "smooth" });
    }

    if (left) {
      left.addEventListener("click", function () {
        move(-1);
      });
    }

    if (right) {
      right.addEventListener("click", function () {
        move(1);
      });
    }
  });

  document.querySelectorAll("[data-search-root]").forEach(function (root) {
    var input = root.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
    var list = root.nextElementSibling ? root.nextElementSibling.querySelector(".searchable-list") : null;
    if (!list) {
      list = document.querySelector(".searchable-list");
    }
    var currentType = "all";

    function apply() {
      if (!list) {
        return;
      }
      var query = input ? input.value.trim().toLowerCase() : "";
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-card, .rank-item"));
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-index") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var typeMatch = currentType === "all" || type === currentType;
        var queryMatch = !query || text.indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !(typeMatch && queryMatch));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentType = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  });

  document.querySelectorAll("[data-player]").forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play-button]");
    var stream = box.getAttribute("data-stream");
    var hls = null;
    var ready = false;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("hide-cover");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("hide-cover");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("hide-cover");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
});
