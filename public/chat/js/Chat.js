class Chat extends Photo {
  constructor(selectors) {
    super(selectors);

    this.socket = new WebSocket(
      'wss://c8rz9t1xyi.execute-api.ap-northeast-1.amazonaws.com/prod'
    );
    this.inputArea = document.getElementById('input-area');
    this.chatarea = document.getElementById('js-chatarea');
    this.entityOnes; // 1文字ずつ送ったentityをまとめる箱

    // チャットサーバーに接続したとき
    this.socket.addEventListener('open', (e) => {
      // ここにチャットサーバーに接続した時の処理を書く
      console.log('チャットサーバーに接続しました', e);
    });

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
  }

  onReceived = (event) => {
    // ここにチャットサーバーからメッセージを受信した時の処理を書く
    const chatData = JSON.parse(event.data);
    const messageId = `message-${chatData.messageId}`; // id が数字から始まるとエラーになるので、先頭に文字列を付ける
    const previewId = `preview-${chatData.messageId}`;
    console.log('送られてきたデータ', chatData);

    if (chatData.type === 'head') {
      // メッセージの順番が送られてきた時の処理

      //写真のプレビューとメッセージの入れ物を作る
      const chatElement = document.createElement('div');
      chatElement.classList.add(
        'flex',
        'flex-col-reverse',
        'w-full',
        'sm:w-4/5',
        'justify-self-start'
      );
      this.chatarea.appendChild(chatElement);

      // プレビューしたときに画像をだすための入れ物を作る
      const previewElement = document.createElement('div');
      previewElement.id = previewId;
      previewElement.classList.add(
        'bg-white',
        'rounded-md',
        'p-5',
        'mb-3',
        'grid',
        'justify-items-stretch',
        'hidden',
        'preview-image'
      );
      chatElement.appendChild(previewElement);

      // プレビューを消すための×ボタンを作る
      const previewCloseBtn = ` 
        <button
          type="button"
          class="preview-closeBtn mb-2 justify-self-end text-sky-400 bg-transparent hover:text-sky-200 text-sm w-8 h-8 inline-flex justify-center items-center"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span class="sr-only">Close preview</span>
        </button>
      `;
      previewElement.innerHTML = previewCloseBtn;

      // プレビューを閉じるボタン
      const previewBtn = previewElement.querySelector('.preview-closeBtn');
      previewBtn.addEventListener('click', (e) => {
        previewElement.classList.add('hidden');
      });

      // チャットの時間と吹き出しの入れ物を作る
      const messageOuter = document.createElement('div');
      messageOuter.classList.add(
        'flex',
        'justify-start',
        'items-end',
        'mb-3',
        'ml-2'
      );
      chatElement.appendChild(messageOuter);

      // チャットを送信した時間を作る
      const chatTimeElement = document.createElement('p');
      chatTimeElement.classList.add('ml-2', 'text-sky-800');
      const chatTime = this.time.createTimeStr();
      chatTimeElement.innerHTML = chatTime;
      messageOuter.appendChild(chatTimeElement);

      // チャットの吹き出しを作る
      const messageElement = document.createElement('div');
      messageElement.id = messageId;
      messageElement.classList.add(
        'bg-white',
        'rounded-t-md',
        'rounded-br-md',
        'p-3',
        'pl-7',
        'relative',
        'order-first',
        'text-lg',
        'md:text-xl'
      );
      messageOuter.appendChild(messageElement);

      const entityIds = chatData.entityIds;

      // グレースケールと写真を適応させる用の入れ物を作る
      const grayscaleElement = document.createElement('div');
      messageElement.appendChild(grayscaleElement);
      const imageElemnt = document.createElement('div');
      messageElement.appendChild(imageElemnt);
      const scaleElemnt = document.createElement('div');
      messageElement.appendChild(scaleElemnt);

      // タブの切り替えを作る
      const tabGrayscaleElm = document.getElementById('tab-grayscale');
      const tabImageElm = document.getElementById('tab-image');
      const tabScaleElm = document.getElementById('tab-scale');

      if (!tabGrayscaleElm.classList.contains('hidden')) {
        grayscaleElement.classList.add('chat-grayscale');
        imageElemnt.classList.add('hidden', 'chat-image');
        scaleElemnt.classList.add('chat-scale', 'hidden');
      } else if (!tabImageElm.classList.contains('hidden')) {
        grayscaleElement.classList.add('chat-grayscale', 'hidden');
        imageElemnt.classList.add('chat-image');
        scaleElemnt.classList.add('chat-scale', 'hidden');
      } else if (!tabScaleElm.classList.contains('hidden')) {
        grayscaleElement.classList.add('chat-grayscale', 'hidden');
        imageElemnt.classList.add('hidden', 'chat-image');
        scaleElemnt.classList.add('chat-scale');
      }

      entityIds.forEach((entityId) => {
        // 1文字が収まる要素を作る
        const spanGrayscale = document.createElement('span');
        spanGrayscale.classList.add(entityId, 'inline-block', 'm-[0.0625rem]');
        grayscaleElement.appendChild(spanGrayscale);

        const spanImgOuter = document.createElement('span');
        spanImgOuter.classList.add('inline-block', 'px-2');
        imageElemnt.appendChild(spanImgOuter);
        const spanImg = document.createElement('span');
        spanImg.classList.add(entityId);
        spanImgOuter.appendChild(spanImg);

        const spanScale = document.createElement('span');
        spanScale.classList.add(entityId);
        scaleElemnt.appendChild(spanScale);

        // プレビューするための写真の入れ物を用意する
        const previewImg = document.createElement('img');
        previewImg.classList.add(entityId);
        previewElement.appendChild(previewImg);

        // プレビューを表示するためのクリックイベント
        spanImg.addEventListener('click', (e) => {
          if (previewElement.classList.contains('hidden')) {
            previewElement.classList.remove('hidden');
          }
          entityIds.forEach((thisEntityId) => {
            if (
              !previewElement
                .querySelector('.' + thisEntityId)
                .classList.contains('hidden')
            ) {
              previewElement
                .querySelector('.' + thisEntityId)
                .classList.add('hidden');
            }
          });
          previewElement
            .querySelector('.' + entityId)
            .classList.remove('hidden');
        });
      });

      // スクロールバーを一番下に移動する
      this.chatarea.scrollTop = this.chatarea.scrollHeight;
    } else if (chatData.type === 'body') {
      // メッセージの本文が送られてきた時の処理
      // メッセージを入れる要素を取得する
      const { body, entityId } = chatData;

      const messageElement = document.querySelector('#' + messageId);
      const previewElement = document.querySelector('#' + previewId);

      // messageElementがないとき、処理を中断する
      if (!messageElement) {
        console.log('messageElementがない');
        return;
      }

      const grayscaleElement = messageElement.querySelector('.chat-grayscale');
      const spanGrayscale = grayscaleElement.querySelector('.' + entityId);

      const imageElemnt = messageElement.querySelector('.chat-image');
      const spanImg = imageElemnt.querySelector('.' + entityId);
      const spanImgOuter = spanImg.parentElement;
      const previewImg = previewElement.querySelector('.' + entityId);

      const scaleElemnt = messageElement.querySelector('.chat-scale');
      const char = scaleElemnt.querySelector('.' + entityId);

      if (spanGrayscale && spanImg && char) {
        if (
          '\r\n' === body.value ||
          '\r' === body.value ||
          '\n' === body.value
        ) {
          // 入力された文字が改行コードか
          // 改行コードであれば br 要素を挿入して、以降の処理を中断する
          const brGrayscale = document.createElement('br');
          grayscaleElement.appendChild(brGrayscale);
          const brImg = document.createElement('br');
          imageElemnt.appendChild(brImg);
          const brScale = document.createElement('br');
          scaleElemnt.appendChild(brScale);
          return;
        }

        // diffを適した値に変更する(diffはミリ秒)
        const calculatedDiff = (chatData.diff / 1000) * 100;

        // calculatedDiffをグレースケールに適した値に変更する
        const hslValue = Math.max(Math.min(100 - calculatedDiff, 99), 0);

        // グレースケールを文字に合成する
        spanGrayscale.style.color = `hsl(0, 0%, ${hslValue}%)`;
        spanGrayscale.appendChild(document.createTextNode(body.value));

        // 写真と文字を合成する
        if (!(body.value === ' ' || body.value === '　')) {
          spanImgOuter.style.backgroundImage = `url(${body.image})`;
          spanImgOuter.style.backgroundSize = 'cover';
          spanImgOuter.style.backgroundPosition = 'center';
          spanImg.style.color = '#fff';
          spanImg.style.mixBlendMode = 'difference';
        }
        spanImg.appendChild(document.createTextNode(body.value));

        // プレビューに写真を追加する
        previewImg.src = `${body.image}`;

        // 文字の幅に適応させる
        (() => {
          const charBody = document.createElement('span');
          // 1 文字目は時差なし、なので必ず 1.0 になる
          // 1 文字目以降は時差に応じて文字の大きさを変える
          // 4000 ミリ秒で最大の 10 倍になる
          const sx = Math.abs(1.0 + Math.min((chatData.diff / 4000) * 9, 9));

          char.classList.add('inline-block', 'm-[0.0625rem]');

          charBody.style.transform = `scaleX(${sx})`;
          charBody.style.transformOrigin = `top left`;
          charBody.style.display = 'inline-block';

          charBody.appendChild(document.createTextNode(body.value));
          char.appendChild(charBody);

          // 要素がdisplay:noneになっていると幅が取得できないので一瞬表示してから取得する
          if (scaleElemnt.classList.contains('hidden')) {
            scaleElemnt.classList.remove('hidden');
            const charBodyDOMRect = charBody.getBoundingClientRect();
            char.style.width = `${charBodyDOMRect.width}px`;
            scaleElemnt.classList.add('hidden');
          } else {
            const charBodyDOMRect = charBody.getBoundingClientRect();
            char.style.width = `${charBodyDOMRect.width}px`;
          }
        })();
      }
    }
  };

  // チャットが送信されたらメッセージを送信する
  OnSubmited = (event) => {
    const entity = this.entity;
    const entityIds = this.entityIds;
    const text = this.el.value;

    event.preventDefault();

    // 文字を一つの文章にするためにidを付ける
    const messageId = this.uuidv4();

    // 文字の順番だけの情報
    let message = JSON.stringify({
      text,
      entityIds,
      messageId,
      type: 'head',
    });

    // 文字の順番を送信する
    if (entityIds.length > 0 && text) {
      this.socket.send(
        JSON.stringify({
          action: 'sendmessage',
          message,
        })
      );
    }

    // 自分側に自分の送信した内容を表示する
    if (entityIds.length > 0 && text) {
      //写真のプレビューとメッセージの入れ物を作る
      const chatElement = document.createElement('div');
      chatElement.classList.add(
        'flex',
        'flex-col-reverse',
        'w-full',
        'sm:w-4/5',
        'justify-self-end'
      );
      this.chatarea.appendChild(chatElement);

      // プレビューしたときに画像をだすための入れ物を作る
      const previewElement = document.createElement('div');
      previewElement.classList.add(
        'bg-white',
        'rounded-md',
        'p-5',
        'mb-3',
        'grid',
        'justify-items-stretch',
        'hidden',
        'preview-image'
      );
      chatElement.appendChild(previewElement);

      // プレビューを消すための×ボタンを作る
      const previewCloseBtn = ` 
        <button
          type="button"
          class="preview-closeBtn mb-2 justify-self-end text-sky-400 bg-transparent hover:text-sky-200 text-sm w-8 h-8 inline-flex justify-center items-center"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span class="sr-only">Close preview</span>
        </button>
      `;
      previewElement.innerHTML = previewCloseBtn;

      // プレビューを閉じるボタン
      const previewBtn = previewElement.querySelector('.preview-closeBtn');
      previewBtn.addEventListener('click', (e) => {
        previewElement.classList.add('hidden');
      });

      // チャットの時間と吹き出しの入れ物を作る
      const messageOuter = document.createElement('div');
      messageOuter.classList.add(
        'flex',
        'justify-end',
        'items-end',
        'mb-3',
        'mr-2'
      );
      chatElement.appendChild(messageOuter);

      // チャットを送信した時間を作る
      const chatTimeElement = document.createElement('p');
      chatTimeElement.classList.add('mr-2', 'text-sky-800');
      const chatTime = this.time.createTimeStr();
      chatTimeElement.innerHTML = chatTime;
      messageOuter.appendChild(chatTimeElement);

      const messageElement = document.createElement('div');
      messageElement.classList.add(
        'bg-white',
        'rounded-t-md',
        'rounded-bl-md',
        'p-3',
        'pr-7',
        'relative',
        'text-lg',
        'md:text-xl'
      );
      messageOuter.appendChild(messageElement);

      // グレースケールと写真を適応させる用の入れ物を作る
      const grayscaleElement = document.createElement('div');
      const imageElemnt = document.createElement('div');
      const scaleElemnt = document.createElement('div');

      // タブの切り替えを作る
      const tabGrayscaleElm = document.getElementById('tab-grayscale');
      const tabImageElm = document.getElementById('tab-image');
      const tabScaleElm = document.getElementById('tab-scale');

      if (!tabGrayscaleElm.classList.contains('hidden')) {
        grayscaleElement.classList.add('chat-grayscale');
        imageElemnt.classList.add('hidden', 'chat-image');
        scaleElemnt.classList.add('chat-scale', 'hidden');
      } else if (!tabImageElm.classList.contains('hidden')) {
        grayscaleElement.classList.add('chat-grayscale', 'hidden');
        imageElemnt.classList.add('chat-image');
        scaleElemnt.classList.add('chat-scale', 'hidden');
      } else if (!tabScaleElm.classList.contains('hidden')) {
        grayscaleElement.classList.add('chat-grayscale', 'hidden');
        imageElemnt.classList.add('hidden', 'chat-image');
        scaleElemnt.classList.add('chat-scale');
      }

      // 1文字分の情報
      entityIds.forEach((entityId, i) => {
        // 1文字分の情報をbodyに入れる
        const body = entity[entityId];

        // 入力された順に文字情報を順に取得する
        const { timestamp, value } = textarea.entity[entityId];

        // ひとつ前の ID を取得する
        const prevEntityId = entityIds[i - 1];

        // ひとつ前の文字情報との時差
        let diff = 0;

        // ひとつ前の ID が見つからなければ、1文字目なので時差なし、になる
        if (prevEntityId) {
          diff = timestamp - entity[prevEntityId].timestamp;
          console.log(diff);
        }

        setTimeout(() => {
          message = JSON.stringify({
            entityId,
            messageId,
            body,
            diff,
            type: 'body',
          });

          // 1文字の情報を送信する
          this.socket.send(
            JSON.stringify({
              action: 'sendmessage',
              message,
            })
          );
          console.log('sended');
        }, 20);

        // 入力された文字が改行コードか
        if ('\r\n' === value || '\r' === value || '\n' === value) {
          // 改行コードであれば br 要素を挿入して、以降の処理を中断する
          const brGrayscale = document.createElement('br');
          grayscaleElement.appendChild(brGrayscale);
          const brImg = document.createElement('br');
          imageElemnt.appendChild(brImg);
          const brScale = document.createElement('br');
          scaleElemnt.appendChild(brScale);
          return;
        }

        // diffを適した値に変更する(diffはミリ秒)
        const calculatedDiff = (diff / 1000) * 100;

        // calculatedDiffをグレースケールに適した値に変更する
        const hslValue = Math.max(Math.min(100 - calculatedDiff, 99), 0);
        // グレースケールに適応させる
        const spanGrayscale = document.createElement('span');
        spanGrayscale.classList.add('inline-block', 'm-[0.0625rem]');
        spanGrayscale.style.color = `hsl(0, 0%, ${hslValue}%)`;
        spanGrayscale.appendChild(document.createTextNode(value));
        grayscaleElement.appendChild(spanGrayscale);
        messageElement.appendChild(grayscaleElement);

        // 写真と文字を合成する
        const spanImgOuter = document.createElement('span');
        spanImgOuter.classList.add('inline-block', 'px-2');
        const spanImg = document.createElement('span');
        spanImg.classList.add(entityId);
        if (!(value === ' ' || value === '　')) {
          spanImgOuter.style.backgroundImage = `url(${textarea.entity[entityId].image})`;
          spanImgOuter.style.backgroundSize = 'cover';
          spanImgOuter.style.backgroundPosition = 'center';
          spanImg.style.color = '#fff';
          spanImg.style.mixBlendMode = 'difference';
        }
        spanImg.appendChild(document.createTextNode(value));
        spanImgOuter.appendChild(spanImg);
        imageElemnt.appendChild(spanImgOuter);
        messageElement.appendChild(imageElemnt);

        // プレビューを表示するためのクリックイベント
        spanImg.addEventListener('click', (e) => {
          if (previewElement.classList.contains('hidden')) {
            previewElement.classList.remove('hidden');
          }
          entityIds.forEach((thisEntityId) => {
            if (
              !previewElement
                .querySelector('.' + thisEntityId)
                .classList.contains('hidden')
            ) {
              previewElement
                .querySelector('.' + thisEntityId)
                .classList.add('hidden');
            }
          });
          previewElement
            .querySelector('.' + entityId)
            .classList.remove('hidden');
        });

        // プレビューするための写真を用意する
        const previewImg = document.createElement('img');
        previewImg.classList.add(entityId);
        previewImg.src = `${textarea.entity[entityId].image}`;
        previewElement.appendChild(previewImg);

        // 文字の幅に適応させる
        (() => {
          const char = document.createElement('span');
          const charBody = document.createElement('span');
          // 1 文字目は時差なし、なので必ず 1.0 になる
          // 1 文字目以降は時差に応じて文字の大きさを変える
          // 4000 ミリ秒で最大の 10 倍になる
          const sx = Math.abs(1.0 + Math.min((diff / 4000) * 9, 9));

          char.classList.add('inline-block', 'm-[0.0625rem]');

          charBody.style.transform = `scaleX(${sx})`;
          charBody.style.transformOrigin = `top left`;
          charBody.style.display = 'inline-block';

          charBody.appendChild(document.createTextNode(value));
          char.appendChild(charBody);
          scaleElemnt.appendChild(char);
          messageElement.appendChild(scaleElemnt);

          // 要素がdisplay:noneになっていると幅が取得できないので一瞬表示してから取得する
          if (scaleElemnt.classList.contains('hidden')) {
            scaleElemnt.classList.remove('hidden');
            const charBodyDOMRect = charBody.getBoundingClientRect();
            char.style.width = `${charBodyDOMRect.width}px`;
            scaleElemnt.classList.add('hidden');
          } else {
            const charBodyDOMRect = charBody.getBoundingClientRect();
            char.style.width = `${charBodyDOMRect.width}px`;
          }
        })();
      });
    }

    // スクロールバーを一番下に移動する
    this.chatarea.scrollTop = this.chatarea.scrollHeight;

    // 送信後、テキストエリアのテキストを消去する
    this.onCleared();

    // テキストエリアの高さを元に戻す
    this.onResizedHeight();
  };

  uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  onCleared = () => {
    console.log('oncleared');

    // 保存した文章をリセットする
    this.el.value = '';
    this.count = 0;
    this.entity = {};
    this.entityIds = [];
  };
}

//localStorage.clear();
