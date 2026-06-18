document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-video-frame]").forEach(function (frame) {
    const video = frame.querySelector("video[data-hls-src]");
    const trigger = frame.querySelector("[data-play-trigger]");
    const tip = document.querySelector("[data-player-tip]");

    if (!video) {
      return;
    }

    let initialized = false;

    function setTip(message) {
      if (tip) {
        tip.textContent = message;
      }
    }

    function initSource() {
      if (initialized) {
        return;
      }

      const source = video.dataset.hlsSrc;

      if (!source) {
        setTip("当前影片暂未绑定播放源。");
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        initialized = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        initialized = true;
        return;
      }

      setTip("当前浏览器不支持在线播放，请更换支持 HLS 的浏览器后再试。");
    }

    function playVideo() {
      initSource();

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setTip("浏览器阻止了自动播放，请直接点击播放器控制条上的播放按钮。");
        });
      }

      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    }

    if (trigger) {
      trigger.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (trigger && video.currentTime === 0) {
        trigger.classList.remove("is-hidden");
      }
    });
  });
});
