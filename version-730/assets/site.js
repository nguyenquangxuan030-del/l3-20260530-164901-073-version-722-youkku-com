(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var button = qs('[data-mobile-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getCardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-meta') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
    }

    function filterCards(query) {
        var normalized = (query || '').trim().toLowerCase();
        var cards = qsa('[data-movie-card]');
        var rows = qsa('.rank-row');
        var visible = 0;

        cards.forEach(function (card) {
            var matched = !normalized || getCardText(card).indexOf(normalized) !== -1;
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        rows.forEach(function (row) {
            var text = (row.textContent || '').toLowerCase();
            var matched = !normalized || text.indexOf(normalized) !== -1;
            row.classList.toggle('is-hidden', !matched);
        });

        qsa('[data-search-count]').forEach(function (node) {
            if (normalized) {
                node.textContent = '搜索“' + query + '”找到 ' + visible + ' 部影片';
            }
        });
    }

    function setupSearch() {
        var forms = qsa('[data-search-form]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || params.get('search') || '';
        var isIndex = document.body.getAttribute('data-page') === 'index';

        forms.forEach(function (form) {
            var input = qs('input[name="q"]', form);
            if (input && query) {
                input.value = query;
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var currentInput = qs('input[name="q"]', form);
                var value = currentInput ? currentInput.value.trim() : '';
                if (document.body.getAttribute('data-page') === 'index' || document.body.getAttribute('data-page') === 'category' || document.body.getAttribute('data-page') === 'rank') {
                    filterCards(value);
                    if (value) {
                        window.history.replaceState(null, '', window.location.pathname + '?q=' + encodeURIComponent(value));
                    }
                } else if (value) {
                    window.location.href = './index.html?q=' + encodeURIComponent(value);
                }
            });
        });

        if (query && (isIndex || document.body.getAttribute('data-page') === 'category' || document.body.getAttribute('data-page') === 'rank')) {
            filterCards(query);
        }
    }

    function setupPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var video = qs('video[data-src]', box);
            var button = qs('[data-play]', box);
            if (!video || !button) {
                return;
            }

            function attachSource() {
                var source = video.getAttribute('data-src');
                if (!source || video.getAttribute('data-ready') === 'true') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.setAttribute('data-ready', 'true');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    box._hls = hls;
                    video.setAttribute('data-ready', 'true');
                    return;
                }

                video.src = source;
                video.setAttribute('data-ready', 'true');
            }

            function playVideo() {
                attachSource();
                box.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        box.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', playVideo);
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    box.classList.remove('is-playing');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
