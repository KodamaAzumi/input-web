//localStorage.clear();

// ローカルデータを取得する
let textDataString = localStorage.getItem('textData');
// 文字列をオブジェクトに変換する
let textData = JSON.parse(textDataString);
console.log(textData);

const grayscaleOutput = document.querySelector('#js-output-grayscale');
const imgOutput = document.querySelector('#js-output-image');
const scaleOutput = document.querySelector('#js-output-scale');

// 文章を書いていないときはタイムラインに飛ばないようにする
const timelineBtn = document.getElementById('js-timelineBtn');
const timelineBtnHandler = (e) => {
  e.preventDefault();
};

// 時間を作るクラス
const createTime = new Time();

// 表示したい文章の日付
const formattedDate = localStorage.getItem('dateData');

// 最後に表示していた日記のインデックス
const savedNum = localStorage.getItem('savedNumber');
const parsedNum = parseInt(savedNum);

// サブメニューを作る
if (textData && textData[formattedDate]) {
  // タイトルを付ける（その日の日付）
  const sidebarDate = document.querySelectorAll('.sidebar-date');
  sidebarDate.forEach((sidebarDates) => {
    sidebarDates.innerHTML = formattedDate;
  });

  // その日に書かれた日記の数だけリストを作る
  for (let i = textData[formattedDate].length - 1; i >= 0; i--) {
    // 日記が書かれた時間を取得する
    const timeString = createTime.createTimeStr(
      textData[formattedDate][i].timestamp
    );

    const targetLists = document.querySelectorAll('.sidebar-list');
    targetLists.forEach((targetList) => {
      if (
        // 最後に表示されていた日記を再度ページを開いたときに表示する
        (!savedNum && i === textData[formattedDate].length - 1) ||
        (savedNum && i === parsedNum)
      ) {
        // ページを開いたとき、初めに表示されている日記のサイドバー（サイドメニュー）の見た目
        const newListItemTemplate = `  
          <li  
            class="py-4 text-sm text-gray-600 bg-yellow-50 border-b-2 border-yellow-200"
            onclick="changeAtivePara(event, ${i})"
          >
            ${timeString}
          </li>`;
        const newListItem = document
          .createRange()
          .createContextualFragment(newListItemTemplate);
        targetList.appendChild(newListItem);
      } else {
        const newListItemTemplate = `<li
                      class="py-4 text-sm text-gray-600 hover:bg-yellow-50 border-b-2 border-yellow-200"
                      onclick="changeAtivePara(event, ${i})"
                    >
                      ${timeString}
                    </li>`;
        const newListItem = document
          .createRange()
          .createContextualFragment(newListItemTemplate);
        targetList.appendChild(newListItem);
      }
    });
  }

  // タイムラインページに飛べるようにする
  timelineBtn.removeEventListener('click', timelineBtnHandler);
} else {
  timelineBtn.addEventListener('click', timelineBtnHandler);
}

let index;
// サブメニューを押したとき
const changeAtivePara = (event, num) => {
  // 日記の内容を切り替える
  index = num;

  // タイムラインを表示できるように番号を保存する
  localStorage.setItem('savedNumber', num);

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

// 本文を表示する
const loop = () => {
  const fragmentGrayscale = document.createDocumentFragment();
  const fragmentImg = document.createDocumentFragment();
  const fragmentScale = document.createDocumentFragment();

  grayscaleOutput.innerHTML = '';
  imgOutput.innerHTML = '';
  scaleOutput.innerHTML = '';

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
      const brGrayscale = document.createElement('br');
      fragmentGrayscale.appendChild(brGrayscale);
      const brImg = document.createElement('br');
      fragmentImg.appendChild(brImg);
      const brScale = document.createElement('br');
      fragmentScale.appendChild(brScale);
      grayscaleOutput.appendChild(fragmentGrayscale);
      imgOutput.appendChild(fragmentImg);
      scaleOutput.appendChild(fragmentScale);
      return;
    }

    // diffを適した値に変更する(diffはミリ秒)
    const calculatedDiff = (diff / 1000) * 100;

    // calculatedDiffをグレースケールに適した値に変更する
    const hslValue = Math.max(Math.min(100 - calculatedDiff, 99), 0);
    // グレースケールに適応させる
    const spanGrayscale = document.createElement('span');
    spanGrayscale.style.color = `hsl(0, 0%, ${hslValue}%)`;
    spanGrayscale.appendChild(document.createTextNode(value));
    fragmentGrayscale.appendChild(spanGrayscale);
    grayscaleOutput.appendChild(fragmentGrayscale);
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
    imgOutput.appendChild(fragmentImg);

    // 文字の幅に適応させる
    (() => {
      const char = document.createElement('span');
      const charBody = document.createElement('span');
      // 1 文字目は時差なし、なので必ず 1.0 になる
      // 1 文字目以降は時差に応じて文字の大きさを変える
      // 4000 ミリ秒で最大の 10 倍になる
      const sx = Math.abs(1.0 + Math.min((diff / 4000) * 9, 9));

      char.style.display = 'inline-block';
      charBody.style.transform = `scaleX(${sx})`;
      charBody.style.transformOrigin = `top left`;
      charBody.style.display = 'inline-block';

      charBody.appendChild(document.createTextNode(value));
      char.appendChild(charBody);
      fragmentScale.appendChild(char);
      scaleOutput.appendChild(fragmentScale);

      const charBodyDOMRect = charBody.getBoundingClientRect();
      char.style.width = `${charBodyDOMRect.width}px`;
    })();
  });

  window.requestAnimationFrame(loop);
};

// 最初に表示する日記
if (textData && textData[formattedDate]) {
  // 最後に表示した日記を表示する
  if (savedNum) {
    index = parsedNum;
    console.log(index);
  } else {
    // 一番初めは最新の日記を表示する
    index = textData[formattedDate].length - 1;
  }
  window.requestAnimationFrame(loop);
}

// 破棄ボタンを押したときに日記を消去する
const discardButton = document.getElementById('js-discardBtn');
const onDeleted = () => {
  console.log('click deleteButton');
  if (textData && textData[formattedDate]) {
    // 日記をストレージから消去する
    textData[formattedDate].splice(index, 1);

    //　その日のオブジェクトに日記が無い場合はキーごと消去する
    if (textData[formattedDate].length === 0) {
      delete textData[formattedDate];
    } else {
      // 消去した後は最新の日記を表示する
      index = textData[formattedDate].length - 1;

      // タイムラインを表示できるように番号を保存する
      localStorage.setItem('savedNumber', index);
    }

    // ローカルストレージに保存する
    textDataString = JSON.stringify(textData);
    localStorage.setItem('textData', textDataString);

    location.reload();
    console.log('delete data');
  }
};
discardButton.addEventListener('click', onDeleted);

// タブとタブのボタンを切り替える
const changeAtiveTab = (event, tabID) => {
  let element = event.target;
  let ulElement = element.parentNode.parentNode;
  let aElements = ulElement.querySelectorAll('li > a');
  tabContents = document
    .getElementById('tabs-id')
    .querySelectorAll('.tab-content > div');

  for (let i = 0; i < aElements.length; i++) {
    // ボタンの見た目を変える
    aElements[i].classList.remove('bg-gray-50', 'cursor-default');
    aElements[i].classList.add(
      'hover:bg-gray-50',
      'underline',
      'underline-offset-2',
      'cursor-pointer',
      'toolBtn'
    );

    // 表示されているものをhiddenにする
    tabContents[i].classList.add('hidden');
    tabContents[i].classList.remove('block');
  }

  // ボタンの見た目を変える
  element.classList.remove(
    'hover:bg-gray-50',
    'underline',
    'underline-offset-2',
    'cursor-pointer',
    'toolBtn'
  );
  element.classList.add('bg-gray-50', 'cursor-default');

  // 隠されていた表示する
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
