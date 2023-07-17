const textarea = new Photo('#js-textarea');
const grayscale = document.querySelector('#js-output-grayscale');
const imagePara = document.querySelector('#js-output-image');

const loop = () => {
  const fragment = document.createDocumentFragment();
  const fragmentImg = document.createDocumentFragment();

  grayscale.innerHTML = '';
  imagePara.innerHTML = '';

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
      grayscale.appendChild(fragment);
      imagePara.appendChild(fragmentImg);
      return;
    }

    const span = document.createElement('span');

    // diffを適した値に変更する
    const calculatedDiff = 100 - (diff / 1000) * 100;
    //console.log(entityId, i, value, diff, calculatedDiff);

    // calculatedDiffをグレースケールに適した値に変更する
    const hslValue = Math.max(Math.min(calculatedDiff, 99), 0);

    // グレースケールに適応させる
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

    // storageの画像を表示
    const spanImg = document.createElement('span');
    if (textarea.entity[entityId].imageData) {
      spanImg.style.backgroundImage = `url(${textarea.entity[entityId].imageData.imageUrl})`;
    }
    spanImg.style.backgroundClip = 'text';
    spanImg.style.webkitBackgroundClip = 'text';
    spanImg.style.color = 'transparent';
    spanImg.appendChild(document.createTextNode(value));
    fragmentImg.appendChild(spanImg);
  });

  grayscale.appendChild(fragment);
  imagePara.appendChild(fragmentImg);
  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);

// tabに関するコード
const changeAtiveTab = (event, tabID) => {
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
    aElements[i].classList.remove('text-orange-400');
    aElements[i].classList.remove('bg-white');
    // border-2 border-orange-300
    aElements[i].classList.remove('border-2');
    aElements[i].classList.remove('border-orange-300');

    aElements[i].classList.add('text-white');
    aElements[i].classList.add('bg-orange-400');
    // hover:bg-orange-300
    aElements[i].classList.add('hover:bg-orange-300');

    tabContents[i].classList.add('hidden');
    tabContents[i].classList.remove('block');
  }
  element.classList.remove('text-white');
  element.classList.remove('bg-orange-400');
  element.classList.remove('hover:bg-orange-300');

  element.classList.add('text-orange-400');
  element.classList.add('bg-white');
  element.classList.add('border-2');
  element.classList.add('border-orange-300');
  document.getElementById(tabID).classList.remove('hidden');
  document.getElementById(tabID).classList.add('block');
};
