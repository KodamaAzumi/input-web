// ローカルデータを取得する
let textDataString = localStorage.getItem('textData');
// 文字列をオブジェクトに変換する
let textData = JSON.parse(textDataString);
console.log(textData);

const timelineList = document.getElementById('timeline-list');

// 今日の日付
const nowDate = new Date();
const year = nowDate.getFullYear();
const month = (nowDate.getMonth() + 1).toString().padStart(2, '0'); // 月をゼロ埋め
const day = nowDate.getDate().toString().padStart(2, '0'); // 日をゼロ埋め
const formattedDate = `${year}-${month}-${day}`;

if (textData && textData[formattedDate]) {
  const length = textData[formattedDate].length;
  // パラグラフページで何も切り替えない場合、最新の日記のタイムラインを表示する
  let index = length - 1;
  // パラグラフページで表示する日記を切り替えた場合、切り替えた日記のタイムラインを表示する
  const savedNum = localStorage.getItem('savedNumber');
  if (savedNum) {
    const num = parseInt(savedNum);
    index = num;
  }

  // タイムラインを表示する
  const entityIds = textData[formattedDate][index].entityIds;
  entityIds.forEach((entityId) => {
    const timeStamp =
      textData[formattedDate][index].entity[entityId].imageData.timeString;
    const imgUrl =
      textData[formattedDate][index].entity[entityId].imageData.imageUrl;
    const value = textData[formattedDate][index].entity[entityId].value;

    const newListItemTemplate = `
        <li>
            <p>${timeStamp}</p>
            <p>${value}</p>
            <img src="${imgUrl}">
        </li>
    `;
    const newListItem = document
      .createRange()
      .createContextualFragment(newListItemTemplate);
    timelineList.appendChild(newListItem);
  });
}

//localStorage.clear();
