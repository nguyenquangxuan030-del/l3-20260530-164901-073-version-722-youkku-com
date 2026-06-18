(function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var app = document.querySelector('[data-search-app]');

    if (!app) {
        return;
    }

    var input = app.querySelector('[data-search-input]');
    var button = app.querySelector('[data-search-button]');
    var typeSelect = app.querySelector('[data-search-type]');
    var regionSelect = app.querySelector('[data-search-region-alt]');
    var yearSelect = app.querySelector('[data-search-year]');
    var sortSelect = app.querySelector('[data-search-sort]');
    var results = app.querySelector('[data-search-results]');
    var count = app.querySelector('[data-search-count]');

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card normal">',
            '    <a class="poster-link" href="video/' + movie.id + '.html">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="play-chip">立即观看</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="video/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p class="movie-meta">',
            '            <a href="category/' + movie.categorySlug + '.html">' + escapeHtml(movie.categoryName) + '</a>',
            '            <span>' + escapeHtml(movie.yearText) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '        </p>',
            '        <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="movie-tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function applySearch() {
        var keyword = normalize(input ? input.value.trim() : '');
        var typeValue = typeSelect ? typeSelect.value : '';
        var regionValue = regionSelect ? regionSelect.value : '';
        var yearValue = yearSelect ? yearSelect.value : '';
        var sortValue = sortSelect ? sortSelect.value : 'views-desc';

        var filtered = data.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine,
                movie.categoryName
            ].join(' '));

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }

            if (typeValue && movie.type !== typeValue) {
                return false;
            }

            if (regionValue && movie.region !== regionValue) {
                return false;
            }

            if (yearValue && String(movie.year) !== yearValue) {
                return false;
            }

            return true;
        });

        filtered.sort(function (a, b) {
            if (sortValue === 'year-desc') {
                return b.year - a.year;
            }

            if (sortValue === 'title-asc') {
                return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN');
            }

            return b.views - a.views;
        });

        var visible = filtered.slice(0, 240);

        if (results) {
            results.innerHTML = visible.map(renderCard).join('\n');
        }

        if (count) {
            count.textContent = '找到 ' + filtered.length + ' 部影片，当前显示前 ' + visible.length + ' 部。';
        }
    }

    if (input) {
        input.value = getQueryParam('q');
        input.addEventListener('input', applySearch);
    }

    [button, typeSelect, regionSelect, yearSelect, sortSelect].forEach(function (item) {
        if (!item) {
            return;
        }

        item.addEventListener(item.tagName === 'BUTTON' ? 'click' : 'change', applySearch);
    });

    applySearch();
}());
