// music-player.js — màn "Mở thiệp" để bắt đầu nhạc nền (trình duyệt chỉ cho phát sau thao tác người dùng) và nút bật/tắt nhạc
(function () {
  'use strict';
  const audio = document.getElementById('nhac-nen');
  const overlay = document.getElementById('mo-thiep');
  const openBtn = document.getElementById('btn-mo-thiep');
  const toggleBtn = document.getElementById('btn-nhac');
  audio.volume = 0.6;

  function setToggle(playing) {
    toggleBtn.setAttribute('aria-pressed', String(playing));
    toggleBtn.classList.toggle('dang-phat', playing);
    toggleBtn.title = playing ? 'Tắt nhạc nền' : 'Bật nhạc nền';
  }

  async function play() {
    try { await audio.play(); setToggle(true); }
    catch { setToggle(false); } // bị chặn autoplay hoặc thiếu file nhạc → chỉ hiện nút tắt
  }

  openBtn.addEventListener('click', () => {
    overlay.classList.add('an');
    setTimeout(() => overlay.remove(), 650);
    play();
    if (window.garden) window.garden.replant(); // vườn hoa nở lại từ đầu đúng lúc mở thiệp
  });

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) play();
    else { audio.pause(); setToggle(false); }
  });
  audio.addEventListener('play', () => setToggle(true));
  audio.addEventListener('pause', () => setToggle(false));
  setToggle(false);
})();
