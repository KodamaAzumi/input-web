/**
 * このクラスは diff.min.js に依存しています
 * このクラスは diff.min.js, eventemitter3.umd.min.js に依存しています
 */
class Textarea {
  constructor(selectors, autoResize = true) {
    this.ee = new EventEmitter3();

    this.el = document.querySelector(selectors);
    this.autoResize = autoResize;
    this.prevValue = ''; // 変更（input）直前の文字列

    // テキストの削除を除いて input イベントが発生した回数
    this.count = 0;
    /**
     * 入力された文字を情報を保持するオブジェクト
     * {
     *   [id]: {
     *     timestamp: Number, // Unix time
     *     value: String, // `c{input イベントが発生した回数}i{入力された文字の何番目かを表す数値}` の形式
     *   }
     * }
     */
    this.entity = {};
    // 文字が打たれた順番をもとに生成されたユニークな文字列（id）の配列
    // たとえば
    // （変更前）love → [c0i0, c0i1, c0i2, c0i3]
    // （変更後）live → [c0i0, c1i0, c0i2, c0i3]
    this.entityIds = [];

    this.onInput = this.onInput.bind(this);

    // ウィンドウのサイズを変更したとき内容に合わせてテキストエリアのサイズを変更する
    //this.onResizedHeight = this.onResizedHeight.bind(this);
    //window.addEventListener('resize', this.onResizedHeight);

    // テキストエリアがフォーカスされたらキャレットを付ける
    this.el.addEventListener('focus', (e) => {
      console.log('textareaにフォーカスした', e);
      document.querySelectorAll('.caret').forEach((caret) => {
        caret.classList.add('onCaret');
      });
    });

    // テキストエリアからフォーカスが外れたらキャレットを隠す
    this.el.addEventListener('blur', (e) => {
      console.log('textareaからフォーカスが外れた', e);
      document.querySelectorAll('.caret').forEach((caret) => {
        caret.classList.remove('onCaret');
      });
    });

    // textarea 要素を取得できたか
    if (this.el && this.el.tagName === 'TEXTAREA') {
      this.el.addEventListener('input', this.onInput);
      return;
    }

    throw new Error(
      'Textarea クラスからインスタンスを生成するときは必ず引数に textarea 要素を示すセレクタ文字列を指定してください'
    );
  }

  onResizedHeight(e) {
    if (this.autoResize) {
      this.el.style.height = 'auto';
      this.el.style.height = `${this.el.scrollHeight}px`;
    }
  }

  onInput(e) {
    const diff = Diff.diffChars(this.prevValue, this.el.value);

    let caretCoord = 0;
    let isntCounted = true;

    // テキストエリアの高さを元に戻す
    this.onResizedHeight();

    diff.forEach((part, i) => {
      // 新しく挿入された文字列があるか
      if (part.added) {
        for (let j = 0; j < part.count; j++) {
          const entityId = `c${this.count}i${j}`;
          const timestamp = Date.now();
          const value = part.value[j];

          this.entity[entityId] = {
            timestamp,
            value,
          };
          this.entityIds.splice(j + caretCoord, 0, entityId);

          this.ee.emit('added', { entityId });
        }

        // テキストの入力があったら input イベントが発生した回数をカウントアップ
        if (isntCounted) {
          isntCounted = false;
          this.count++;
        }
      }

      // 削除された文字列があるか
      if (part.removed) {
        // 削除された文字列を表す ID を配列から削除する
        this.entityIds.splice(caretCoord, part.count);
      } else {
        caretCoord += part.count;
      }

      // 文字列の追加も削除も行われなかった時（つまり変換がされた時）もカウントを進める
      if (
        typeof part.added === 'undefined' &&
        typeof part.removed === 'undefined'
      ) {
        this.count++;
      }
    });

    // 変更後の文字列を更新する（次の input イベント発生時に文字列の比較に使われる）
    this.prevValue = this.el.value;
  }
}
