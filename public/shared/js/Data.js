class Data {
  constructor() {
    // サイトを利用するユーザー特有のid
    const uuidDataString = localStorage.getItem('uuidData');
    const uuidData = JSON.parse(uuidDataString);
    this.id = uuidData.uuid;

    // API の URL
    this.API_BASE_URL =
      'https://3a7zherzr6.execute-api.ap-northeast-1.amazonaws.com/dev';

    // 画像の URL
    this.IMG_BASE_URL =
      'https://kodama23-diary-dev-bucket.s3.ap-northeast-1.amazonaws.com';
  }

  // 投稿されている日付一覧を取得、タイムスタンプも取得できる
  getPostDates = async () => {
    try {
      const response = await fetch(`${this.API_BASE_URL}/diaries/${this.id}`);
      const data = await response.json();

      if (data.status === 'OK') {
        console.log(
          `ユーザーID: ${this.id} 日記が投稿されている日付の一覧を取得しました`
        );
        console.log(data);

        // ローディング画面が開いているときは閉じる
        const loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay.classList.contains('hidden')) {
          loadingOverlay.classList.add('hidden');
        }

        return data;
      } else {
        console.error('データの取得に失敗しました:', data);
      }
    } catch (error) {
      console.error('このidで一度も文章を書いていない:', error);
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
