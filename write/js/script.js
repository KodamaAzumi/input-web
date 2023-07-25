const textarea = new Photo('#js-textarea');
const grayscale = document.querySelector('#js-output-grayscale');
const imagePara = document.querySelector('#js-output-image');
const scalePara = document.querySelector('#js-output-scale');

const loop = () => {
  const fragment = document.createDocumentFragment();
  const fragmentImg = document.createDocumentFragment();
  const fragmentScale = document.createDocumentFragment();

  grayscale.innerHTML = '';
  imagePara.innerHTML = '';
  scalePara.innerHTML = '';

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
      const br = document.createElement('br');
      fragment.appendChild(br);
      const brImg = document.createElement('br');
      fragmentImg.appendChild(brImg);
      const brScale = document.createElement('br');
      fragmentScale.appendChild(brScale);
      grayscale.appendChild(fragment);
      imagePara.appendChild(fragmentImg);
      scalePara.appendChild(fragmentScale);
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
    const span = document.createElement('span');
    span.style.color = `hsl(0, 0%, ${hslValue}%)`;
    span.appendChild(document.createTextNode(value));
    fragment.appendChild(span);
    //console.log(diff, calculatedDiff, hslValue);

    // 文字間に適応させる
    /*
    span.style.paddingLeft = `${Math.max(diff / 4000, 1) * 4}em`;
    span.appendChild(document.createTextNode(value));
    fragment.appendChild(span);
    */

    //console.log(textarea.entity[entityId]);
    //console.log(textarea.entity[prevEntityId]);

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

    // calculatedDiffをスケールに適した値に変更する
    const scaleXValue = Math.max(Math.min(calculatedDiff / 10, 100), 1);
    // 文字の長さ(scale)に適応させる
    const spanScale = document.createElement('span');
    spanScale.style.display = 'inline-block';
    spanScale.style.transform = `scale(${scaleXValue}, 1)`;
    spanScale.style.transformOrigin = 'left top';
    spanScale.appendChild(document.createTextNode(value));
    fragmentScale.appendChild(spanScale);
  });

  grayscale.appendChild(fragment);
  imagePara.appendChild(fragmentImg);
  scalePara.appendChild(fragmentScale);
  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);

// タブとタブのボタンを切り替える
const changeAtiveTab = (event, tabID) => {
  textarea.el.classList.remove('opacity-0');

  let element = event.target;
  while (element.nodeName !== 'A') {
    element = element.parentNode;
  }
  let ulElement = element.parentNode.parentNode;
  let aElements = ulElement.querySelectorAll('li > a');
  tabContents = document
    .getElementById('tabs-id')
    .querySelectorAll('.tab-content > div');
  for (let i = 0; i < aElements.length; i++) {
    aElements[i].classList.remove('bg-gray-50');
    aElements[i].classList.remove('cursor-default');
    aElements[i].classList.add('hover:bg-gray-50');
    aElements[i].classList.add('underline');
    aElements[i].classList.add('underline-offset-2');
    aElements[i].classList.add('cursor-pointer');

    tabContents[i].classList.add('hidden');
    tabContents[i].classList.remove('block');
  }
  element.classList.remove('hover:bg-gray-50');
  element.classList.remove('underline');
  element.classList.remove('underline-offset-2');
  element.classList.remove('cursor-pointer');
  element.classList.add('bg-gray-50');
  element.classList.add('cursor-default');

  document.getElementById(tabID).classList.remove('hidden');
  document.getElementById(tabID).classList.add('block');
};

const textareaOff = () => {
  textarea.el.classList.add('opacity-0');
};
