import { getContext, finalizeJob } from './lib/context';

interface JobParams {
  jobId: string;
  username: string;
  tokenId: number;
}

exports.handler = async (paramsJob: JobParams): Promise<void> => {
  try {
    const context = await getContext(paramsJob.username);
    const contract = context.contract;
    const account = context.account;
    const contractAddress = context.contractAddress;
    const web3 = context.web3;

    const tx = contract.methods.removeFromMarketplace(paramsJob.tokenId);
    const gas = await tx.estimateGas({ from: account.address });
    const signedTx = await account.signTransaction({
      to: contractAddress,
      data: tx.encodeABI(),
      gas,
    });

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const txHash = receipt.transactionHash;

    await finalizeJob(paramsJob.jobId, 'SUCCESS', JSON.stringify({ txHash }));
  } catch (e) {
    console.error(e);
    await finalizeJob(paramsJob.jobId, 'ERROR', JSON.stringify(e));
  }
};
