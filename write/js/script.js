const textarea = new Photo("#js-textarea");
const output = document.querySelector("#js-output");
const imagePara = document.querySelector("#image-para");

const loop = () => {
  const fragment = document.createDocumentFragment();
  const fragmentImg = document.createDocumentFragment();

  output.innerHTML = "";
  imagePara.innerHTML = "";

  textarea.entityIds.forEach((entityId, i) => {
    // 入力された順に文字情報を順に取得する
    const { timestamp, value } = textarea.entity[entityId];
    // ひとつ前の ID を取得する
    const prevEntityId = textarea.entityIds[i - 1];
    const span = document.createElement("span");
    // ひとつ前の文字情報との時差
    let diff = 0;

    // ひとつ前の ID が見つからなければ、1文字目なので時差なし、になる
    if (prevEntityId) {
      diff = timestamp - textarea.entity[prevEntityId].timestamp;
    }

    // diffを適した値にするための計算
    const mathDiff = diff / 10 ** 3;
    //console.log(entityId, i, value, diff, mathDiff);

    // 不透明度に適応させる
    span.style.opacity = `${Math.max(mathDiff, 0.01)}`;
    span.appendChild(document.createTextNode(value));
    fragment.appendChild(span);

    // 文字間に適応させる
    /*
    span.style.paddingLeft = `${Math.max(diff / 4000, 1) * 4}em`;
    span.appendChild(document.createTextNode(value));
    fragment.appendChild(span);
    */

    //console.log(textarea.entity[entityId]);
    //console.log(textarea.entity[prevEntityId]);

    // storageの画像を表示
    const spanImg = document.createElement("span");
    if (textarea.entity[entityId].imageData) {
      spanImg.style.backgroundImage = `url(${textarea.entity[entityId].imageData.imageUrl})`;
    }
    spanImg.style.backgroundClip = "text";
    spanImg.style.webkitBackgroundClip = "text";
    spanImg.style.color = "transparent";
    spanImg.appendChild(document.createTextNode(value));
    fragmentImg.appendChild(spanImg);
  });

  output.appendChild(fragment);
  imagePara.appendChild(fragmentImg);
  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);

/*
// タブに関する記述
const openTab = (tabName) => {
  let i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  tablinks = document.getElementsByClassName("tablinks");

  // tabcontentの全ての要素を非表示にする
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // tablinksの全ての要素からactiveクラスを消去する
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  // 引数として受け取ったtabNameのタブを表示状態にする
  document.getElementById(tabName).style.display = "block";
  document.getElementById(tabName + "_btn").classList.add("active");
};

// タブボタンにクリックイベントリスナーを追加する
document.getElementById("tab1_btn").addEventListener("click", () => {
  openTab("tab1");
});

document.getElementById("tab2_btn").addEventListener("click", () => {
  openTab("tab2");
});

// 最初のタブを開く
openTab("tab1");
*/
