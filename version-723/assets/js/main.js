(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = one("[data-menu-toggle]");
    var menu = one("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = one("[data-hero]");
    if (!root) {
      return;
    }
    var slides = all("[data-hero-slide]", root);
    var dots = all("[data-hero-dot]", root);
    var prev = one("[data-hero-prev]", root);
    var next = one("[data-hero-next]", root);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function fillFilterOptions(cards, selector, name) {
    var select = one(selector);
    if (!select || select.options.length > 1) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(name);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort().reverse().forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initSearch() {
    var form = one("[data-search-form]");
    var grid = one("[data-search-grid]");
    if (!form || !grid) {
      return;
    }
    var input = one("[data-search-input]", form);
    var region = one("[data-region-filter]", form);
    var year = one("[data-year-filter]", form);
    var cards = all("[data-search-card]", grid);
    fillFilterOptions(cards, "[data-region-filter]", "data-region");
    fillFilterOptions(cards, "[data-year-filter]", "data-year");

    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function apply(event) {
      if (event) {
        event.preventDefault();
      }
      var q = text(input && input.value);
      var regionValue = text(region && region.value);
      var yearValue = text(year && year.value);
      cards.forEach(function (card) {
        var haystack = text(card.getAttribute("data-search"));
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchRegion = !regionValue || text(card.getAttribute("data-region")) === regionValue;
        var matchYear = !yearValue || text(card.getAttribute("data-year")) === yearValue;
        card.hidden = !(matchText && matchRegion && matchYear);
      });
    }

    form.addEventListener("submit", apply);
    [input, region, year].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var button = one(".play-overlay");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function play() {
      load();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
