# API のデプロイ

CDK で書かれた API を AWS にデプロイします。**以下の手順は全て `/provision` ディレクトリで実施します。**

## CDK の準備

CDK についての基本的なことは[公式ドキュメント](https://docs.aws.amazon.com/cdk/api/latest/)をご参照ください。CDK を実行するにあたって必要なものは 2 つで、1 つは AWS IAM の権限が設定された実行環境、もう一つは Node.js の実行環境です。

また、初めて CDK を利用する方は bootstrap する必要があります。以下のコマンドを実行しておいてください。

```bash
cdk bootstrap
```

### AWS IAM の実行権限の設定

AWS IAM にてユーザーを作成し、Access Key ID と Secret Access Key を以下のコマンドから設定します。設定には `aws` コマンドを利用します。([aws コマンドのインストール方法](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html))

```bash
aws configure
```

### CDK のインストール

Node.js が実行可能な環境で、以下のコマンドを実行します。

```bash
npm install -g aws-cdk
```

`cdk --version` が正常に実行できれば、インストールは完了です。

## API のデプロイ

最初に、デプロイ先の Region を環境変数で指定します。

```bash
export AWS_DEFAULT_REGION=<region>
```

`<region>` は `ap-northeast-1` や `us-east-1` など適切な Region に置き換えてください。

続いて、必要なモジュールをインストールします。以下のコマンドを実行してください。

```bash
npm install
```

`/lambda` ディレクトリでも同様にモジュールのインストールが必要です。以下のコマンドを実行してください。

```bash
cd lambda; npm install; cd -;
```

続いて、Contract をコンパイルした生成物 (前の手順で作成したもの) を `/lambda/contracts` にコピーします。以下のコマンドを実行してください。

```bash
cp ../contract/artifacts/contracts/SimpleERC721.sol/SimpleERC721.json lambda/contracts/.
```

続いて、CDK プロジェクトをビルドします。(TypeScript で書かれているため。) 以下のコマンドを実行してください。

```bash
npm run build
```

続いて、必要な環境変数を設定します。Amazon Managed Blockchain のエンドポイントとデプロイした Contract でアドレスは環境変数から読み取ります。`AMB_HTTP_ENDPOINT` は [Ethereum Testnet Ropsten のノード作成 (Amazon Managed Blockchain)](/docs/ja/DOCS_01_CREATE_AMB.md) で作成したノードの HTTP エンドポイントで、`CONTRACT_ADDRESS` は [Contract のデプロイ](/docs/ja/DOCS_02_DEPLOY_CONTRACT.md) でデプロイした Contract のアドレスです。以下のコマンドを適切な値に置き換えて実行してください。

```bash
export AMB_HTTP_ENDPOINT=https://<node id>.ethereum.managedblockchain.<region>.amazonaws.com
export CONTRACT_ADDRESS=0x...
```

最後に、デプロイを実施します。以下のコマンドを実行してください。

```bash
cdk deploy SimpleNftMarketplaceStack
```

以上でデプロイは完了です。デプロイ完了時に表示される API Gateway のエンドポイント、Congito の UserPool ID と Client ID の 3 つは後続の手順で必要になるので、転記しておいてください。

## 次の手順

**後続の手順で必要になるもの**
- API Gateway のエンドポイント
- Congito User Pool の ID
- Cognito User Pool Client の ID

-> [フロントエンドの動作確認](/docs/ja/DOCS_04_FRONTEND.md)
