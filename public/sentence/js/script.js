//localStorage.clear();
const grayscaleOutput = document.querySelector('#js-output-grayscale');
const imgOutput = document.querySelector('#js-output-image');
const scaleOutput = document.querySelector('#js-output-scale');

// 時間を作るインスタンス
const createTime = new Time();

// 表示したい文章の日付
const activeDate = localStorage.getItem('activeDate');

// 最後に表示していた日記のインデックス
const savedNum = localStorage.getItem('savedNumber');
const parsedNum = parseInt(savedNum);

// データに関するインスタンス
const data = new Data();

// サブメニューを作る（２つ）
const createSubmenu = async () => {
  // タイトルを付ける（表示したい文章の日付）
  const sidebarDates = document.querySelectorAll('.sidebar-date');
  sidebarDates.forEach((sidebarDate) => {
    sidebarDate.innerHTML = activeDate;
  });

  const postDates = await data.getPostDates();

  if (postDates && !(postDates.dates.length === 0)) {
    const timestamps = postDates.timestamps;

    timestamps[activeDate].forEach((timestamp, i) => {
      // 日記が書かれた時間を取得する
      const formattedTime = createTime.createTimeStr(timestamp);

      // その日に書かれた日記の数だけリストを作る
      const targetLists = document.querySelectorAll('.sidebar-list');
      targetLists.forEach((targetList) => {
        if (
          // 最後に表示されていた日記を再度ページを開いたときに表示する
          i === parsedNum
        ) {
          // ページを開いたとき、初めに表示されている日記のサイドバー（サイドメニュー）の見た目
          const newListItemTemplate = `  
          <li  
            class="py-4 bg-yellow-50 border-b-2 border-yellow-200"
            onclick="changeActivePara(event, ${i})"
          >
            ${formattedTime}
          </li>`;
          const newListItem = document
            .createRange()
            .createContextualFragment(newListItemTemplate);
          targetList.appendChild(newListItem);
        } else {
          const newListItemTemplate = `<li
                      class="py-4 hover:bg-yellow-50 border-b-2 border-yellow-200"
                      onclick="changeActivePara(event, ${i})"
                    >
                      ${formattedTime}
                    </li>`;
          const newListItem = document
            .createRange()
            .createContextualFragment(newListItemTemplate);
          targetList.appendChild(newListItem);
        }
      });
    });
  } else {
    // データがないときは文章を表示させる
    document.querySelectorAll('.sidebar-attention').forEach((element) => {
      element.classList.remove('hidden');
    });

    // データがないときはタイトル（日付）とサイドバーを隠す
    document.querySelectorAll('.sidebar-date').forEach((element) => {
      element.classList.add('hidden');
    });
    document.querySelectorAll('.sidebar-list').forEach((element) => {
      element.classList.add('hidden');
    });
  }
};

createSubmenu();

let textarea;
let timestamp;

// 本文を表示する
const showSentence = async (index) => {
  const loop = () => {
    const fragmentGrayscale = document.createDocumentFragment();
    const fragmentImg = document.createDocumentFragment();
    const fragmentScale = document.createDocumentFragment();

    // 現在のスクロール位置を取得する
    const scrollY = document.documentElement.scrollTop;

    grayscaleOutput.innerHTML = '';
    imgOutput.innerHTML = '';
    scaleOutput.innerHTML = '';

    textarea.entityIds.forEach((entityId, i) => {
      // 入力された順に文字情報を順に取得する
      const { timestamp, value } = textarea.entity[entityId];
      // ひとつ前の ID を取得する
      const prevEntityId = textarea.entityIds[i - 1];
      // ひとつ前の文字情報との時差
      let diff = 0;

      // ひとつ前の ID が見つからなければ、1文字目なので時差なし、になる
      if (prevEntityId) {
        diff = timestamp - textarea.entity[prevEntityId].timestamp;
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
      spanGrayscale.classList.add('inline-block', 'm-0.5');
      spanGrayscale.style.color = `hsl(0, 0%, ${hslValue}%)`;
      spanGrayscale.appendChild(document.createTextNode(value));
      fragmentGrayscale.appendChild(spanGrayscale);
      grayscaleOutput.appendChild(fragmentGrayscale);

      // 写真と文字を合成する
      const spanImgOuter = document.createElement('span');
      spanImgOuter.classList.add('inline-block', 'px-3', 'py-1');
      const spanImg = document.createElement('span');
      if (!(value === ' ' || value === '　')) {
        if (textarea.entity[entityId].image) {
          spanImgOuter.style.backgroundImage = `url(${textarea.entity[entityId].image})`;
        } else {
          const imageUrl = `${data.IMG_BASE_URL}/${data.id}/${dir}/${entityId}.jpeg`;
          spanImgOuter.style.backgroundImage = `url(${imageUrl})`;
        }
        spanImgOuter.style.backgroundSize = 'cover';
        spanImgOuter.style.backgroundPosition = 'center';
        spanImg.style.color = '#fff';
        spanImg.style.mixBlendMode = 'difference';
      }
      spanImg.appendChild(document.createTextNode(value));
      spanImgOuter.appendChild(spanImg);
      fragmentImg.appendChild(spanImgOuter);
      imgOutput.appendChild(fragmentImg);

      // 文字の幅に適応させる
      (() => {
        const char = document.createElement('span');
        const charBody = document.createElement('span');
        // 1 文字目は時差なし、なので必ず 1.0 になる
        // 1 文字目以降は時差に応じて文字の大きさを変える
        // 4000 ミリ秒で最大の 10 倍になる
        const sx = Math.abs(1.0 + Math.min((diff / 4000) * 9, 9));

        char.classList.add('inline-block', 'm-0.5');

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

    document.documentElement.scrollTop = scrollY;

    window.requestAnimationFrame(loop);
  };

  const postDates = await data.getPostDates();
  if (!postDates) {
    console.log('postDatesがありません');
    return;
  }
  const timestamps = postDates.timestamps;
  timestamp = timestamps[activeDate][index];
  const sentenceData = await data.getSentence(timestamp);
  const { entities, entityIds, dir } = sentenceData;

  textarea = new Sentence('#js-textarea', entities, entityIds);

  window.requestAnimationFrame(loop);
};

showSentence(parsedNum);
console.log(parsedNum);

// タブをクリックしたときにテキストエリアにフォーカスさせる
document.getElementById('tabs-id').addEventListener('click', (e) => {
  textarea.el.focus();
});

// サブメニューを押したとき
const changeActivePara = (event, num) => {
  // 日記の内容を切り替える
  showSentence(num);

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

    const targetElement = liElements[num];
    targetElement.classList.remove('hover:bg-yellow-50');
    targetElement.classList.add('bg-yellow-50');
  });

  // サブメニューを閉じる
  submenu.classList.remove('-translate-x-0');
  submenu.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
};

let tabName = 'tab-grayscale';
// タブとタブのボタンを切り替える
const changeActiveTab = (event, tabID) => {
  tabName = tabID;
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
      'underline-offset-4',
      'cursor-pointer'
    );

    // 表示されているものをhiddenにする
    tabContents[i].classList.add('hidden');
    tabContents[i].classList.remove('block');
  }

  // ボタンの見た目を変える
  element.classList.remove(
    'hover:bg-gray-50',
    'underline',
    'underline-offset-4',
    'cursor-pointer'
  );
  element.classList.add('bg-gray-50', 'cursor-default');

  // 隠されていた表示する
  document.getElementById(tabID).classList.remove('hidden');
  document.getElementById(tabID).classList.add('block');
};

// ヘルプのオンオフ
const tooltipsOnOff = (event) => {
  const tooltipOns = document.querySelectorAll('.tooltipOn');
  const tooltipOffs = document.querySelectorAll('.tooltipOff');

  // tooltipの数→オンの数、tooltipOffの数→オフの数
  if (tooltipOns.length > 0) {
    // オフにする
    tooltipOns.forEach((tooltipOn) => {
      tooltipOn.classList.remove('tooltipOn');
      tooltipOn.classList.add('tooltipOff');
    });
  } else if (tooltipOffs.length > 0) {
    // オンにする
    tooltipOffs.forEach((tooltipOff) => {
      tooltipOff.classList.remove('tooltipOff');
      tooltipOff.classList.add('tooltipOn');
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

// 文章を画像としてダウンロードする
const imgDownloaded = (e) => {
  console.log('ダウンロードボタンをクリックした', e);

  const node = document.getElementById('tabs-text');
  node.classList.remove(
    'rounded-md',
    'border-2',
    'border-gray-200',
    'shadow-sm'
  );
  node.classList.add('w-[600px]', 'min-h-[600px]');

  htmlToImage.toPng(node, { cacheBust: true }).then((dataUrl) => {
    download(
      dataUrl,
      `${tabName}_${createTime.createDateStr(
        timestamp
      )}_${createTime.createTimeStr(timestamp)}.png`
    );
    node.classList.add(
      'rounded-md',
      'border-2',
      'border-gray-200',
      'shadow-sm'
    );
    node.classList.remove('w-[600px]', 'min-h-[600px]');
  });
};

const downloadBtn = document.getElementById('js-downloadBtn');
downloadBtn.addEventListener('click', imgDownloaded);

// モーダルを閉じる
const modalCloseBtn = document.getElementById('save-modal-closeBtn');
modalCloseBtn.addEventListener('click', () => {
  const saveModal = document.getElementById('save-modal');
  saveModal.classList.add('hidden');
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.classList.add('hidden');

  // 内容を変えておく
  const saveModalSaved = document.querySelector('.save-modal-saved');
  saveModalSaved.classList.add('hidden');
  const saveModalduring = document.querySelector('.save-modal-during');
  saveModalduring.classList.remove('hidden');
});

//localStorage.clear();
