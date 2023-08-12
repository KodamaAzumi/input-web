class Photo extends Textarea {
  constructor(selectors) {
    super(selectors);

    this.video = document.getElementById('js-video');
    this.canvas = document.createElement('canvas');
    this.canvas.width = 320; // 幅を指定
    this.canvas.height = 240; // 高さを指定
    this.quality = 0.85; // 画像の容量
    this.context = this.canvas.getContext('2d');
    this.cameraButton = document.getElementById('js-cameraBtn');
    this.preview = document.getElementById('js-preview');
    this.stream = null;
    this.saveButton = document.getElementById('js-saveBtn');

    // 書くボタン（カメラボタン）をクリックしたときの処理
    this.cameraButton.addEventListener('click', this.cameraFunctions);
    this.isStartCameraActive = true;

    // 写真の情報を保持するオブジェクト
    this.imageData = {};

    this.ee.on('added', this.onAdded);

    // 保存ボタンをクリックしたとき
    this.saveButton.addEventListener('click', this.onSaved);
  }

  // カメラを起動する関数
  startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        this.el.disabled = false;
        this.el.focus();
        this.stream = s;
        this.video.srcObject = this.stream;
      })
      .catch((error) => {
        console.error('Media device error:', error);
      });
    console.log('camera start');
  };

  // カメラを停止する関数
  stopCamera = () => {
    if (this.stream) {
      this.el.disabled = true;
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.video.srcObject = null;
      console.log('camera stop');
    }
  };

  // カメラのオンオフを切り替える関数
  cameraFunctions = () => {
    if (this.isStartCameraActive) {
      this.startCamera();
      this.isStartCameraActive = false;
      console.log('camera true');
    } else {
      this.stopCamera();
      this.isStartCameraActive = true;
      console.log('camera false');
    }
  };

  // 写真を取るときの処理
  onAdded = (event) => {
    const { entityId } = event;

    // 写真を撮った時の時刻
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    if (this.stream) {
      // キャンバスにビデオ画像を描画する
      this.context.drawImage(
        this.video,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // 画像の容量を変更する
      const imageUrl = this.canvas.toDataURL('image/jpeg', this.quality);

      // キャプチャした画像をプレビューする
      this.preview.src = imageUrl;

      // 画像をオブジェクトに追加する
      this.imageData = {
        imageUrl,
        timeString,
      };

      // entityにimageDataを追加
      this.entity[entityId].imageData = this.imageData;
    }
  };

  onSaved = () => {
    console.log('saveBtn clicked');
    if (this.entityIds.length > 0) {
      // 文章を書いた日付を取得する
      const timestamp = this.entity.c0i0.timestamp;
      const nowDate = new Date(timestamp);
      const year = nowDate.getFullYear();
      const month = (nowDate.getMonth() + 1).toString().padStart(2, '0'); // 月をゼロ埋め
      const day = nowDate.getDate().toString().padStart(2, '0'); // 日をゼロ埋め
      const formattedDate = `${year}-${month}-${day}`;

      const entity = this.entity;
      const entityIds = this.entityIds;

      // ローカルデータを取得する
      const textDataString = localStorage.getItem('textData');

      // 文章を保存する
      if (textDataString !== null) {
        console.log('ローカルストレージにデータが保存されています');
        let textData = JSON.parse(textDataString);
        if (textData[formattedDate]) {
          textData[formattedDate].push({
            timestamp,
            entity,
            entityIds,
          });
          // オブジェクトを文字列に変換する
          const textDataString = JSON.stringify(textData);
          // データを保存する
          localStorage.setItem('textData', textDataString);

          // 保存されたデータを確認する
          textData = JSON.parse(textDataString);
          console.log(textData);
        }
      } else {
        console.log('ローカルストレージにデータは保存されていません');
        // 文章を保存するデータを新しく作る
        let textData = {
          [formattedDate]: [
            {
              timestamp,
              entity,
              entityIds,
            },
          ],
        };
        // オブジェクトを文字列に変換する
        const textDataString = JSON.stringify(textData);
        // データを保存する
        localStorage.setItem('textData', textDataString);

        // 保存されたデータを確認する
        textData = JSON.parse(textDataString);
        console.log(textData);
      }

      // モーダルを表示する
      const saveModal = document.getElementById('saveBtn-modal');
      saveModal.classList.remove('hidden');
    }
  };
}

//localStorage.clear();
