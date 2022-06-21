const { Wallet, SecretNetworkClient } = require("secretjs");

const createCli = async (mnemonic, rest_endpoint, chain_id) => {
  let url = new URL(rest_endpoint);
  url.port = "9091";
  rest_endpoint = url.toString();

  const wallet = new Wallet(mnemonic);
  const accAddress = wallet.address;

  return await SecretNetworkClient.create({
    grpcWebUrl: rest_endpoint,
    chainId: chain_id,
    wallet: wallet,
    walletAddress: accAddress,
  });
};

const getClient = async () => {
  return await createCli(
    process.env.QUERYING_ACCOUNT_MNEMONIC,
    process.env.NODE_ENDPOINT,
    process.env.CHAIN_ID
  );
};

async function queryNoParams(secretNetwork, contractAddress, queryName) {
  try {
    return await secretNetwork.query.compute.queryContract({
      contractAddress: contractAddress,
      query: {
        [queryName]: {},
      },
    });
  } catch (e) {
    console.log(`query ${queryName} failed: ${e}`);
  }
  return null;
}

module.exports = {
  getClient: getClient,
  queryNoParams: queryNoParams,
};
