import { getContext, finalizeJob } from "./lib/context";

interface JobParams {
  jobId: string;
  username: string;
  assetMetadataUrl: string;
  royalty: number;
}

interface EventLog {
  name: string;
  type: string;
  value: string;
}

const getTokenIdByEventsLog = (events: EventLog[]): number | null => {
  for (const event of events) {
    if (event.name && event.name === "tokenId") {
      return Number(event.value);
    }
  }

  return null;
};

exports.handler = async (paramsJob: JobParams): Promise<void> => {
  try {
    const context = await getContext(paramsJob.username);
    const contract = context.contract;
    const account = context.account;
    const contractAddress = context.contractAddress;
    const web3 = context.web3;
    const SimpleERC721 = context.SimpleERC721;

    const tx = contract.methods.newItem(
      paramsJob.assetMetadataUrl,
      paramsJob.royalty
    );
    const gas = await tx.estimateGas({ from: account.address });
    const signedTx = await account.signTransaction({
      to: contractAddress,
      data: tx.encodeABI(),
      gas,
    });

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    const txHash = receipt.transactionHash;
    const abiDecoder = require("abi-decoder");
    abiDecoder.addABI(SimpleERC721.abi);
    const tokenId = getTokenIdByEventsLog(
      abiDecoder.decodeLogs(receipt.logs)[0].events
    );
    const tokenUri = await contract.methods.tokenURI(tokenId).call();
    const result = JSON.stringify({ txHash, tokenId, tokenUri });

    await finalizeJob(paramsJob.jobId, "SUCCESS", result);
  } catch (e) {
    console.error(e);
    console.log("log: " + e);
    await finalizeJob(paramsJob.jobId, "ERROR", JSON.stringify(e));
  }
};
