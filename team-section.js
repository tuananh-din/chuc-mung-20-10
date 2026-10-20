// team-section.js — vẽ lưới thẻ hoa cho từng nhân sự từ team-members.js; nhấn thẻ → điền tên người đó + nở hoa
(function () {
  'use strict';
  const members = window.TEAM_MEMBERS || [];
  const section = document.getElementById('doi-ngu');
  const grid = document.getElementById('danh-sach-hoa');
  const teamName = document.getElementById('ten-team');
  if (!members.length) return; // chưa có danh sách → giữ phần này ẩn

  const FLOWERS = ['🌸', '🌷', '🌹', '🌼', '🌺', '💐', '🪷', '🌻'];
  const DEFAULT_WISHES = [
    'Chúc luôn rạng rỡ, hạnh phúc và tràn đầy năng lượng mỗi ngày.',
    'Chúc nụ cười luôn nở trên môi như trăm hoa đua nở hôm nay.',
    'Chúc thật nhiều sức khoẻ, niềm vui và thành công trên mọi con đường.',
    'Cảm ơn vì luôn dịu dàng, tận tâm với cả team. Chúc một ngày thật ngọt ngào!',
  ];

  teamName.textContent = window.TEAM_NAME || 'team';

  // Ảnh tròn thay cho icon hoa; icon thu nhỏ thành huy hiệu ở góc ảnh. Ảnh lỗi → quay về icon hoa to.
  function addAvatar(icon, m) {
    const avatar = document.createElement('span');
    avatar.className = 'the-hoa-avatar';
    const img = new Image(96, 96);
    img.className = 'the-hoa-anh';
    img.alt = m.ten;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      icon.classList.remove('the-hoa-huy-hieu');
      avatar.before(icon);
      avatar.remove();
    });
    img.src = m.anh;
    icon.before(avatar);
    icon.classList.add('the-hoa-huy-hieu');
    avatar.append(img, icon);
  }

  members.forEach((m, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'the-hoa';
    card.style.setProperty('--tre', `${i * 90}ms`);
    card.innerHTML =
      '<span class="the-hoa-icon"></span><span class="the-hoa-ten"></span>' +
      '<span class="the-hoa-biet-danh"></span><span class="the-hoa-vai-tro"></span>' +
      '<span class="the-hoa-loi-chuc"></span>';
    // Dùng textContent để tên/biệt danh/lời chúc luôn là văn bản thuần
    const icon = card.querySelector('.the-hoa-icon');
    icon.textContent = FLOWERS[i % FLOWERS.length];
    if (m.anh) addAvatar(icon, m);
    card.querySelector('.the-hoa-ten').textContent = m.ten;
    card.querySelector('.the-hoa-biet-danh').textContent = m.bietDanh || '';
    card.querySelector('.the-hoa-vai-tro').textContent = m.vaiTro || '';
    card.querySelector('.the-hoa-loi-chuc').textContent = m.loiChuc || DEFAULT_WISHES[i % DEFAULT_WISHES.length];

    card.addEventListener('click', () => {
      const input = document.getElementById('ten');
      input.value = m.ten;
      input.dispatchEvent(new Event('input')); // main.js cập nhật lời chào theo tên
      if (window.garden) window.garden.burst(10);
      document.getElementById('loi-chao').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    grid.appendChild(card);
  });

  section.hidden = false;
})();
