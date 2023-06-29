import './index.css'

const productBtn1 = document.getElementById('product-btn1');
const flyoutMenu = document.getElementById('product-flyout-menu');
productBtn1.addEventListener('click', () => {
    // 特定のクラスが要素に存在するかを確認する
    if (flyoutMenu.classList.contains('active')) {
        flyoutMenu.classList.remove('active');
    } else {
        flyoutMenu.classList.add('active');
    }  
});

const productBtn2 = document.getElementById('product-btn2');
const productIcon2 = document.getElementById('product-icon2');
productBtn2.addEventListener('click', () => {
    // 特定のクラスが要素に存在するかを確認する
    if (productIcon2.classList.contains('rotate-180')) {
        productIcon2.classList.remove('rotate-180');
    } else {
        productIcon2.classList.add('rotate-180');
    }  
});