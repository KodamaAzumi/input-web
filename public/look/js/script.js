//localStorage.clear();

// ローカルデータを取得する
let textDataString = localStorage.getItem('textData');
// 文字列をオブジェクトに変換する
let textData = JSON.parse(textDataString);
console.log(textData);

if (textData) {
  //const dateKeys = Object.keys(textData);
  const dateKeys = ['2021-12-03', '2023-01-09', '2022-11-04'];

  // 配列を日付の文字列から日付オブジェクトに変換
  const dateObjects = dateKeys.map((dateStr) => new Date(dateStr));
  // 日付オブジェクトを比較して最も古い日付を取得
  const oldestDate = new Date(Math.min(...dateObjects));
  const oldestDateStr = oldestDate.toISOString().split('T')[0];
  // 日付オブジェクトを比較して最も新しい日付を取得
  const newestDate = new Date(Math.max(...dateObjects));
  const newestDateStr = newestDate.toISOString().split('T')[0];

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
  const weeks = ['日', '月', '火', '水', '木', '金', '土'];
  const year = splitDate(newestDateStr)[0];
  const month = splitDate(newestDateStr)[1];
  const config = {
    show: countMonth(oldestDateStr, newestDateStr),
  };

  const createCalendar = (year, month) => {
    const startDate = new Date(year, month - 1, 1); // 月の最初の日を取得
    const endDate = new Date(year, month, 0); // 月の最後の日を取得
    const endDayCount = endDate.getDate(); // 月の末日
    const startDay = startDate.getDay(); // 月の最初の日の曜日を取得
    let dayCount = 1; // 日にちのカウント
    let calendarHtml = ''; // HTMLを組み立てる変数

    calendarHtml +=
      '<h1 class="text-xl md:text-2xl font-bold text-gray-800">' +
      year +
      '/' +
      String(month).padStart(2, '0') +
      '</h1>';
    calendarHtml += '<table class="w-full mt-3 text-lg text-center ">';

    // 曜日の行を作成
    for (let i = 0; i < weeks.length; i++) {
      calendarHtml +=
        '<td class="pb-2 first:text-red-400 last:text-blue-400 ">' +
        weeks[i] +
        '</td>';
    }

    for (let w = 0; w < 5; w++) {
      calendarHtml += '<tr class="text-center">';

      for (let d = 0; d < 7; d++) {
        if (w == 0 && d < startDay) {
          // 1行目で1日の曜日の前
          calendarHtml += '<td class="pb-2"></td>';
        } else if (dayCount > endDayCount) {
          // 末尾の日数を超えた
          calendarHtml += '<td class="pb-2"></td>';
        } else {
          calendarHtml += '<td class="pb-2">' + dayCount + '</td>';
          dayCount++;
        }
      }
      calendarHtml += '</tr>';
    }
    calendarHtml += '</table>';

    //console.log(calendarHtml);
    return calendarHtml;
  };

  showCalendar = (year, month) => {
    for (i = 0; i < config.show; i++) {
      const calendarHtml = createCalendar(year, month);
      const sec = document.createElement('section');
      sec.classList.add('w-full', 'md:w-1/2', 'mb-5', 'md:mb-8', 'sm:p-2');
      sec.innerHTML = calendarHtml;
      document.querySelector('#js-calendar').appendChild(sec);

      month--;
      if (month < 1) {
        year--;
        month = 12;
      }
    }
  };

  showCalendar(year, month);
} else {
  const div = document.createElement('div');
  div.classList.add('h-screen');
  const para = document.createElement('p');
  para.classList.add('font-bold');
  para.innerHTML =
    '文章を一度も書いていません。<br>「書く」ページで文章を書いて見ましょう。';
  div.appendChild(para);
  document.querySelector('#js-calendar').appendChild(div);
}
