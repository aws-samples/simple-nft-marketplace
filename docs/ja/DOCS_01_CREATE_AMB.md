## Ethereum Testnet Ropsten のノードの作成 (Amazon Managed Blockchain)

**最初に**

こちらのリポジトリを clone してください。

## Amazon Managed Blockchain のノードを作成

> 注意: 作成には 30 分程度かかります

以下で作成する Ropsten というネットワークは **Ethereum のテストネット** として知られているネットワークです。メインネットでの開発前に、テスト環境として利用します。

[Amazon Managed Blockchain](https://console.aws.amazon.com/managedblockchain/home#joinNetwork) にて、Ethereum のノードを作成します。ブロックチェーンネットワークに **Ethereum Testnet: Ropsten** を選択し、後はデフォルトで作成してください。ノードのステータスが利用可能になるまでお待ち下さい。作成が完了したら、ノード ID をクリックしてノードの詳細ページを開きます。この後の手順で HTTP エンドポイントが必要になりますので、どこかに転記しておいてください。

以上で Ethereum Testnet Ropsten のノードの作成は完了です。

## 次の手順

**後続の手順で必要になるもの**
- Amazon Managed Blockchain の HTTP エンドポイント

-> [Contract のデプロイ](/docs/ja/DOCS_02_DEPLOY_CONTRACT.md)
