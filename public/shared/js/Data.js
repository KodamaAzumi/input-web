class Data {
  constructor() {
    // サイトを利用するユーザー特有のid
    const uuidDataString = localStorage.getItem('uuidData');
    const uuidData = JSON.parse(uuidDataString);
    this.id = uuidData.uuid;

    // API の URL
    this.API_BASE_URL =
      'https://rexy82pit8.execute-api.ap-northeast-1.amazonaws.com/dev';

    // 画像の URL
    this.IMG_BASE_URL =
      'https://kodama23-diary-dev-bucket.s3.ap-northeast-1.amazonaws.com';
  }

  // 投稿されている日付一覧を取得、タイムスタンプも取得できる
  getPostDates = async () => {
    const response = await fetch(`${this.API_BASE_URL}/diaries/${this.id}`);
    const data = await response.json();
    if (data.status === 'OK') {
      console.log(
        `ユーザーID: ${this.id} 日記が投稿されている日付の一覧を取得しました`
      );
      console.log(data);
      return data;
    }
  };

  getSentence = async (timestamp) => {
    const response = await fetch(
      `${this.API_BASE_URL}/diaries/${this.id}/${timestamp}`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      console.log(`${timestamp} の日記を取得しました`);
      return data;
    }
  };
}
