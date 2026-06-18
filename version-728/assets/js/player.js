(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-playurl]"));

    boxes.forEach(function (box) {
        var video = box.querySelector("video");
        var layer = box.querySelector(".play-layer");
        var button = box.querySelector(".play-button");
        var url = box.getAttribute("data-playurl");
        var ready = false;

        function start() {
            if (!video || !url) {
                return;
            }

            if (ready) {
                video.play();
                if (layer) {
                    layer.classList.add("is-hidden");
                }
                return;
            }

            ready = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        video.src = url;
                        video.play();
                    }
                });
            } else {
                video.src = url;
                video.play();
            }

            if (layer) {
                layer.classList.add("is-hidden");
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        if (layer) {
            layer.addEventListener("click", start);
        }
    });
})();
