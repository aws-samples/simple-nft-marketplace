## 前提

- 以降のドキュメントは全て UNIX 環境が前提の構築方法になっています。UNIX コマンド実行環境がない場合は、AWS Cloud9 を利用することも可能です。AWS Cloud9 を利用する場合、Node.js のバージョンをアップデートする必要があります。

## クイックスタート

### 依存関係をインストールする

開始するには、次のコマンドを実行して、必要な依存関係をインストールします。

```bash
npm install
```

### AWSプロファイルを設定します

シェルで現在アクティブな AWS プロファイルは、インフラストラクチャをデプロイするために使用されます。プロファイルが指定されていない場合 `default` プロファイルが使用されます。

使用する `default` 以外のプロファイルを指定するには、次のコマンドを実行します。
`my-profile` をプロファイル名に置き換えます。

```bash
export AWS_PROFILE='my-profile'
```

### デプロイスクリプトを実行します

デプロイスクリプトを実行し、次のコマンドを実行してプロンプトに従います。

```bash
./deploy.js
```

### クリーンアップ

> :warning: この例で使用されているピアノードは、1時間あたり0.174ドルもの費用がかかる可能性があります。お住まいの地域によって異なります。 検証が終了次第、リソースを削除することをお勧めします。

作成されたすべてのリソースを削除するには、次のコマンドをリポジトリのルートで実行します。

```bash
npm run cleanup
```

これにより、デプロイしたインフラストラクチャとデプロイスクリプトによって作成された `deploy-settings.json`ファイルを削除します。

## Step by Step によるデプロイガイド
- [Ethereum Testnet Ropsten のノード作成 (Amazon Managed Blockchain)](/docs/ja/DOCS_01_CREATE_AMB.md)
- [Contract のデプロイ](/docs/ja/DOCS_02_DEPLOY_CONTRACT.md)
- [API のデプロイ](/docs/ja/DOCS_03_DEPLOY_API.md)
- [フロントエンドの動作確認](/docs/ja/DOCS_04_FRONTEND.md)
- [フロントエンドのデプロイ (オプショナル)](/docs/ja/DOCS_05_DEPLOY_FRONTEND.md)

## トラブルシューティング

よくあるエラー集をまとめたドキュメント (英語) が[こちら](/docs/en/DOCS_06_TROUBLESHOOTING_CDK.md) です。
