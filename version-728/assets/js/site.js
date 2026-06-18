(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            var open = mobileMenu.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var index = 0;

    function setSlide(next) {
        if (!slides.length) {
            return;
        }

        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    var prevButton = document.querySelector(".hero-control.prev");
    var nextButton = document.querySelector(".hero-control.next");

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            setSlide(index - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            setSlide(index + 1);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            setSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            setSlide(index + 1);
        }, 5600);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchableCards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var noResult = document.querySelector("[data-no-result]");

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function filterCards(value) {
        var query = value.trim().toLowerCase();
        var visible = 0;

        searchableCards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var title = (card.getAttribute("data-title") || "").toLowerCase();
            var match = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
            card.style.display = match ? "" : "none";

            if (match) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.style.display = visible ? "none" : "block";
        }
    }

    if (searchInput) {
        var initialQuery = getQuery();
        searchInput.value = initialQuery;
        filterCards(initialQuery);

        searchInput.addEventListener("input", function () {
            filterCards(searchInput.value);
        });
    }
})();
