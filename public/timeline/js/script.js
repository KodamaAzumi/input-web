// ローカルデータを取得する
let textDataString = localStorage.getItem('textData');
// 文字列をオブジェクトに変換する
let textData = JSON.parse(textDataString);
console.log(textData);

const timelineList = document.getElementById('timeline-list');

// 時間を作るクラス
const createTime = new Time();

// 今日の日付
const formattedDate = createTime.createDateStr();

// 最後に表示していた日記のインデックス
const savedNum = localStorage.getItem('savedNumber');
const parsedNum = parseInt(savedNum);

let index;

// タイムラインを表示する
if (textData && textData[formattedDate]) {
  const length = textData[formattedDate].length;

  // 全てのタイムラインを作る
  for (let i = 0; i < length; i++) {
    const newOrderedList = document.createElement('ol');
    newOrderedList.classList.add(
      'relative',
      'border-l',
      'border-yellow-400',
      'hidden'
    );
    newOrderedList.id = `orderedList_${i}`;

    const entityIds = textData[formattedDate][i].entityIds;
    entityIds.forEach((entityId) => {
      const timeStamp =
        textData[formattedDate][i].entity[entityId].imageData.timeString;
      const imgUrl =
        textData[formattedDate][i].entity[entityId].imageData.imageUrl;
      const value = textData[formattedDate][i].entity[entityId].value;

      const newListItemTemplate = `
        <li class="mb-10 ml-6 p-3 rounded-md bg-gray-50">
          <div class="absolute w-4 h-4 bg-yellow-400 rounded-full mt-1 -left-2 border border-white"></div>
          <time class="text-lg font-normal leading-none text-gray-600">${formattedDate} ${timeStamp}</time>
          <h3 class="my-2 text-3xl font-semibold text-gray-900">${value}</h3>
          <img src="${imgUrl}">
        </li>
    `;
      const newListItem = document
        .createRange()
        .createContextualFragment(newListItemTemplate);
      newOrderedList.appendChild(newListItem);
    });
    timelineList.appendChild(newOrderedList);
  }

  // 最初に表示するタイムライン
  // パラグラフページで表示する日記を切り替えた場合、切り替えた日記のタイムラインを表示する
  if (savedNum) {
    index = parsedNum;
  } else {
    // パラグラフページで何も切り替えない場合、最新の日記のタイムラインを表示する
    index = length - 1;
  }
  document.getElementById(`orderedList_${index}`).classList.remove('hidden');
  document.getElementById(`orderedList_${index}`).classList.add('block');

  // サブメニューを作る
  // タイトルを付ける（その日の日付）
  const sidebarDate = document.querySelectorAll('.sidebar-date');
  sidebarDate.forEach((sidebarDates) => {
    sidebarDates.innerHTML = formattedDate;
  });

  for (let j = length - 1; j >= 0; j--) {
    // 日記が書かれた時間を取得する
    const timeString = createTime.createTimeStr(
      textData[formattedDate][j].timestamp
    );

    const targetLists = document.querySelectorAll('.sidebar-list');
    targetLists.forEach((targetList) => {
      if (
        // 最後に表示されていた日記を再度ページを開いたときに表示する
        (!savedNum && j === length - 1) ||
        (savedNum && j === parsedNum)
      ) {
        // ページを開いたとき、初めに表示されている日記のサイドバー（サイドメニュー）の見た目
        const newListItemTemplate = `  
          <li  
            class="py-4 text-sm text-gray-600 bg-yellow-50 border-b-2 border-yellow-200"
            onclick="changeAtiveTimeline(event, ${j})"
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
                      onclick="changeAtiveTimeline(event, ${j})"
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
}

// サブメニューを押したとき
const changeAtiveTimeline = (event, num) => {
  // タイムラインを切り替える
  const length = textData[formattedDate].length;
  for (let i = 0; i < length; i++) {
    document.getElementById(`orderedList_${i}`).classList.add('hidden');
  }
  document.getElementById(`orderedList_${num}`).classList.remove('hidden');

  // 番号を保存する
  localStorage.setItem('savedNumber', num);

  // サイドバーの見た目を変える
  const ulElements = document.querySelectorAll('.sidebar-list');
  ulElements.forEach((ulElement) => {
    const liElements = ulElement.querySelectorAll('li');
    liElements.forEach((liElement) => {
      liElement.classList.remove('bg-yellow-50');
      liElement.classList.add('hover:bg-yellow-50');
    });

    const targetElement = liElements[length - 1 - num];
    targetElement.classList.remove('hover:bg-yellow-50');
    targetElement.classList.add('bg-yellow-50');
  });

  // サブメニューを閉じる
  submenu.classList.remove('-translate-x-0');
  submenu.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
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
