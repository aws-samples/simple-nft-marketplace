import { getContext, finalizeJob } from './lib/context';

interface JobParams {
  jobId: string;
  username: string;
  tokenId: number;
}

exports.handler = async (paramsJob: JobParams): Promise<void> => {
  try {
    const context = await getContext(paramsJob.username);
    const contractAddress = context.contractAddress;
    const contract = context.contract;
    const account = context.account;
    const web3 = context.web3;

    const marketplace = await contract.methods.marketplace(paramsJob.tokenId).call();
    const tx = contract.methods.purchase(paramsJob.tokenId);
    const gas = await tx.estimateGas({ from: account.address, value: marketplace.price });
    const signedTx = await account.signTransaction({
      to: contractAddress,
      data: tx.encodeABI(),
      value: marketplace.price,
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
