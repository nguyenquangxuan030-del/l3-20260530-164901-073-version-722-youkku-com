document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initImageFallbacks();
  initHeroSlider();
  initGridFilters();
  initSearchPage();
});

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", function () {
    menu.classList.toggle("is-open");
    document.body.classList.toggle("is-menu-open", menu.classList.contains("is-open"));
  });
}

function initImageFallbacks() {
  document.querySelectorAll("[data-cover-image]").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing-image");
    });
  });
}

function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  const previous = slider.querySelector("[data-hero-prev]");
  const next = slider.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

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
    }, 5800);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      start();
    });
  });

  if (previous) {
    previous.addEventListener("click", function () {
      showSlide(activeIndex - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(activeIndex + 1);
      start();
    });
  }

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  start();
}

function initGridFilters() {
  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const input = panel.querySelector("[data-grid-search]");
    const chips = Array.from(panel.querySelectorAll("[data-filter-chip]"));
    const grid = panel.nextElementSibling;

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll("[data-search-item]"));
    let activeType = "全部";

    function applyFilters() {
      const query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        const text = (card.dataset.text || "").toLowerCase();
        const type = card.dataset.type || "";
        const matchesQuery = !query || text.includes(query);
        const matchesType = activeType === "全部" || type === activeType;
        card.classList.toggle("is-hidden", !(matchesQuery && matchesType));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeType = chip.dataset.filterValue || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilters();
      });
    });
  });
}

function initSearchPage() {
  const results = document.querySelector("[data-search-results]");
  const input = document.querySelector("[data-search-page-input]");
  const form = document.querySelector("[data-search-page-form]");
  const summary = document.querySelector("[data-search-summary]");

  if (!results || !input || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  input.value = initialQuery;

  function cardTemplate(movie) {
    return [
      '<article class="movie-card" data-search-item>',
      '  <a href="' + movie.url + '" class="movie-card__link">',
      '    <div class="movie-card__poster">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy" data-cover-image>',
      '      <span class="movie-card__year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="movie-card__score">★ ' + movie.rating.toFixed(1) + '</span>',
      '    </div>',
      '    <div class="movie-card__body">',
      '      <div class="movie-card__meta">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '        <span>' + escapeHtml(movie.duration) + '</span>',
      '      </div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-card__tags">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("\n");
  }

  function render() {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      results.innerHTML = "";
      if (summary) {
        summary.textContent = "请输入关键词开始搜索。";
      }
      return;
    }

    const matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.searchText.includes(query);
    }).slice(0, 120);

    results.innerHTML = matches.map(cardTemplate).join("\n");
    initImageFallbacks();

    if (summary) {
      summary.textContent = "找到 " + matches.length + " 条相关结果。";
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.searchParams.set("q", input.value.trim());
      window.history.replaceState({}, "", url.toString());
      render();
    });
  }

  input.addEventListener("input", render);
  render();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
