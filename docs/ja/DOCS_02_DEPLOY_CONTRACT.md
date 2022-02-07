# Contract のデプロイ

[Solidity](https://docs.soliditylang.org/) で書かれた Contract を Ethereum Ropsten にデプロイします。Solidity は Smart Contract を書くために利用するオブジェクト指向言語です。

また、[hardhat](https://hardhat.org/) というツールも利用します。hardhat は Node.js で動作する Ethereum の開発環境で、Solidity で書かれた Contract をローカルで実行することができます。

> 以下の手順では、hardhat のインストールを行い、Contract をコンパイルして、Ethereum Ropsten にデプロイします。

**以下の手順は全て `/contract` ディレクトリで実施します。**

## Contract の紹介

今回は `SimpleERC721` という名前の Contract をデプロイします。`SimpleERC721` は、その名の通り、ERC721 という NFT トークンを発行可能なインターフェースに準拠しています。なお、実装は [openzeppelin の ERC721](https://docs.openzeppelin.com/contracts/3.x/erc721) を継承していますが、一部独自の実装もあります。実装内容は [こちら](/contract/contracts/SimpleERC721.sol)。

## Contract のコンパイル

まずは、必要なモジュールをインストールします。

```bash
npm install
```

続いて、hardhat を利用して Contract をコンパイルします。

```bash
npx hardhat compile
```

`artifacts` と `cache` というディレクトリが作成されたら完了です。

## テスト

> この手順はスキップ可能です。スキップした場合は [Amazon Managed Blockchain 経由で Ethereum Ropsten にデプロイ](#) に進んでください。

以下のコマンドを実行すると、`/contract/test` 以下に定義されたテストを実行します。

```bash
npx hardhat test
```

## ローカルで動作検証 (オプショナル)

> この手順はスキップ可能です。スキップした場合は [Amazon Managed Blockchain 経由で Ethereum Ropsten にデプロイ](#) に進んでください。

以下の手順では 2 つのターミナルセッションを利用します。コンソールの実行をターミナルA、JSON-RPC サーバーの立ち上げをターミナルB で行うとして説明します。どちらのターミナルセッションでも、コマンドの実行は `/contract` ディレクトリで行います。

まずは、ターミナルA で以下のコマンドを実行して、ローカルの JSON-RPC サーバーを立ち上げます。

```bash
npx hardhat node
```

続いて、ターミナルB で以下のコマンドを実行して、コンパイルした SimpleERC721 をローカル環境にデプロイします。

```bash
npx hardhat run --network localhost scripts/deploy.js
```

成功すると、以下のようなメッセージが出力されます。`0x...` は Contract がデプロイされたアドレスです。後続の手順で必要になります。

```
Contract deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

では、`hardhat console` を利用して、`SimpleERC721` に NFT トークンを発行します。以下のコマンドを ターミナルB で実行してください。

```bash
npx hardhat console --network localhost
```

インタラクティブにコードが記述できるコンソールが開くので、次のコードを一行ずつ実行してください。なお、`<contract address>` はデプロイした Contract のアドレスに置き換えてください。

```js
const SimpleERC721 = await ethers.getContractFactory('SimpleERC721');
const contract = await SimpleERC721.attach('<contract address>');
await contract.newItem('dummy');
```

これで新しい NFT トークンを発行しました。なお、本来は `dummy` の部分は URI 形式である必要がありますが、今回は検証のため、単に文字列としています。

内部で tokenId というユニークな値を管理しています。tokenId は NFT が発行されるたびにインクリメントされ、NFT の URI と 1 対 1 で紐付いています。どの tokenId が割り当てられたかは Transaction ログから読み取ることができるのですが、最初は 1 です。そのため、ここでは tokenId=1 の NFT を取得してみます。

```js
await contract.tokenURI(1);
```

'dummy' という文字列が表示されれば成功です。Ctrl+C を 2 回押すとコンソールを閉じることができます。ターミナルA も停止し、セッションを閉じても問題ありません。

## Amazon Managed Blockchain 経由で Ethereum Ropsten にデプロイ

ではコンパイルした Solidity の Contract を Ethereum Ropsten にデプロイしていきます。まずは、デプロイスクリプト内で読み取る環境変数に適切な値を設定してきます。

最初に、Amazon Managed Blockchain の HTTP エンドポイントを環境変数に設定します。この HTTP エンドポイントは [Ethereum Testnet Ropsten のノード作成 (Amazon Managed Blockchain)](/docs/ja/DOCS_01_CREATE_AMB.md) にて確認したものになります。以下のコマンドを、`<node id>` と `<region>` を適切な値に書き換えた上で実行してください。

```bash
export AMB_HTTP_ENDPOINT=https://<node id>.ethereum.managedblockchain.<region>.amazonaws.com
```

続いて、Contract をデプロイする Owner のアカウントを作成します。以下のコマンドを実行してください。

```bash
npx hardhat account
```

出力の `Address` はトークンの送付に必要になるアドレスで、`PrivateKey` は Transaction の署名に必要な秘密鍵です。`Address` は `PrivateKey` から生成されるので、1 対 1 の関係です。この `Address` と `PrivateKey` は後続の手順で必要になるので、必ずどこかに転記しておいてください。

Contract をデプロイするにあたって、[ガスという名のコストを Ethereum で支払う必要があります。](https://ethereum.org/en/developers/docs/gas/) そのため、上で作成した `Address` に Ethereum をデポジットする必要があります。オンラインで、Ropsten ネットワーク上のみで利用可能な Ethereum を配布しているサービスがいくつか存在します。`Ropsten Ethereum Faucet` などで検索して、`Address` に Ethereum をデポジットしてください。例えば[こちらのサービス](faucet.dimensions.network)が利用可能です。

デポジットが完了したら、以下のコマンドを実行してコントラクトをデプロイするアカウントを設定します。`<0x...>` のところは、上の手順の `PrivateKey` の内容に置き換えてください。

```bash
export PRIVATE_KEY=<0x...>
```

続いて、Amazon Managed Blockchain に接続するための AWS IAM の権限設定を行います。新規で IAM ユーザーを作成する場合は、`AmazonManagedBLockchainFullAccess` ポリシーをアタッチしてください。AWS Access Key ID と AWS Secret Access Key を以下のように環境変数に設定します。`<...>` は、それぞれ適切な値に置き換えが必要です。

```
export AWS_ACCESS_KEY_ID=<...>
export AWS_SECRET_ACCESS_KEY=<...>
```

最後に、以下のコマンドを実行して `SimpleERC721` を Amazon Managed Blockchain 経由で Ethereum Ropsten にデプロイします。

```bash
npx hardhat run --network amb scripts/deploy-amb.js
```

デプロイ完了時に Contract のアドレスが表示されます。後続の手順で必要になりますので、必ずどこかに転記しておいてください。以上でデプロイは完了です。なお、Contract をデプロイをしたアカウントの `Address` と `PrivateKey` は、Contract に対して Owner 権限を持つことも可能で、本来はとても重要なアカウントなのですが、今回のプロジェクトでは今後の手順では使用しません。

## 次の手順

**後続の手順で必要になるもの**
- Contract のアドレス (Ethereum Ropsten にデプロイしたものです、**ローカル JSON-RPC サーバーにデプロイしたものではないことにお気をつけください。**)

-> [API のデプロイ](/docs/ja/DOCS_03_DEPLOY_API.md)
