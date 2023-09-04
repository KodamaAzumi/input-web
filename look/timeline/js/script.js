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
  const entityIds = textData[formattedDate][0].entityIds;
  entityIds.forEach((entityId) => {
    const timeStamp =
      textData[formattedDate][0].entity[entityId].imageData.timeString;
    const imgUrl =
      textData[formattedDate][0].entity[entityId].imageData.imageUrl;
    const value = textData[formattedDate][0].entity[entityId].value;

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
