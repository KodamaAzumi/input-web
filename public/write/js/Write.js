class Write extends Photo {
  constructor(selectors) {
    super(selectors);

    // 保存ボタン
    this.saveButton = document.getElementById('js-saveBtn');
    // 破棄ボタン
    this.discardButton = document.getElementById('js-discardBtn');

    // 保存ボタンをクリックしたとき
    this.saveButton.addEventListener('click', this.onSaved);

    //破棄ボタンをクリックしたとき
    this.discardButton.addEventListener('click', this.onCleared);
  }

  onSaved = () => {
    console.log('saveBtn clicked');

    // カメラをオフにする
    if (this.isStartCameraActive === true) {
      this.stopCamera();
      this.isStartCameraActive = false;
      console.log('camera false');
    }

    if (this.entityIds.length > 0) {
      const entity = this.entity;
      const entityIds = this.entityIds;

      // 文章を書いた日付を取得する
      const timestamp = entity[Object.keys(entity)[0]].timestamp;
      const formattedDate = this.time.createDateStr(timestamp);

      // ローカルデータを取得する
      let textDataString = localStorage.getItem('textData');

      // 文章を保存する
      // ローカルストレージにデータがあるかどうか
      let textData;
      if (textDataString !== null) {
        console.log('ローカルストレージにデータが保存されています');
        // 文字列をオブジェクトに変換する
        textData = JSON.parse(textDataString);
        // 今日の日付のデータがあるかどうか
        if (textData[formattedDate]) {
          textData[formattedDate].push({
            timestamp,
            entity,
            entityIds,
          });
        } else {
          // 新しい日付のデータを作成する
          textData[formattedDate] = [
            {
              timestamp,
              entity,
              entityIds,
            },
          ];
        }

        // 新しく文章を保存したときは、見るページで最初に表示する文章を最新の文章にする
        const savedNum = textData[formattedDate].length - 1;
        localStorage.setItem('savedNumber', savedNum);
      } else {
        console.log('ローカルストレージにデータは保存されていません');
        // 文章を保存するデータを新しく作る
        textData = {
          [formattedDate]: [
            {
              timestamp,
              entity,
              entityIds,
            },
          ],
        };
      }

      // モーダルのために保存した日を保存しておく
      localStorage.setItem('dateData', String(formattedDate));

      // オブジェクトを文字列に変換する
      textDataString = JSON.stringify(textData);
      // データを保存する
      localStorage.setItem('textData', textDataString);

      // 保存されたデータを確認する
      textData = JSON.parse(textDataString);
      console.log(textData);

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
}
