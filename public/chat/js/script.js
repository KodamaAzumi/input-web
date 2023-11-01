const textarea = new Chat('#js-textarea');
const grayscaleOutput = document.querySelector('#js-output-grayscale');
const imgOutput = document.querySelector('#js-output-image');
const scaleOutput = document.querySelector('#js-output-scale');

// チャットの入力部分に適応させるコード
const loop = () => {
  const fragmentGrayscale = document.createDocumentFragment();
  const fragmentImg = document.createDocumentFragment();
  const fragmentScale = document.createDocumentFragment();

  grayscaleOutput.innerHTML = '';
  imgOutput.innerHTML = '';
  scaleOutput.innerHTML = '';

  textarea.entityIds.forEach((entityId, i) => {
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
      fragmentGrayscale.appendChild(brGrayscale);
      const brImg = document.createElement('br');
      fragmentImg.appendChild(brImg);
      const brScale = document.createElement('br');
      fragmentScale.appendChild(brScale);
      grayscaleOutput.appendChild(fragmentGrayscale);
      imgOutput.appendChild(fragmentImg);
      scaleOutput.appendChild(fragmentScale);
      return;
    }

    /*
    console.log(entityId, i, timestamp, value, prevEntityId);
    console.log(textarea);
    console.log(textarea.entityIds);
    console.log(textarea.entity);
    */

    // diffを適した値に変更する(diffはミリ秒)
    const calculatedDiff = (diff / 1000) * 100;

    // calculatedDiffをグレースケールに適した値に変更する
    const hslValue = Math.max(Math.min(100 - calculatedDiff, 99), 0);
    // グレースケールに適応させる
    const spanGrayscale = document.createElement('span');
    spanGrayscale.style.color = `hsl(0, 0%, ${hslValue}%)`;
    spanGrayscale.appendChild(document.createTextNode(value));
    fragmentGrayscale.appendChild(spanGrayscale);
    grayscaleOutput.appendChild(fragmentGrayscale);
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
    fragmentImg.appendChild(spanImg);
    imgOutput.appendChild(fragmentImg);

    // 文字の幅に適応させる
    (() => {
      const char = document.createElement('span');
      const charBody = document.createElement('span');
      // 1 文字目は時差なし、なので必ず 1.0 になる
      // 1 文字目以降は時差に応じて文字の大きさを変える
      // 4000 ミリ秒で最大の 10 倍になる
      const sx = Math.abs(1.0 + Math.min((diff / 4000) * 9, 9));

      char.style.display = 'inline-block';
      charBody.style.transform = `scaleX(${sx})`;
      charBody.style.transformOrigin = `top left`;
      charBody.style.display = 'inline-block';

      charBody.appendChild(document.createTextNode(value));
      char.appendChild(charBody);
      fragmentScale.appendChild(char);
      scaleOutput.appendChild(fragmentScale);

      const charBodyDOMRect = charBody.getBoundingClientRect();
      char.style.width = `${charBodyDOMRect.width}px`;
    })();
  });

  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);

// タブをクリックしたときにテキストエリアにフォーカスさせる
document.querySelector('.tab-content').addEventListener('click', (e) => {
  textarea.el.focus();
});

// 入力画面のタブとタブのボタンを切り替える
const changeAtiveTab = (event, tabID) => {
  let element = event.target;
  let ulElement = element.parentNode.parentNode;
  let aElements = ulElement.querySelectorAll('li > a');
  tabContents = document
    .getElementById('input-area')
    .querySelectorAll('.tab-content > div');

  for (let i = 0; i < aElements.length; i++) {
    // ボタンの見た目を変える
    aElements[i].classList.remove('bg-gray-50', 'cursor-default');
    aElements[i].classList.add(
      'hover:bg-gray-50',
      'underline',
      'underline-offset-2',
      'cursor-pointer'
    );

    // 表示されているものをhiddenにする
    tabContents[i].classList.add('hidden');
    tabContents[i].classList.remove('block');
  }

  // ボタンの見た目を変える
  element.classList.remove(
    'hover:bg-gray-50',
    'underline',
    'underline-offset-2',
    'cursor-pointer'
  );
  element.classList.add('bg-gray-50', 'cursor-default');

  // 隠されていた内容を表示する
  document.getElementById(tabID).classList.remove('hidden');
  document.getElementById(tabID).classList.add('block');

  // チャットのタイムラインの切り替え
  const grayscaleElements = document.querySelectorAll('.chat-grayscale');
  const imageElemnts = document.querySelectorAll('.chat-image');
  const previewElements = document.querySelectorAll('.preview-image');

  if (tabID === 'tab-grayscale') {
    grayscaleElements.forEach((grayscaleElement) => {
      grayscaleElement.classList.remove('hidden');
    });
    imageElemnts.forEach((imageElemnt) => {
      imageElemnt.classList.add('hidden');
    });
    previewElements.forEach((previewElement) => {
      if (!previewElement.classList.contains('hidden')) {
        previewElement.classList.add('hidden');
      }
    });
  } else if (tabID === 'tab-image') {
    imageElemnts.forEach((imageElemnt) => {
      imageElemnt.classList.remove('hidden');
    });
    grayscaleElements.forEach((grayscaleElement) => {
      grayscaleElement.classList.add('hidden');
    });
  }
};
