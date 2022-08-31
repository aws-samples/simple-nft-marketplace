# フロントエンドの動作確認

これまでの手順で構築したものの動作確認のためにフロントエンドを立ち上げます。フロントエンドはデプロイせず、`http://localhost:8080` で動作させます。**以下の手順は全て `/marketplace` ディレクトリで実施します。**

## 立ち上げ

以下のコマンドを実行して、フロントエンドの環境変数を設定します。

```bash
cat <<EOF > .env.local
VUE_APP_AWS_REGION=<region>
VUE_APP_API_ENDPOINT=<https://xxxxxxxxxx.execute-api.region.amazonaws.com/prod/>
VUE_APP_USER_POOL_ID=<...>
VUE_APP_USER_POOL_WEB_CLIENT_ID=<...>
EOF
```

なお `<>` で囲まれた値は以下の用に適切な値に置き換えてください。
- `VUE_APP_AWS_REGION` API をデプロイする Region
- `VUE_APP_API_ENDPOINT` [API のデプロイ](/docs/ja/DOCS_03_DEPLOY_API.md) にて作成した API のエンドポイント
- `VUE_APP_USER_POOL_ID` [API のデプロイ](/docs/ja/DOCS_03_DEPLOY_API.md) にて作成した Cognito User Pool の ID
- `VUE_APP_USER_POOL_WEB_CLIENT_ID` [API のデプロイ](/docs/ja/DOCS_03_DEPLOY_API.md) にて作成した Cognito User Pool Client の ID

続いて、以下のコマンドを実行して、必要なモジュールをインストールします。

```bash
npm install
```

最後に、以下のコマンドを実行して、`localhost:8080` でリッスンします。

```bash
npm run serve
```

ブラウザの http://localhost:8080 にアクセスしてください。サイトが表示されていれば成功です。

## アカウントの作成

まずは、ログインページが表示されるので、そこからアカウントを Sign Up してください。Sign Up の際には確認コードによる認証が必要なので、有効なメールアドレスを入力する必要があります。

> 解説: CDK のデプロイ手順で作成した Cognito のユーザープール上にアカウントを作成することになります。アカウントの情報は API の認証に利用されるのみで、外部に情報が公開されることはありません。

## ETH のデポジット

右上の「Account」ボタンを押下し、アカウントページに移行してください。そこに以下の情報が表示されています。

- Address: Public Address です。
- Balance: デポジットされた Ethereum の残高です。
- Private Key: ウォレットの秘密鍵です。「Retrieve」ボタンを押下することで表示します。

NFT の作成や転送には一定以上の Ethereum が必要です。そのため、[Contract のデプロイ](/docs/ja/DOCS_02_DEPLOY_CONTRACT.md)で行ったのと同様に Address に対してテスト用の Ethereum をデポジットする必要があります。デポジットが完了したら、Account ページを何度かリロードして、Balance が 0 より大きな数字になっていることを確認してください。

## NFT の作成

左上の「Home」ボタンで最初のページに遷移し、「Create NFT」を押下して NFT の作成ページに遷移します。適当な画像ファイルをアップロードし、タイトルと説明を入力して「CREATE」を押下します。作成が完了すると、NFT の詳細ページに自動で遷移します。

## NFT の確認、転送

NFT の詳細ページには、設定したタイトル、説明、オーナーのアドレスが表示されます。オーナーは初期状態で NFT の作成者になります。オーナーは NFT を転送することが可能です。下部の Transfer から適当なアドレス (例: `0xE36409e343896a10078500E4a8314375c3B0c24b`) を指定し、Transfer を実施してください。転送が完了するとページが自動でリロードされて、オーナーが別のアドレスになり、Transfer できなくなっていることが確認できます。

また、マーケットプレイスに陳列されているか否か (boolean)、NFT の作成者 (ロイヤリティを受け取るアカウント)、ロイヤリティのパーセンテージが表示されます。トークンのオーナーは、価格を設定して、マーケットプレイスに公開することができます。公開されているトークンは、オーナー以外のアカウントから購入可能です。

以上でフロントエンドの動作確認は完了です。

## 次の手順

-> [フロントエンドのデプロイ (オプショナル)](/docs/ja/DOCS_05_DEPLOY_FRONTEND.md)
