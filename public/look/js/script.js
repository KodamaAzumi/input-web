//localStorage.clear();

// 日付を年、月、日にばらす
const splitDate = (dateStr) => {
  const dateParts = dateStr.split('-');
  return dateParts; // [year, month, day]
};

// 新しい日付から、古い日付までの月数を数える
const countMonth = (oldDDate, newDate) => {
  const oldDateYear = parseInt(splitDate(oldDDate)[0]);
  const oldDateMonth = parseInt(splitDate(oldDDate)[1]);
  const newDateYear = parseInt(splitDate(newDate)[0]);
  const newDateMonth = parseInt(splitDate(newDate)[1]);

  let numOfMonths;
  if (oldDateYear === newDateYear) {
    numOfMonths = newDateMonth - oldDateMonth + 1;
  } else {
    const numOfYears = newDateYear - oldDateYear;
    let addMonths = 0;
    if (numOfYears > 1) {
      addMonths = 12 * (numOfYears - 1);
    }
    numOfMonths = 12 - oldDateMonth + 1 + newDateMonth + addMonths;
  }
  return numOfMonths;
};

// カレンダーを作る
const createCalendar = (year, month, weeks, dateKeys) => {
  // 月の最初の日を取得（Dateコンストラクタの月は0から始まるので-1をする）
  const startDate = new Date(year, month - 1, 1);
  // 月の最後の日を取得（0にすると0日となり、前月の最後の日になる）
  const endDate = new Date(year, month, 0);
  const endDayCount = endDate.getDate();
  // 月の最初の日の曜日を取得（0は日曜日、1は月曜日）
  const startDay = startDate.getDay();

  // 日にちのカウント
  let dayCount = 1;
  let calendarHtml = '';

  calendarHtml += `<h1 class="text-xl md:text-2xl font-bold text-center text-gray-800">
        ${year} / ${String(month).padStart(2, '0')} 
      </h1>`;

  calendarHtml +=
    '<ul class="text-lg text-center list-none grid grid-cols-7 gap-y-2">';

  // 曜日の行を作成
  for (let i = 0; i < weeks.length; i++) {
    calendarHtml += `<li class="first:text-red-400 last:text-blue-400 ">
        ${weeks[i]} 
        </li>`;
  }

  calendarHtml += '</ul>';

  calendarHtml +=
    '<ul class="text-lg text-center list-none grid grid-cols-7 gap-y-2">';

  for (let w = 0; w < 6; w++) {
    for (let d = 0; d < 7; d++) {
      if (w == 0 && d < startDay) {
        // 1行目で1日の曜日の前
        calendarHtml += '<li></li>';
      } else if (dayCount > endDayCount) {
        // 末尾の日数を超えた
        calendarHtml += '<li></li>';
      } else {
        const dataDate = `${year}-${String(month).padStart(2, '0')}-${String(
          dayCount
        ).padStart(2, '0')}`;

        // 文章のある日付に色を付ける
        if (dateKeys.includes(dataDate)) {
          console.log(dataDate);
          calendarHtml += `<li data-date="${dataDate}"><a href="/look/sentence/index.html" onclick="changeActiveDate(event, this)" class="bg-yellow-400 text-yellow-800 rounded-full inline-block w-7 h-7">${dayCount}</a></li>`;
          dayCount++;
        } else {
          calendarHtml += `<li data-date="${dataDate}">${dayCount}</li>`;
          dayCount++;
        }
      }
    }
  }
  calendarHtml += '</ul>';

  return calendarHtml;
};

//　カレンダーを見せる
const showCalendar = (year, month, weeks, show, dateKeys) => {
  // データの初めの月から終わりの月までカレンダーを作る
  for (i = 0; i < show; i++) {
    const calendarHtml = createCalendar(year, month, weeks, dateKeys);
    const calendarElement = document.createElement('div');
    calendarElement.classList.add('grid', 'gap-4');
    calendarElement.innerHTML = calendarHtml;
    document.querySelector('#js-calendar').appendChild(calendarElement);

    month--;
    if (month < 1) {
      year--;
      month = 12;
    }
  }
};

// クリックした日付を保存する
const changeActiveDate = (event, element) => {
  //event.preventDefault();
  const eventElement = element;
  const activeDate = eventElement.parentElement.getAttribute('data-date');
  localStorage.setItem('activeDate', String(activeDate));
};

const weeks = ['日', '月', '火', '水', '木', '金', '土'];

// カレンダーを作る
(async () => {
  // データがあるときは古いデータから新しいデータまでのカレンダーを作る
  const data = new Data();
  const postDates = await data.getPostDates();

  if (postDates && !(postDates.dates.length === 0)) {
    const dateKeys = postDates.dates;
    //const dateKeys = ['2022-05-03', '2023-01-09', '2022-07-04'];

    // 配列を日付の文字列から日付オブジェクトに変換
    const dateObjects = dateKeys.map((dateStr) => new Date(dateStr));
    // 日付オブジェクトを比較して最も古い日付を取得
    const oldestDate = new Date(Math.min(...dateObjects));
    const oldestDateStr = oldestDate.toISOString().split('T')[0];
    // 日付オブジェクトを比較して最も新しい日付を取得
    const newestDate = new Date(Math.max(...dateObjects));
    const newestDateStr = newestDate.toISOString().split('T')[0];

    const year = parseInt(splitDate(newestDateStr)[0]);
    const month = parseInt(splitDate(newestDateStr)[1]);
    const config = {
      show: countMonth(oldestDateStr, newestDateStr),
    };

    showCalendar(year, month, weeks, config.show, dateKeys);
  } else {
    const attentionElement = document.createElement('div');
    //attentionElement.classList.add('h-screen');
    const para = document.createElement('p');
    para.classList.add('font-bold', 'text-center');
    para.innerHTML =
      '文章を一度も書いていません。<br>「書く」ページで文章を書いて見ましょう。';
    attentionElement.appendChild(para);
    document.querySelector('#js-calendar').appendChild(attentionElement);
    showCalendar(2024, 3, weeks, 3, []);
  }
})();
