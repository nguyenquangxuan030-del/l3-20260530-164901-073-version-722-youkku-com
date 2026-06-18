(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileNavigation();
    initHeroCarousel();
    initCatalogFilters();
    initPlayers();
  });

  function initMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-nav-links]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var shell = document.querySelector("[data-hero-carousel]");
    if (!shell) {
      return;
    }

    var slides = Array.prototype.slice.call(shell.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(shell.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }

    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5400);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        start();
      });
    });

    shell.addEventListener("mouseenter", stop);
    shell.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initCatalogFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-catalog]"));
    blocks.forEach(function (block) {
      var searchInput = block.querySelector("[data-filter-search]");
      var typeSelect = block.querySelector("[data-filter-type]");
      var regionSelect = block.querySelector("[data-filter-region]");
      var yearSelect = block.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card"));
      var emptyState = block.querySelector("[data-empty-state]");

      function applyFilters() {
        var search = normalize(searchInput && searchInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
          ].join(" "));
          var matchSearch = !search || text.indexOf(search) !== -1;
          var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
          var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
          var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
          var visible = matchSearch && matchType && matchRegion && matchYear;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", shown === 0);
        }
      }

      [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });
  }

  function getHlsClass() {
    var vendorPath = window.HLS_VENDOR_PATH || "./assets/hls-vendor-dru42stk.js";
    return import(vendorPath).then(function (module) {
      return module.H;
    });
  }

  function initPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll("[data-video-src]"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var trigger = frame.querySelector("[data-play-trigger]");
      var src = frame.getAttribute("data-video-src");
      var started = false;

      if (!video || !src || !trigger) {
        return;
      }

      function startVideo() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        trigger.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.play().catch(function () {});
          return;
        }

        getHlsClass().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hls.on(Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                try {
                  hls.destroy();
                } catch (error) {}
                video.src = src;
                video.play().catch(function () {});
              }
            });
          } else {
            video.src = src;
            video.play().catch(function () {});
          }
        }).catch(function () {
          video.src = src;
          video.play().catch(function () {});
        });
      }

      trigger.addEventListener("click", startVideo);
      video.addEventListener("play", function () {
        trigger.classList.add("is-hidden");
      });
    });
  }
})();
