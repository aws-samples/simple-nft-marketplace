# フロントエンドのデプロイ (オプショナル)

フロントエンドを CDK でデプロイします。この手順は必須ではありません。CDK の設定と権限の設定は [API のデプロイ](/docs/ja/DOCS_03_DEPLOY_API.md)で完了していると仮定します。**以下の手順は `/marketplace` ディレクトリと `/provision` ディレクトリで実施します。**

## フロントエンドのビルド

フロントエンドをビルドします。以下のコマンドを `/marketplace` ディレクトリで実行してください。

```bash
npm run build
```

`dist` ディレクトリが生成されれば成功です。

## フロントエンドのデプロイ

CDK を利用して `/marketplace/dist` を S3 にデプロイします。また、デプロイした Content を CloudFront 経由でインターネットからアクセス可能にします。`/provision` ディレクトリに移動して、以下のコマンドを実行してください。デプロイ先の Region を環境変数で指定します。

```bash
export AWS_DEFAULT_REGION=<region>
```

`<region>` は `ap-northeast-1` や `us-east-1` など適切な Region に置き換えてください。

続いて、`/provision` ディレクトリで以下のコマンドを実行します。

```bash
cdk deploy SimpleNftMarketplaceFrontendStack
```

以上でデプロイは完了です。デプロイ完了時に表示される CloudFront のエンドポイントにアクセスしてページが正常に表示されれば成功です。
