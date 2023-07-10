class Photo extends Textarea {
  constructor(selectors) {
    super(selectors);

    this.video = document.getElementById("video");
    this.canvas = document.createElement("canvas");
    this.canvas.width = 320; // 幅を指定
    this.canvas.height = 240; // 高さを指定
    this.quality = 0.85; // 画像の容量
    this.context = this.canvas.getContext("2d");
    this.startButton = document.getElementById("start");
    this.stopButton = document.getElementById("stop");
    this.preview = document.getElementById("preview");
    this.stream = null;

    // ページを読み込んだ時にカメラを起動する
    //document.addEventListener("DOMContentLoaded", this.startCamera);

    // スタートボタンをクリックしたときの処理
    //this.startButton.addEventListener('click', this.startCamera);

    // ストップボタンをクリックしたときの処理
    //this.stopButton.addEventListener("click", this.stopCamera);

    // 写真の情報を保持するオブジェクト
    this.imageData = {};

    this.ee.on("added", this.onAdded);
  }

  // カメラを起動する関数
  startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        this.stream = s;
        this.video.srcObject = this.stream;
      })
      .catch((error) => {
        console.error("Media device error:", error);
      });
  };

  // カメラを停止する関数
  stopCamera = () => {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.video.srcObject = null;
    }
  };

  // 写真を取るときの処理
  onAdded = (event) => {
    const { entityId } = event;

    // 写真を撮った時の時刻
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();

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
      const imageUrl = this.canvas.toDataURL("image/jpeg", this.quality);

      // キャプチャした画像をプレビューする
      this.preview.src = imageUrl;

      // 画像をオブジェクトに追加する
      this.imageData = {
        imageUrl,
      };

      // entityにimageDataを追加
      this.entity[entityId].imageData = this.imageData;
    }
  };
}
