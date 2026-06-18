(function () {
  var body = document.body;
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      body.classList.toggle('is-locked', panel.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('.header-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html';
    });
  });

  document.querySelectorAll('.hero-slider').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-rail]').forEach(function (wrap) {
    var rail = wrap.querySelector('.movie-rail');
    if (!rail) {
      return;
    }
    wrap.querySelectorAll('[data-rail-move]').forEach(function (button) {
      button.addEventListener('click', function () {
        var direction = button.getAttribute('data-rail-move') === 'next' ? 1 : -1;
        rail.scrollBy({
          left: direction * Math.min(460, rail.clientWidth * 0.84),
          behavior: 'smooth'
        });
      });
    });
  });

  document.querySelectorAll('.filter-panel').forEach(function (panelNode) {
    var root = panelNode.parentElement || document;
    var search = panelNode.querySelector('.filter-search');
    var year = panelNode.querySelector('.filter-year');
    var type = panelNode.querySelector('.filter-type');
    var region = panelNode.querySelector('.filter-region');
    var category = panelNode.querySelector('.filter-category');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var empty = root.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && search) {
      search.value = query;
    }

    function currentValue(input) {
      return input && input.value ? input.value.trim().toLowerCase() : '';
    }

    function filter() {
      var q = currentValue(search);
      var y = currentValue(year);
      var t = currentValue(type);
      var r = currentValue(region);
      var c = currentValue(category);
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (t && cardType !== t) {
          ok = false;
        }
        if (r && cardRegion !== r) {
          ok = false;
        }
        if (c && cardCategory !== c) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, year, type, region, category].forEach(function (input) {
      if (input) {
        input.addEventListener('input', filter);
        input.addEventListener('change', filter);
      }
    });

    filter();
  });
})();
