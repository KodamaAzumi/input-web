// ヘッダーのメニュー
const headerOpenBtn = document.getElementById("header-menu-openBtn");
const headerCloseBtn = document.getElementById("header-menu-closeBtn");
const headerMenu = document.getElementById("header-menu");

// ヘッダーのメニューを開く
headerOpenBtn.addEventListener("click", () => {
  headerMenu.classList.remove("translate-x-full");
  headerMenu.classList.add("translate-x-0");
});

// ヘッダーのメニューを閉じる
headerCloseBtn.addEventListener("click", () => {
  headerMenu.classList.remove("translate-x-0");
  headerMenu.classList.add("translate-x-full");
});
