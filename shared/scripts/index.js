// ヘッダーのメニュー
const headerOpenBtn = document.getElementById('header-menu-openBtn');
const headerCloseBtn = document.getElementById('header-menu-closeBtn');
const headerMenu = document.getElementById('header-menu');

// オーバーレイ
const overlay = document.getElementById('js-overlay');

// ヘッダーのメニューを開く
headerOpenBtn.addEventListener('click', () => {
  headerMenu.classList.remove('translate-x-full');
  headerMenu.classList.add('translate-x-0');
  overlay.classList.remove('hidden');
});

// ヘッダーのメニューを閉じる
headerCloseBtn.addEventListener('click', () => {
  headerMenu.classList.remove('translate-x-0');
  headerMenu.classList.add('translate-x-full');
  overlay.classList.add('hidden');
});

// ウィンドウサイズ変更したときもヘッダーのメニューを閉じる
window.addEventListener('resize', () => {
  headerMenu.classList.remove('translate-x-0');
  headerMenu.classList.add('translate-x-full');
  overlay.classList.add('hidden');
});
