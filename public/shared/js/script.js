console.log('shared script.js');
//localStorage.clear();

// ローカルストレージにUUIDがない場合、UUIDを発行する
let uuidDataString = localStorage.getItem('uuidData');
// 文字列をオブジェクトに変換する
let uuidData = JSON.parse(uuidDataString);
console.log(uuidData);

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

if (!uuidData || Object.keys(uuidData).length === 0) {
  const uuid = uuidv4();
  uuidData = { uuid };
  uuidDataString = JSON.stringify(uuidData);
  localStorage.setItem('uuidData', uuidDataString);

  console.log(uuidData);
}
