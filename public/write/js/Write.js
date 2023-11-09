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

    // サイトを利用するユーザー特有のid
    const uuidDataString = localStorage.getItem('uuidData');
    const uuidData = JSON.parse(uuidDataString);
    this.uuid = uuidData.uuid;
    // 取得・更新する日記の日付
    this.timestamp;
    // API の URL
    this.API_BASE_URL =
      'https://hdvihzbggg.execute-api.ap-northeast-1.amazonaws.com/dev';
    // 画像の URL
    this.IMG_BASE_URL =
      'https://kodama23-diary-dev-bucket.s3.ap-northeast-1.amazonaws.com';
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
      const formattedDate = this.time.createDateStr(timestamp);

      // モーダルのために保存した日を保存しておく
      localStorage.setItem('dateData', String(formattedDate));

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

  addNewSentence = () => {
    fetch(`${this.API_BASE_URL}/diaries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.uuid,
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
