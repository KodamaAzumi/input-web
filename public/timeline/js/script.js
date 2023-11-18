const timelineList = document.getElementById('timeline-list');

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
  const postDates = await data.getPostDates();
  const timestamps = postDates.timestamps;

  // タイトルを付ける（表示したい文章の日付）
  const sidebarDate = document.querySelectorAll('.sidebar-date');
  sidebarDate.forEach((sidebarDates) => {
    sidebarDates.innerHTML = activeDate;
  });

  timestamps[activeDate].forEach((timestamp, i) => {
    // 日記が書かれた時間を取得する
    const formattedTime = createTime.createTimeStr(timestamp);

    // その日に書かれた日記の数だけリストを作る
    const targetLists = document.querySelectorAll('.sidebar-list');
    targetLists.forEach((targetList) => {
      if (
        // 最後に表示されていた日記を再度ページを開いたときに表示する
        (!savedNum && i === 0) ||
        (savedNum && i === parsedNum)
      ) {
        // ページを開いたとき、初めに表示されている日記のサイドバー（サイドメニュー）の見た目
        const newListItemTemplate = `  
          <li  
            class="py-4 text-sm text-gray-600 bg-yellow-50 border-b-2 border-yellow-200"
            onclick="changeActiveTimeline(event, ${i})"
          >
            ${formattedTime}
          </li>`;
        const newListItem = document
          .createRange()
          .createContextualFragment(newListItemTemplate);
        targetList.appendChild(newListItem);
      } else {
        const newListItemTemplate = `<li
                      class="py-4 text-sm text-gray-600 hover:bg-yellow-50 border-b-2 border-yellow-200"
                      onclick="changeActiveTimeline(event, ${i})"
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
};

createSubmenu();

// タイムラインを作る
const createTimeline = async (index) => {
  const postDates = await data.getPostDates();
  const timestamps = postDates.timestamps;

  // 全ての文章のタイムラインを作る
  for (let i = 0; i < timestamps[activeDate].length; i++) {
    const newOrderedList = document.createElement('ol');
    newOrderedList.id = `orderedList_${i}`;
    newOrderedList.classList.add(
      'relative',
      'border-l',
      'border-yellow-400',
      'hidden'
    );

    const timestamp = timestamps[activeDate][i];
    const sentenceData = await data.getSentence(timestamp);
    const { entities, entityIds, dir } = sentenceData;

    entityIds.forEach((entityId) => {
      const { timestamp, value } = entities[entityId];
      const imageUrl = `${data.IMG_BASE_URL}/${data.id}/${dir}/${entityId}.jpeg`;
      const formattedTime = createTime.createTimeStr(timestamp);

      const newListItemTemplate = `
        <li class="mb-10 ml-6 p-3 rounded-md bg-gray-50">
          <div class="absolute w-4 h-4 bg-yellow-400 rounded-full mt-1 -left-2 border border-white"></div>
          <time class="text-lg font-normal leading-none text-gray-600">${activeDate} ${formattedTime}</time>
          <h3 class="my-2 text-3xl font-semibold text-gray-900">${value}</h3>
          <img src="${imageUrl}">
        </li>
      `;

      const newListItem = document
        .createRange()
        .createContextualFragment(newListItemTemplate);
      newOrderedList.appendChild(newListItem);
    });
    timelineList.appendChild(newOrderedList);
  }

  document.getElementById(`orderedList_${index}`).classList.remove('hidden');
};

// タイムラインを表示する
// パラグラフページで表示する日記を切り替えた場合、切り替えた日記のタイムラインを表示する
if (savedNum) {
  createTimeline(parsedNum);
} else {
  // パラグラフページで何も切り替えない場合、最新の日記のタイムラインを表示する
  createTimeline(0);
}

// サブメニューを押したとき
const changeActiveTimeline = async (event, num) => {
  // タイムラインを切り替える
  const postDates = await data.getPostDates();
  const timestamps = postDates.timestamps;

  // 全ての文章のタイムラインを作る
  for (let i = 0; i < timestamps[activeDate].length; i++) {
    if (
      !document.getElementById(`orderedList_${i}`).classList.contains('hidden')
    ) {
      document.getElementById(`orderedList_${i}`).classList.add('hidden');
    }
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

    const targetElement = liElements[num];
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
