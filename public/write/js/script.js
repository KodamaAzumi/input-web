const textarea = new Write('#js-textarea');
const grayscaleOutput = document.querySelector('#js-output-grayscale');
const imgOutput = document.querySelector('#js-output-image');
const scaleOutput = document.querySelector('#js-output-scale');

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
    spanGrayscale.classList.add('inline-block', 'm-0.5');
    spanGrayscale.style.color = `hsl(0, 0%, ${hslValue}%)`;
    spanGrayscale.appendChild(document.createTextNode(value));
    fragmentGrayscale.appendChild(spanGrayscale);
    grayscaleOutput.appendChild(fragmentGrayscale);
    //console.log(diff, calculatedDiff, hslValue);

    // 写真と文字を合成する
    const spanImgOuter = document.createElement('span');
    spanImgOuter.classList.add('inline-block', 'px-3', 'py-1');
    const spanImg = document.createElement('span');
    if (textarea.entity[entityId].imageData) {
      if (!(value === ' ' || value === '　')) {
        spanImgOuter.style.backgroundImage = `url(${textarea.entity[entityId].imageData.imageUrl})`;
        spanImgOuter.style.backgroundSize = 'cover';
        spanImg.style.color = '#fff';
        spanImg.style.mixBlendMode = 'difference';
      }
      spanImg.appendChild(document.createTextNode(value));
      spanImgOuter.appendChild(spanImg);
      fragmentImg.appendChild(spanImgOuter);
      imgOutput.appendChild(fragmentImg);
    }

    // 文字の幅に適応させる
    (() => {
      const char = document.createElement('span');
      const charBody = document.createElement('span');
      // 1 文字目は時差なし、なので必ず 1.0 になる
      // 1 文字目以降は時差に応じて文字の大きさを変える
      // 4000 ミリ秒で最大の 10 倍になる
      const sx = Math.abs(1.0 + Math.min((diff / 4000) * 9, 9));

      char.classList.add('inline-block', 'm-0.5');

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
document.getElementById('tabs-id').addEventListener('click', (e) => {
  textarea.el.focus();
});

// タブとタブのボタンを切り替える
const changeAtiveTab = (event, tabID) => {
  let element = event.target;
  let ulElement = element.parentNode.parentNode;
  let aElements = ulElement.querySelectorAll('li > a');
  tabContents = document
    .getElementById('tabs-id')
    .querySelectorAll('.tab-content > div');

  for (let i = 0; i < aElements.length; i++) {
    // ボタンの見た目を変える
    aElements[i].classList.remove('bg-gray-50', 'cursor-default');
    aElements[i].classList.add(
      'hover:bg-gray-50',
      'underline',
      'underline-offset-2',
      'cursor-pointer',
      'toolBtn'
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
    'cursor-pointer',
    'toolBtn'
  );
  element.classList.add('bg-gray-50', 'cursor-default');

  // 隠されていた表示する
  document.getElementById(tabID).classList.remove('hidden');
  document.getElementById(tabID).classList.add('block');

  // テキストエリアにフォーカスを当てる
  textarea.el.focus();
};

// ヘルプのオンオフ
const tooltipsOnOff = (event) => {
  const tooltip = document.querySelectorAll('.toolBtn-tooltip');
  const tooltipOff = document.querySelectorAll('.tooltipOff');
  const helpTooltip = document.querySelector('.helpBtn-tooltip');

  if (tooltip.length > 0) {
    tooltip.forEach((tooltips) => {
      tooltips.classList.remove('toolBtn-tooltip');
      tooltips.classList.add('tooltipOff');
      helpTooltip.innerHTML = 'ヘルプをオンにする';
    });
  } else if (tooltipOff.length > 0) {
    tooltipOff.forEach((tooltipOffs) => {
      tooltipOffs.classList.remove('tooltipOff');
      tooltipOffs.classList.add('toolBtn-tooltip');
      helpTooltip.innerHTML = 'ヘルプをオフにする';
    });
  }
};

// モーダルを閉じる
const saveModal = document.getElementById('saveBtn-modal');
const modalCloseBtn = document.getElementById('saveBtn-modal-closeBtn');
modalCloseBtn.addEventListener('click', () => {
  saveModal.classList.add('hidden');
});
