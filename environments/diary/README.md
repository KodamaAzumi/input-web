<https://zenn.dev/ishimura/articles/910ef8ec1bcc64>
<https://zenn.dev/naok_1207/articles/89b4f3fe58753a>

https://www.npmjs.com/package/serverless-dynamodb のインストールは https://zenn.dev/ishimura/articles/910ef8ec1bcc64 を参考にした

serverless.yml で aws からはじまるプロパティを使えなかったので sls をアップデートした。  
アップデート前の情報は以下の通り。

```sh
Framework Core: 3.35.2 (local) 3.35.2 (global)
Plugin: 7.0.5
SDK: 4.4.0
```

```sh
# serverless framework のアップデート
$ brew upgrade serverless
```

serverless framework は、この時点（2023 年 10 月 17 日）の最新バージョンだったので、この問題には直接関係なかった。  
serverless.yml の provider.name の値が aws になっていないだけだった。

---

```sh
$ serverless dynamodb install # DynamoDB Local（https://www.npmjs.com/package/serverless-dynamodb）をインストールする
$ serverless dynamodb start # DynamoDB Localを起動する
> Dynamodb Local Started, Visit: http://localhost:8000/shell
> DynamoDB - created table {Table Name}
```

serverless offline start により、DynamoDB も同時に起動することもできる。

```sh
$ serverless offline start
```

```sh
# 関数のみのデプロイ
$ serverless deploy functions -f [関数名]
```
