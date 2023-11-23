class Sentence extends Photo {
  constructor(selectors, entity, entityIds) {
    super(selectors);

    this.data = new Data();
    this.id = this.data.id;
    this.API_BASE_URL = this.data.API_BASE_URL;

    // 保存ボタン
    this.saveButton = document.getElementById('js-saveBtn');
    // 保存ボタンをクリックしたとき
    this.saveButton.addEventListener('click', this.onSaveButtonClicked);

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

    // 表示している文章の日付
    this.activeDate = localStorage.getItem('activeDate');

    // 最後に表示していた日記のインデックス
    const savedNum = localStorage.getItem('savedNumber');
    this.parsedNum = parseInt(savedNum);
  }

  onCleared = async () => {
    // 保存が完了するまで、ボタンを押せないようにする
    this.saveButton.disabled = true;
    this.discardButton.disabled = true;
    this.cameraButton.disabled = true;

    const postDates = await data.getPostDates();

    const timestamps = postDates.timestamps;
    const timestamp = timestamps[this.activeDate][this.parsedNum];

    fetch(`${this.API_BASE_URL}/diaries/${this.id}/${timestamp}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.id,
        entityIds: [],
        entities: {},
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(
          `ユーザーID: ${this.id} の ${timestamp} の日記を更新しました`
        );
        console.log(data);

        this.saveButton.disabled = false;
        this.discardButton.disabled = false;
        this.cameraButton.disabled = false;
      });
  };

  onSaveButtonClicked = async () => {
    // 保存が完了するまで、ボタンを押せないようにする
    this.saveButton.disabled = true;
    this.discardButton.disabled = true;
    this.cameraButton.disabled = true;

    const postDates = await data.getPostDates();

    const timestamps = postDates.timestamps;
    const timestamp = timestamps[this.activeDate][this.parsedNum];

    fetch(`${this.API_BASE_URL}/diaries/${this.id}/${timestamp}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.id,
        entityIds: this.entityIds,
        entities: this.entity,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(
          `ユーザーID: ${this.id} の ${timestamp} の日記を更新しました`
        );
        console.log(data);

        // モーダルを表示する
        const saveModal = document.getElementById('saveBtn-modal');
        saveModal.classList.remove('hidden');

        this.saveButton.disabled = false;
        this.discardButton.disabled = false;
        this.cameraButton.disabled = false;
      });
  };
}
