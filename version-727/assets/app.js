(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var targetSelector = panel.getAttribute("data-target") || ".movie-card";
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      var empty = panel.querySelector("[data-empty-state]");
      var activeFilter = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var category = (card.getAttribute("data-category") || "").toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = activeFilter === "all" || category === activeFilter || haystack.indexOf(activeFilter) !== -1;
          var keep = matchesQuery && matchesFilter;

          card.style.display = keep ? "" : "none";

          if (keep) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = (chip.getAttribute("data-filter") || "all").toLowerCase();
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", apply);
      }

      apply();
    });
  }

  function setupSearchQuery() {
    var input = document.querySelector("[data-search-page-input]");

    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player[data-video]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-action='play']");
      var videoUrl = player.getAttribute("data-video") || "";
      var loaded = false;
      var hlsInstance = null;

      if (!video || !overlay || !videoUrl) {
        return;
      }

      function loadMedia() {
        if (loaded) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          loaded = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          loaded = true;
          return;
        }

        video.src = videoUrl;
        loaded = true;
      }

      function startPlayback() {
        loadMedia();
        overlay.classList.add("is-hidden");
        player.classList.add("is-playing");

        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            overlay.classList.remove("is-hidden");
            player.classList.remove("is-playing");
          });
        }
      }

      overlay.addEventListener("click", startPlayback);

      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHeroSlider();
    setupSearchQuery();
    setupFilters();
    setupPlayers();
  });
})();
