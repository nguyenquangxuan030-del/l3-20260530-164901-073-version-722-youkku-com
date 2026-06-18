const Site = (() => {
  function toggleMenu() {
    const button = document.querySelector('[data-menu-button]');
    const links = document.querySelector('[data-nav-links]');
    if (!button || !links) {
      return;
    }
    button.addEventListener('click', () => {
      links.classList.toggle('is-open');
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    };
    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stop();
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    const forms = Array.from(document.querySelectorAll('[data-filter-form]'));
    forms.forEach((form) => {
      const scope = document.querySelector(form.getAttribute('data-filter-form')) || document;
      const cards = Array.from(scope.querySelectorAll('[data-title]'));
      const empty = document.querySelector('[data-empty-state]');
      const keyword = form.querySelector('[data-filter-keyword]');
      const year = form.querySelector('[data-filter-year]');
      const region = form.querySelector('[data-filter-region]');
      const apply = () => {
        const kw = keyword ? keyword.value.trim().toLowerCase() : '';
        const yr = year ? year.value : '';
        const rg = region ? region.value.trim() : '';
        let visible = 0;
        cards.forEach((card) => {
          const text = `${card.dataset.title || ''} ${card.dataset.genre || ''} ${card.dataset.region || ''}`.toLowerCase();
          const matchesKeyword = !kw || text.includes(kw);
          const matchesYear = !yr || card.dataset.year === yr;
          const matchesRegion = !rg || (card.dataset.region || '').includes(rg);
          const show = matchesKeyword && matchesYear && matchesRegion;
          card.classList.toggle('hidden-by-filter', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        apply();
      });
      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      apply();
    });
  }

  function setupSearchQuery() {
    const query = new URLSearchParams(window.location.search).get('q');
    if (!query) {
      return;
    }
    const input = document.querySelector('[data-filter-keyword]');
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function bindPlayer(videoId, buttonId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    let ready = false;
    let hls = null;
    const attach = () => {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    const play = () => {
      attach();
      button.classList.add('is-hidden');
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    };
    button.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    toggleMenu();
    setupHero();
    setupFilters();
    setupSearchQuery();
  });

  return {
    bindPlayer
  };
})();
