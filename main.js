import "./index.css";

// ヘッダーのメニュー
const headerOpenBtn = document.getElementById("header-menu-openBtn");
const headerCloseBtn = document.getElementById("header-menu-closeBtn");
const headerMenu = document.getElementById("header-menu");

// ヘッダーのメニューを開くコード
headerOpenBtn.addEventListener("click", () => {
  headerMenu.classList.remove("translate-x-full");
  headerMenu.classList.add("translate-x-0");
});

// ヘッダーのメニューを閉じるコード
headerCloseBtn.addEventListener("click", () => {
  headerMenu.classList.remove("translate-x-0");
  headerMenu.classList.add("translate-x-full");
});
