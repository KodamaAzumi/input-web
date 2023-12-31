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

    // 書くボタン（カメラボタン）をクリックしたときの処理
    this.cameraButton.addEventListener('click', this.cameraFunctions);
    this.isStartCameraActive = false;

    this.ee.on('added', this.onAdded);

    // 子クラスのために必要
    this.time = new Time();
  }

  // カメラを起動する関数
  startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        this.el.disabled = false;
        this.el.focus();
        this.stream = s;
        this.video.srcObject = this.stream;
        this.video.play();
      })
      .catch((error) => {
        console.error('Media device error:', error);
      });
    console.log('camera start');
    this.isStartCameraActive = true;
  };

  // カメラを停止する関数
  stopCamera = () => {
    if (this.stream) {
      this.el.disabled = true;
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.video.srcObject = null;
      console.log('camera stop');
      this.isStartCameraActive = false;
    }
  };

  // カメラのオンオフを切り替える関数
  cameraFunctions = () => {
    if (this.isStartCameraActive) {
      this.stopCamera();
    } else if (!this.isStartCameraActive) {
      this.startCamera();
    }
  };

  // 写真を取るときの処理
  onAdded = (event) => {
    const { entityId } = event;

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

      // entityにimageを追加
      this.entity[entityId].image = imageUrl;
    }
  };
}

//localStorage.clear();
