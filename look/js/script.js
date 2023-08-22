// ローカルデータを取得する
let textDataString = localStorage.getItem('textData');
// 文字列をオブジェクトに変換する
let textData = JSON.parse(textDataString);
console.log(textData);

const grayscale = document.querySelector('#js-output-grayscale');
const imagePara = document.querySelector('#js-output-image');

// 今日の日付
const nowDate = new Date();
const year = nowDate.getFullYear();
const month = (nowDate.getMonth() + 1).toString().padStart(2, '0'); // 月をゼロ埋め
const day = nowDate.getDate().toString().padStart(2, '0'); // 日をゼロ埋め
const formattedDate = `${year}-${month}-${day}`;

if (textData && textData[formattedDate]) {
  // その日に書かれた日記の数だけリストを作る
  for (let i = textData[formattedDate].length - 1; i >= 0; i--) {
    // 日記が書かれた時間を取得する
    const atTheTime = new Date(textData[formattedDate][i].timestamp);
    const hours = atTheTime.getHours().toString().padStart(2, '0');
    const minutes = atTheTime.getMinutes().toString().padStart(2, '0');
    const seconds = atTheTime.getSeconds().toString().padStart(2, '0');

    const targetList = document.querySelectorAll('.sidebar-list');
    targetList.forEach((targetLists) => {
      if (i === textData[formattedDate].length - 1) {
        // タイトルを付ける（その日の日付）
        const sidebarDate = document.querySelectorAll('.sidebar-date');
        sidebarDate.forEach((sidebarDates) => {
          sidebarDates.innerHTML = formattedDate;
        });

        // ページを開いたとき、初めに表示する日記の時間
        const newListItemTemplate = `  
          <li  
            class="py-4 text-sm text-gray-600 bg-yellow-50 border-b-2 border-yellow-200"
            onclick="changeAtivePara(event, ${i})"
          >
            ${hours}:${minutes}:${seconds}
          </li>`;
        const newListItem = document
          .createRange()
          .createContextualFragment(newListItemTemplate);
        targetLists.appendChild(newListItem);
      } else {
        const newListItemTemplate = `<li
                      class="py-4 text-sm text-gray-600 hover:bg-yellow-50 border-b-2 border-yellow-200"
                      onclick="changeAtivePara(event, ${i})"
                    >
                      ${hours}:${minutes}:${seconds}
                    </li>`;
        const newListItem = document
          .createRange()
          .createContextualFragment(newListItemTemplate);
        targetLists.appendChild(newListItem);
      }
    });
  }
}

let index;
// サブメニューを押したとき
const changeAtivePara = (event, num) => {
  // 日記の内容を切り替える
  index = num;

  // サイドバーの見た目を変える
  const ulElements = document.querySelectorAll('.sidebar-list');
  ulElements.forEach((ulElement) => {
    const liElements = ulElement.querySelectorAll('li');
    liElements.forEach((liElement) => {
      liElement.classList.remove('bg-yellow-50');
      liElement.classList.add('hover:bg-yellow-50');
    });

    const targetElement = liElements[textData[formattedDate].length - 1 - num];
    targetElement.classList.remove('hover:bg-yellow-50');
    targetElement.classList.add('bg-yellow-50');
  });

  // サブメニューを閉じる
  submenu.classList.remove('-translate-x-0');
  submenu.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
};

const loop = () => {
  const fragment = document.createDocumentFragment();
  const fragmentImg = document.createDocumentFragment();

  grayscale.innerHTML = '';
  imagePara.innerHTML = '';

  textData[formattedDate][index].entityIds.forEach((entityId, i) => {
    // 入力された順に文字情報を順に取得する
    const { timestamp, value } =
      textData[formattedDate][index].entity[entityId];
    // ひとつ前の ID を取得する
    const prevEntityId = textData[formattedDate][index].entityIds[i - 1];
    // ひとつ前の文字情報との時差
    let diff = 0;

    // ひとつ前の ID が見つからなければ、1文字目なので時差なし、になる
    if (prevEntityId) {
      diff =
        timestamp -
        textData[formattedDate][index].entity[prevEntityId].timestamp;
    }

    // 入力された文字が改行コードか
    if ('\r\n' === value || '\r' === value || '\n' === value) {
      // 改行コードであれば br 要素を挿入して、以降の処理を中断する
      const br = document.createElement('br');
      fragment.appendChild(br);
      const brImg = document.createElement('br');
      fragmentImg.appendChild(brImg);
      grayscale.appendChild(fragment);
      imagePara.appendChild(fragmentImg);
      return;
    }

    // diffを適した値に変更する(diffはミリ秒)
    const calculatedDiff = (diff / 1000) * 100;

    // calculatedDiffをグレースケールに適した値に変更する
    const hslValue = Math.max(Math.min(100 - calculatedDiff, 99), 0);
    // グレースケールに適応させる
    const span = document.createElement('span');
    span.style.color = `hsl(0, 0%, ${hslValue}%)`;
    span.appendChild(document.createTextNode(value));
    fragment.appendChild(span);
    //console.log(diff, calculatedDiff, hslValue);

    // 写真と文字を合成する
    const spanImg = document.createElement('span');
    if (textData[formattedDate][index].entity[entityId].imageData) {
      spanImg.style.backgroundImage = `url(${textData[formattedDate][index].entity[entityId].imageData.imageUrl})`;
    }
    spanImg.style.backgroundClip = 'text';
    spanImg.style.webkitBackgroundClip = 'text';
    spanImg.style.color = 'transparent';
    spanImg.appendChild(document.createTextNode(value));
    fragmentImg.appendChild(spanImg);
  });

  grayscale.appendChild(fragment);
  imagePara.appendChild(fragmentImg);
  window.requestAnimationFrame(loop);
};

// 最初に表示する日記
if (textData && textData[formattedDate]) {
  index = textData[formattedDate].length - 1;
  window.requestAnimationFrame(loop);
}

// タブとタブのボタンを切り替える
const changeAtiveTab = (event, tabID) => {
  let element = event.target;
  while (element.nodeName !== 'A') {
    element = element.parentNode;
  }
  let ulElement = element.parentNode.parentNode;
  let aElements = ulElement.querySelectorAll('li > a');
  tabContents = document
    .getElementById('tabs-id')
    .querySelectorAll('.tab-content > div');
  for (let i = 0; i < aElements.length; i++) {
    aElements[i].classList.remove('bg-gray-50');
    aElements[i].classList.remove('cursor-default');
    aElements[i].classList.add('hover:bg-gray-50');
    aElements[i].classList.add('underline');
    aElements[i].classList.add('underline-offset-2');
    aElements[i].classList.add('cursor-pointer');
    aElements[i].classList.add('toolBtn');

    tabContents[i].classList.add('hidden');
    tabContents[i].classList.remove('block');
  }
  element.classList.remove('hover:bg-gray-50');
  element.classList.remove('underline');
  element.classList.remove('underline-offset-2');
  element.classList.remove('cursor-pointer');
  element.classList.remove('toolBtn');
  element.classList.add('bg-gray-50');
  element.classList.add('cursor-default');

  document.getElementById(tabID).classList.remove('hidden');
  document.getElementById(tabID).classList.add('block');
};

// ヘルプのオンオフ
const tooltipsOnOff = (event) => {
  const tooltip = document.querySelectorAll('.toolBtn-tooltip');
  const tooltipOff = document.querySelectorAll('.tooltipOff');
  const helpTooltip = document.querySelector('.helpBtn-tooltip');

  if (tooltip.length > 0) {
    tooltip.forEach((tooltips) => {
      tooltips.classList.remove('toolBtn-tooltip');
      tooltips.classList.add('tooltipOff');
      helpTooltip.innerHTML = 'ヘルプをオンにする';
    });
  } else if (tooltipOff.length > 0) {
    tooltipOff.forEach((tooltipOffs) => {
      tooltipOffs.classList.remove('tooltipOff');
      tooltipOffs.classList.add('toolBtn-tooltip');
      helpTooltip.innerHTML = 'ヘルプをオフにする';
    });
  }
};

// ボタンを押したときサイドメニュー（サイドバー）を出す
const submenuOpenBtn = document.getElementById('submenu-openButton');
const submenuCloseBtn = document.getElementById('submenu-closeBtn');
const submenu = document.getElementById('submenu');

// オーバーレイを出す
const overlay = document.getElementById('submenu-overlay');

// サブメニューを開く
submenuOpenBtn.addEventListener('click', () => {
  submenu.classList.remove('-translate-x-full');
  submenu.classList.add('-translate-x-0');
  overlay.classList.remove('hidden');
});

// サブメニューを閉じる
submenuCloseBtn.addEventListener('click', () => {
  submenu.classList.remove('-translate-x-0');
  submenu.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
});
// windowサイズが変わったときもサブメニューを閉じる
window.addEventListener('resize', () => {
  submenu.classList.remove('-translate-x-0');
  submenu.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
});

//localStorage.clear();
