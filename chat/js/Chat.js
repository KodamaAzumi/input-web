class Chat extends Textarea {
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
    this.sendButton = document.getElementById('send-button');
    this.chatarea = document.getElementById('js-chatarea');

    // 書くボタン（カメラボタン）をクリックしたときの処理
    this.cameraButton.addEventListener('click', this.cameraFunctions);
    this.isStartCameraActive = false;

    // 写真の情報を保持するオブジェクト
    this.imageData = {};

    this.ee.on('added', this.onAdded);

    // 送信ボタンをクリックしたとき
    this.sendButton.addEventListener('click', this.onSended);
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
      this.stopCamera();
      this.isStartCameraActive = false;
      console.log('camera false');
    } else {
      this.startCamera();
      this.isStartCameraActive = true;
      console.log('camera true');
    }
  };

  // 写真を取るときの処理
  onAdded = (event) => {
    const { entityId } = event;

    // 写真を撮った時の時刻
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

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

  onSended = () => {
    console.log('sendBtn clicked');

    // カメラをオフにする
    // if (this.isStartCameraActive === true) {
    //   this.stopCamera();
    //   this.isStartCameraActive = false;
    //   console.log('camera false');
    // }

    if (this.entityIds.length > 0) {
      const entity = this.entity;
      const entityIds = this.entityIds;

      // 文章を書いた日付を取得する
      const timestamp = entity[Object.keys(entity)[0]].timestamp;
      const nowDate = new Date(timestamp);
      const year = nowDate.getFullYear();
      const month = (nowDate.getMonth() + 1).toString().padStart(2, '0'); // 月をゼロ埋め
      const day = nowDate.getDate().toString().padStart(2, '0'); // 日をゼロ埋め
      const formattedDate = `${year}-${month}-${day}`;

      // ローカルデータを取得する
      let chatDataString = localStorage.getItem('chatData');

      // 文章を保存する
      let chatData;
      // ローカルストレージにデータがあるかどうか
      if (chatDataString !== null) {
        console.log('ローカルストレージにデータが保存されています');
        // 文字列をオブジェクトに変換する
        chatData = JSON.parse(chatDataString);
        // 今日の日付のデータがあるかどうか
        if (chatData[formattedDate]) {
          chatData[formattedDate].push({
            timestamp,
            entity,
            entityIds,
          });
        } else {
          // 新しい日付のデータを作成する
          chatData[formattedDate] = [
            {
              timestamp,
              entity,
              entityIds,
            },
          ];
        }
        // オブジェクトを文字列に変換する
        chatDataString = JSON.stringify(chatData);
        // データを保存する
        //localStorage.setItem('chatData', chatDataString);

        // 保存されたデータを確認する
        //chatData = JSON.parse(chatDataString);
        //console.log(chatData);

        // 新しく文章を保存したときは、見るページで最初に表示する文章を最新の文章にする
        //const savedNum = chatData[formattedDate].length - 1;
        //localStorage.setItem('savedNumber', savedNum);
      } else {
        console.log('ローカルストレージにデータは保存されていません');
        // 文章を保存するデータを新しく作る
        chatData = {
          [formattedDate]: [
            {
              timestamp,
              entity,
              entityIds,
            },
          ],
        };
        // オブジェクトを文字列に変換する
        chatDataString = JSON.stringify(chatData);
        // データを保存する
        //localStorage.setItem('chatData', chatDataString);

        // 保存されたデータを確認する
        //chatData = JSON.parse(chatDataString);
        console.log(chatData);
      }

      // チャットを表示する
      const messageOuter = document.createElement('div');
      messageOuter.classList.add('w-auto', 'max-w-full');
      const messageText = this.el.value;
      const messageElement = document.createElement('div');
      messageElement.classList.add(
        'bg-white',
        'rounded-t-md',
        'rounded-bl-md',
        'p-2',
        'pr-3',
        'mb-3',
        'mr-2',
        'relative'
      );

      // オリジナルテキスト
      if (messageText.trim() !== '') {
        const originalElement = document.createElement('div');
        originalElement.classList.add('opasity-0');

        originalElement.innerHTML = messageText
          .replace(/\n/g, '<br>')
          .replace(/ /g, '&nbsp;');
        messageElement.appendChild(originalElement);
      }

      //グレースケールと写真に適応させる
      const grayscaleElement = document.createElement('div');
      grayscaleElement.classList.add('absolute', 'top-2', 'z-10');
      const imageElemnt = document.createElement('div');
      imageElemnt.classList.add('absolute', 'top-2', 'z-10', 'hidden');

      for (let j = 0; j < chatData[formattedDate].length; j++) {
        chatData[formattedDate][j].entityIds.forEach((entityId, i) => {
          // 入力された順に文字情報を順に取得する
          const { timestamp, value } = textarea.entity[entityId];
          // ひとつ前の ID を取得する
          const prevEntityId = textarea.entityIds[i - 1];
          // ひとつ前の文字情報との時差
          let diff = 0;

          // ひとつ前の ID が見つからなければ、1文字目なので時差なし、になる
          if (prevEntityId) {
            diff = timestamp - textarea.entity[prevEntityId].timestamp;
          }

          // 入力された文字が改行コードか
          if ('\r\n' === value || '\r' === value || '\n' === value) {
            // 改行コードであれば br 要素を挿入して、以降の処理を中断する
            const brGrayscale = document.createElement('br');
            grayscaleElement.appendChild(brGrayscale);
            const brImg = document.createElement('br');
            imageElemnt.appendChild(brImg);
            messageElement.appendChild(grayscaleElement);
            messageElement.appendChild(imageElemnt);
            return;
          }

          // diffを適した値に変更する(diffはミリ秒)
          const calculatedDiff = (diff / 1000) * 100;

          // calculatedDiffをグレースケールに適した値に変更する
          const hslValue = Math.max(Math.min(100 - calculatedDiff, 99), 0);
          // グレースケールに適応させる
          const span = document.createElement('span');
          span.style.color = `hsl(0, 0%, ${hslValue}%)`;
          span.appendChild(document.createTextNode(value));
          grayscaleElement.appendChild(span);
          //console.log(diff, calculatedDiff, hslValue);

          // 写真と文字を合成する
          const spanImg = document.createElement('span');
          if (textarea.entity[entityId].imageData) {
            spanImg.style.backgroundImage = `url(${textarea.entity[entityId].imageData.imageUrl})`;
          }
          spanImg.style.backgroundClip = 'text';
          spanImg.style.webkitBackgroundClip = 'text';
          spanImg.style.color = 'transparent';
          spanImg.appendChild(document.createTextNode(value));
          imageElemnt.appendChild(spanImg);
        });
      }
      messageElement.appendChild(grayscaleElement);
      messageElement.appendChild(imageElemnt);
      messageOuter.appendChild(messageElement);
      this.chatarea.appendChild(messageOuter);

      // スクロールバーを一番下に移動する
      this.chatarea.scrollTop = this.chatarea.scrollHeight;

      // 保存した文章をリセットする
      this.onCleared();
    }
  };

  onCleared = () => {
    console.log('oncleared');

    // カメラをオフにする
    // if (this.isStartCameraActive === true) {
    //   this.stopCamera();
    //   this.isStartCameraActive = false;
    //   console.log('camera false');
    // }

    // 保存した文章をリセットする
    this.el.value = '';
    this.count = 0;
    this.entity = {};
    this.entityIds = [];
    this.el.style.height = '';
  };
}

//localStorage.clear();
