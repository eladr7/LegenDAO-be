const { getClient, queryNoParams } = require("./chainUtils");
const XMLHttpRequest = require("xhr2");

const request = (method, url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = resolve;
    xhr.onerror = reject;
    xhr.send();
  });
};

const getOsmosisDailyData = () => {
  console.log(
    "The request is: ",
    `https://api-osmosis.imperator.co/tokens/v2/${process.env.TOKEN_SYMBOL}`
  );
  return request(
    "GET",
    `https://api-osmosis.imperator.co/tokens/v2/${process.env.TOKEN_SYMBOL}`
  )
    .then((response) => {
      //   const x1 = JSON.parse(response.target.responseText);
      console.log("THE RESPONSE OBJECT IS: ,", response.target.responseText);
      const resopnseObj = JSON.parse(response.target.responseText);
      console.log("OSMO RESPONSE: ", resopnseObj);
      const osmosisData = {
        priceUsd: resopnseObj[0].price,
        dailyVolume: resopnseObj[0].volume_24h,
      };

      return osmosisData;
    })
    .catch((err) => {
      console.log("Failed to fetch the token data from osmosis:", err);
      return {};
    });
};

const getInflationScheduleByBlockHeight = (inflationSchedule, blockHeight) => {
  let i;
  for (i = 0; i < inflationSchedule.length; i++) {
    if (inflationSchedule[i].end_block > blockHeight) break;
  }
  return inflationSchedule[i];
};

async function getRewarPerYear() {
  const latestBlock = await secretNetwork.query.tendermint.getLatestBlock();
  const latestBlockHeight = latestBlock.block.header.height;

  // query inflation_schedule from the staking contract:
  const inflationSchedule = await queryNoParams(
    secretNetwork,
    process.env.STAKING_ADDRESS,
    "inflation_schedule"
  );

  const currInflationSchedule = getInflationScheduleByBlockHeight(
    inflationSchedule,
    latestBlockHeight
  );
  const rewardPerBlock = currInflationSchedule[i].reward_per_block;
  const endBlock = currInflationSchedule[i].reward_per_block;

  const secondsPerBlock = parseInt(process.env.SECONDS_PER_BLOCK); //TODO: fetch from MongoDB
  const secondsInYear = 31536000;
  const blocksPerYear = secondsInYear / secondsPerBlock;
  const rewardPerYear = (blocksPerYear / endBlock) * rewardPerBlock;
  return rewardPerYear;
}

const getUpdatedTokenInfoValues = async () => {
  // Get from Osmosis the token's current price and daily volume
  const dailyData = getOsmosisDailyData();
  return {};
  if (Object.keys(dailyData).length === 0) {
    // Fetching the data from osmosis failed; MongoDB should not get updated
    return {};
  }

  const secretNetwork = await getClient();

  // query the blockchain to get current block height:
  const rewardPerYear = await getRewarPerYear();

  const totalLocked = await queryNoParams(
    secretNetwork,
    process.env.STAKING_ADDRESS,
    "total_locked"
  );
  const apr = (rewardPerYear / totalLocked) * 100;

  const n = parseInt(process.env.NUM_OF_COMPOUNDING_PERIODS);
  const apy = Math.pow(1 + apr / n, n) - 1;

  const totalBalances = await queryNoParams(
    secretNetwork,
    process.env.PLATFORM_ADDRESS,
    "total_balances"
  );

  const liquidity = totalLocked + totalBalances;

  const updatedValuesObj = {
    apr: apr,
    apy: apy,
    liquidity: liquidity,
    priceUsd: dailyData.priceUsd,
    totalLocked: totalLocked,
    dailyVolume: dailyData.dailyVolume,
  };
  return updatedValuesObj;
};
module.exports = getUpdatedTokenInfoValues;
