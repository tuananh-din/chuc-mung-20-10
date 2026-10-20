// main.js — tên người nhận, lời chúc xoay vòng, nút nở hoa và sao chép link gửi tặng
(function () {
  'use strict';
  const WISHES = [
    'Chúc chị em luôn xinh đẹp, trẻ trung và tràn đầy năng lượng. Mỗi ngày đều là một ngày 20/10!',
    'Chúc mẹ, chúc chị, chúc em: sức khoẻ dồi dào, nụ cười luôn nở trên môi như trăm hoa đua nở.',
    'Cảm ơn vì đã dịu dàng với thế giới này. Chúc một ngày thật nhiều hoa, nhiều quà và nhiều niềm vui.',
    'Chúc những người phụ nữ tuyệt vời luôn được yêu thương, trân trọng và thành công trên mọi con đường.',
    'Hãy để hôm nay là ngày của bạn: được nghỉ ngơi, được chiều chuộng và được nhận thật nhiều lời chúc tốt đẹp.',
  ];
  const $ = s => document.querySelector(s);
  const nameInput = $('#ten');
  const greeting = $('#loi-chao');
  const wishText = $('#loi-chuc');
  const toast = $('#toast');
  let wishIndex = 0;
  let toastTimer;

  function renderGreeting() {
    const name = nameInput.value.trim();
    greeting.textContent = name
      ? `Gửi đến ${name}, những đoá hoa đẹp nhất của ngày hôm nay.`
      : 'Gửi đến những người phụ nữ tuyệt vời, những đoá hoa đẹp nhất của ngày hôm nay.';
    document.title = name ? `Chúc mừng 20/10, ${name}` : 'Chào mừng 20/10';
  }

  function showWish(i, instant) {
    if (instant) { wishText.textContent = WISHES[i]; return; }
    wishText.classList.add('fading');
    setTimeout(() => { wishText.textContent = WISHES[i]; wishText.classList.remove('fading'); }, 250);
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // Tên người nhận lấy từ ?ten= trên URL để có thể gửi link cá nhân hoá
  const param = new URLSearchParams(location.search).get('ten');
  if (param) nameInput.value = param.slice(0, 40);
  renderGreeting();
  showWish(0, true);

  nameInput.addEventListener('input', renderGreeting);

  $('#btn-loi-chuc').addEventListener('click', () => {
    wishIndex = (wishIndex + 1) % WISHES.length;
    showWish(wishIndex);
  });

  $('#btn-no-hoa').addEventListener('click', () => {
    window.garden.burst(14);
    showToast('🌸 Thêm một vườn hoa nữa!');
  });

  $('#btn-chia-se').addEventListener('click', async () => {
    const url = new URL(location.href);
    const name = nameInput.value.trim();
    if (name) url.searchParams.set('ten', name); else url.searchParams.delete('ten');
    try {
      await navigator.clipboard.writeText(url.toString());
      showToast('Đã sao chép link, gửi tặng ngay nhé!');
    } catch {
      showToast('Không sao chép được, hãy copy link trên thanh địa chỉ.');
    }
  });
})();
