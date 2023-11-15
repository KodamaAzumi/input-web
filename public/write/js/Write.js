class Write extends Photo {
  constructor(selectors) {
    super(selectors);

    // 保存ボタン
    this.saveButton = document.getElementById('js-saveBtn');
    // 破棄ボタン
    this.discardButton = document.getElementById('js-discardBtn');

    // 保存ボタンをクリックしたとき
    this.saveButton.addEventListener('click', this.onSaveButtonClicked);
    //破棄ボタンをクリックしたとき
    this.discardButton.addEventListener('click', this.onCleared);
  }

  onSaveButtonClicked = () => {
    console.log('saveButton clicked');

    // カメラをオフにする
    if (this.isStartCameraActive === true) {
      this.stopCamera();
      this.isStartCameraActive = false;
      console.log('camera false');
    }

    if (this.entityIds.length > 0) {
      // 文章を保存する
      this.addNewSentence();

      // 文章を書いた日付を取得する
      const entity = this.entity;
      const timestamp = entity[Object.keys(entity)[0]].timestamp;
      const writingDate = this.time.createDateStr(timestamp);

      // モーダルのために文章を書いた日付を保存しておく
      localStorage.setItem('dateData', String(writingDate));

      // 保存した文章をリセットする
      this.onCleared();

      // モーダルを表示する
      const saveModal = document.getElementById('saveBtn-modal');
      saveModal.classList.remove('hidden');
    }
  };

  onCleared = () => {
    console.log('oncleared');

    // カメラをオフにする
    if (this.isStartCameraActive === true) {
      this.stopCamera();
      this.isStartCameraActive = false;
      console.log('camera false');
    }

    // 保存した文章をリセットする
    this.el.value = '';
    this.count = 0;
    this.entity = {};
    this.entityIds = [];
  };

  // 新規保存
  addNewSentence = () => {
    const data = new Data();
    const id = data.id;
    const API_BASE_URL = data.API_BASE_URL;

    fetch(`${API_BASE_URL}/diaries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        entityIds: this.entityIds,
        entities: this.entity,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'OK') {
          console.log('日記を登録しました');
          console.log(data);
        }
      });
  };
}
