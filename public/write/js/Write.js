class Write extends Photo {
  constructor(selectors) {
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
    // 破棄ボタンをクリックしたとき
    this.discardButton.addEventListener('click', this.onCleared);

    // テキストエリアにかぶせているもの
    this.textareaCover = document.getElementById('js-textarea-cover');
    // テキストエリアの一番外側
    this.textareaCoverOuter = document.getElementById('tabs-id');
    // テキストエリア全体をクリックしたとき、カメラをオンにする
    this.textareaCover.addEventListener('click', () => {
      // テキストエリアにかぶせているものを外す
      this.textareaCover.classList.add('hidden');
      this.textareaCoverOuter.classList.remove('relative');

      // カメラをオンにする
      if (!this.isStartCameraActive) {
        this.startCamera();
      }
    });

    // 書くボタン（カメラボタン）をクリックしたときもテキストエリアにかぶせているものを外す
    this.cameraButton.addEventListener('click', () => {
      // テキストエリアにかぶせているものを外す
      this.textareaCover.classList.add('hidden');
      this.textareaCoverOuter.classList.remove('relative');
    });
  }

  onSaveButtonClicked = () => {
    console.log('saveButton clicked');

    // カメラをオフにする
    if (this.isStartCameraActive) {
      this.stopCamera();
    }

    if (this.entityIds.length > 0) {
      // 文章を保存する
      this.addNewSentence();

      // 文章を書いた日付を取得する
      const entity = this.entity;
      const timestamp = entity[Object.keys(entity)[0]].timestamp;
      const writingDate = this.time.createDateStr(timestamp);

      // モーダルのために文章を書いた日付を保存しておく
      localStorage.setItem('activeDate', String(writingDate));
    }
  };

  onCleared = () => {
    console.log('oncleared');

    // カメラをオフにする
    if (this.isStartCameraActive) {
      this.stopCamera();
    }

    // 保存した文章をリセットする
    this.el.value = '';
    this.count = 0;
    this.entity = {};
    this.entityIds = [];

    // テキストエリアにかぶせているものを元に戻す
    this.textareaCover.classList.remove('hidden');
    this.textareaCoverOuter.classList.add('relative');
  };

  // 新規保存
  addNewSentence = () => {
    // モーダルを表示する
    const saveModal = document.getElementById('save-modal');
    saveModal.classList.remove('hidden');
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');

    // 保存が完了するまで、ボタンを押せないようにする
    this.saveButton.disabled = true;
    this.discardButton.disabled = true;
    this.cameraButton.disabled = true;

    fetch(`${this.API_BASE_URL}/diaries/`, {
      method: 'POST',
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
        if (data.status === 'OK') {
          console.log('日記を登録しました');
          console.log(data);

          // 保存した文章をリセットする
          this.onCleared();

          localStorage.setItem('savedNumber', '0');

          // モーダルの内容を変える
          const saveModalduring = document.querySelector('.save-modal-during');
          saveModalduring.classList.add('hidden');
          const saveModalSaved = document.querySelector('.save-modal-saved');
          saveModalSaved.classList.remove('hidden');

          this.saveButton.disabled = false;
          this.discardButton.disabled = false;
          this.cameraButton.disabled = false;

          // テキストエリアにかぶせているものを元に戻す
          this.textareaCover.classList.remove('hidden');
          this.textareaCoverOuter.classList.add('relative');
        }
      });
  };
}
