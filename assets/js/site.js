(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    var menuToggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var carousel = qs('[data-hero-carousel]');

    if (carousel) {
        var slides = qsa('.hero-slide', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var prev = qs('[data-hero-prev]', carousel);
        var next = qs('[data-hero-next]', carousel);
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var filterInput = qs('[data-card-filter]');
    var sortSelect = qs('[data-card-sort]');
    var cardList = qs('[data-card-list]');

    function filterCards() {
        if (!cardList) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var cards = qsa('.movie-card', cardList);

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();

            card.style.display = haystack.indexOf(keyword) >= 0 ? '' : 'none';
        });
    }

    function sortCards() {
        if (!cardList || !sortSelect) {
            return;
        }

        var cards = qsa('.movie-card', cardList);
        var mode = sortSelect.value;

        cards.sort(function (a, b) {
            var ay = Number(a.getAttribute('data-year')) || 0;
            var by = Number(b.getAttribute('data-year')) || 0;
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';

            if (mode === 'year-asc') {
                return ay - by;
            }

            if (mode === 'title-asc') {
                return at.localeCompare(bt, 'zh-Hans-CN');
            }

            return by - ay;
        });

        cards.forEach(function (card) {
            cardList.appendChild(card);
        });

        filterCards();
    }

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }
}());
