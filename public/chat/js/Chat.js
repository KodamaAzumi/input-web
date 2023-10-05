class Chat extends Textarea {
  constructor(selectors) {
    super(selectors);

    // カメラに関する変数
    this.video = document.getElementById('js-video');
    this.canvas = document.createElement('canvas');
    this.canvas.width = 320; // 幅を指定
    this.canvas.height = 240; // 高さを指定
    this.quality = 0.9; // 画像の容量
    this.context = this.canvas.getContext('2d');
    this.cameraButton = document.getElementById('js-cameraBtn');
    this.preview = document.getElementById('js-preview');
    this.stream = null;

    // 書くボタン（カメラボタン）をクリックしたときの処理
    this.cameraButton.addEventListener('click', this.cameraFunctions);
    this.isStartCameraActive = false;

    // 写真の情報を保持するオブジェクト
    this.imageData = {};

    this.ee.on('added', this.onAdded);

    // チャットに関する変数
    this.socket = new WebSocket(
      'wss://c8rz9t1xyi.execute-api.ap-northeast-1.amazonaws.com/prod'
    );
    this.inputArea = document.getElementById('input-area');
    this.chatarea = document.getElementById('js-chatarea');
    this.entityOnes; // 1文字ずつ送ったentityをまとめる箱

    // チャットサーバーに接続したとき
    this.socket.addEventListener('open', this.onOpened);

    this.socket.addEventListener('close', (e) => {
      console.log('close', e);
    });

    this.socket.addEventListener('error', (e) => {
      console.log('error', e);
    });

    // チャットサーバーからメッセージを受信したとき
    this.socket.addEventListener('message', this.onReceived);

    // チャットが送信されたとき
    this.inputArea.addEventListener('submit', this.OnSubmited);

    /*
    this.sendButton = document.getElementById('send-button');
    
    // 送信ボタンをクリックしたとき
    this.sendButton.addEventListener('click', this.onSended);
    */
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

  // 送信ボタンを押したときの処理
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
      messageOuter.classList.add(
        'flex',
        'justify-end',
        'items-end',
        'mb-3',
        'mr-2'
      );

      const chatTime = entity[Object.keys(entity)[0]].imageData.timeString;
      const chatTimeElement = document.createElement('div');
      chatTimeElement.classList.add('mr-2', 'text-gray-800');
      chatTimeElement.innerHTML = chatTime;
      messageOuter.appendChild(chatTimeElement);

      const messageText = this.el.value;
      const messageElement = document.createElement('div');
      messageElement.classList.add(
        'bg-white',
        'rounded-t-md',
        'rounded-bl-md',
        'p-2',
        'pr-3',
        'relative'
      );

      // オリジナルテキスト
      if (messageText.trim() !== '') {
        const originalElement = document.createElement('div');

        originalElement.innerHTML = messageText
          .replace(/\n/g, '<br>')
          .replace(/ /g, '&nbsp;');
        messageElement.appendChild(originalElement);
      }

      //グレースケールと写真に適応させる
      const grayscaleElement = document.createElement('div');
      const imageElemnt = document.createElement('div');
      const tabGrayscaleElm = document.getElementById('tab-grayscale');
      if (tabGrayscaleElm.classList.contains('hidden')) {
        grayscaleElement.classList.add(
          'absolute',
          'top-2',
          'z-10',
          'chat-grayscale',
          'hidden'
        );
        imageElemnt.classList.add('absolute', 'top-2', 'z-10', 'chat-image');
      } else {
        grayscaleElement.classList.add(
          'absolute',
          'top-2',
          'z-10',
          'chat-grayscale'
        );
        imageElemnt.classList.add(
          'absolute',
          'top-2',
          'z-10',
          'hidden',
          'chat-image'
        );
      }

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

  onOpened = (event) => {
    // ここにチャットサーバーに接続した時の処理を書く
    console.log('チャットサーバーに接続しました');
  };

  onReceived = (event) => {
    // ここにチャットサーバーからメッセージを受信した時の処理を書く
    const chatData = JSON.parse(event.data);
    const messageId = `message-${chatData.messageId}`; // id が数字から始まるとエラーになるので、先頭に文字列を付ける
    console.log('送られてきたデータ', chatData);

    if (chatData.type === 'head') {
      // メッセージの順番が送られてきた時の処理
      const messageElement = document.createElement('div');
      const entityIds = chatData.entityIds;

      messageElement.id = messageId;

      entityIds.forEach((entityId) => {
        // 1文字が収まる要素を作る
        const charElement = document.createElement('span');

        charElement.classList.add(entityId);
        messageElement.appendChild(charElement);
      });

      this.chatarea.appendChild(messageElement);
    } else if (chatData.type === 'body') {
      // メッセージの本文が送られてきた時の処理
      // メッセージを入れる要素を取得する
      const { body, entityId } = chatData;

      const messageElement = document.querySelector('#' + messageId);
      const charElement = messageElement.querySelector('.' + entityId);

      charElement.textContent = body.value;
    }
  };

  // チャットが送信されたらメッセージを送信する
  OnSubmited = (event) => {
    const entity = this.entity;
    const entityIds = this.entityIds;

    event.preventDefault();

    // 文字を一つの文章にするためにidを付ける
    const messageId = this.uuidv4();
    let message = JSON.stringify({
      entityIds,
      messageId,
      type: 'head',
    });

    // 文字の順番を送信する
    this.socket.send(
      JSON.stringify({
        action: 'sendmessage',
        message,
      })
    );

    for (const [entityId, body] of Object.entries(entity)) {
      message = JSON.stringify({
        entityId,
        messageId,
        body,
        type: 'body',
      });

      // 1文字の情報を送信する
      this.socket.send(
        JSON.stringify({
          action: 'sendmessage',
          message,
        })
      );
    }

    // 自分側に自分の送信した内容を表示する
    const item = document.createElement('li');
    const text = this.el.value;
    item.textContent = text;
    this.chatarea.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    console.log(this.el.value);

    this.el.value = '';
  };

  uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

//localStorage.clear();
