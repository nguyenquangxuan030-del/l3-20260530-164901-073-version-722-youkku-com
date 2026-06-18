(function () {
    function setStatus(player, message) {
        var status = player.querySelector('[data-player-status]');

        if (status) {
            status.textContent = message;
        }
    }

    function initPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-start]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');

        if (!source) {
            setStatus(player, '未找到播放源。');
            return;
        }

        function playVideo() {
            if (button) {
                button.classList.add('hidden');
            }

            setStatus(player, '正在连接播放源…');

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus(player, '播放源已就绪。');
                    video.play().catch(function () {
                        setStatus(player, '播放已就绪，请再次点击视频开始播放。');
                    });
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus(player, '播放连接异常，可刷新页面后重试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setStatus(player, '播放源已就绪。');
                    video.play().catch(function () {
                        setStatus(player, '播放已就绪，请再次点击视频开始播放。');
                    });
                }, { once: true });
            } else {
                video.src = source;
                setStatus(player, '浏览器不支持 HLS 插件时会尝试直接播放。');
                video.play().catch(function () {
                    setStatus(player, '当前浏览器需要 HLS 支持，请换用支持 HLS 的浏览器或网络环境。');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo, { once: true });
        }
    }

    document.querySelectorAll('[data-player]').forEach(initPlayer);
}());
