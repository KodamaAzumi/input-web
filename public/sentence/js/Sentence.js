class Sentence extends Photo {
  constructor(selectors, entity, entityIds) {
    super(selectors);

    // 破棄ボタン
    this.discardButton = document.getElementById('js-discardBtn');
    //破棄ボタンをクリックしたとき
    this.discardButton.addEventListener('click', this.onCleared);

    // 編集するとき用
    this.entity = entity;
    this.entityIds = entityIds;

    const initialValue = this.entityIds.reduce(
      (v, entityId) => v + this.entity[entityId].value,
      ''
    );

    this.prevValue = initialValue; // 変更（input）直前の文字列
    this.el.value = initialValue;
  }

  onCleared = async () => {
    // 表示している文章の日付
    const activeDate = localStorage.getItem('activeDate');

    // 最後に表示していた日記のインデックス
    const savedNum = localStorage.getItem('savedNumber');
    const parsedNum = parseInt(savedNum);

    const postDates = await data.getPostDates();
    if (postDates) {
      const timestamps = postDates.timestamps;
      const timestamp = timestamps[activeDate][parsedNum];

      const data = new Data();
      const id = data.id;
      const API_BASE_URL = data.API_BASE_URL;

      fetch(`${API_BASE_URL}/diaries/${id}/${timestamp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          entityIds: [],
          entities: {},
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(`ユーザーID: ${id} の ${timestamp} の日記を更新しました`);
          console.log(data);
        });
    }
  };
}
