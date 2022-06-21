const { getClient, queryNoParams } = require("./chainUtils");
const axios = require("axios");

const getOsmosisDailyData = async () => {
  const url = "https://api-osmosis.imperator.co/tokens/v2/".concat(
    process.env.TOKEN_SYMBOL
  );
  try {
    const response = await axios.get(url);
    const resopnseObj = response.data;

    const osmosisData = {
      priceUsd: resopnseObj[0].price,
      dailyVolume: parseInt(resopnseObj[0].volume_24h, 10),
    };

    return osmosisData;
  } catch (e) {
    console.log("Failed to fetch the token data from osmosis:", e);
    return {};
  }
};

const getInflationScheduleByBlockHeight = (inflationSchedule, blockHeight) => {
  let i;
  for (i = 0; i < inflationSchedule.length; i++) {
    if (inflationSchedule[i].end_block > blockHeight) break;
  }
  return inflationSchedule[i];
};

async function getRewarPerYear(secretNetwork) {
  const latestBlock = await secretNetwork.query.tendermint.getLatestBlock();
  const latestBlockHeight = latestBlock.block.header.height;

  // query inflation_schedule from the staking contract:
  const inflationSchedule = await queryNoParams(
    secretNetwork,
    process.env.STAKING_ADDRESS,
    "inflation_schedule"
  );

  const currInflationSchedule = getInflationScheduleByBlockHeight(
    inflationSchedule.inflation_schedule.inflation_schedule,
    latestBlockHeight
  );
  const rewardPerBlock = parseInt(currInflationSchedule.reward_per_block);
  const endBlock = currInflationSchedule.end_block;

  const secondsPerBlock = parseInt(process.env.SECONDS_PER_BLOCK); //TODO: fetch from MongoDB
  const secondsInYear = 31536000;
  const blocksPerYear = secondsInYear / secondsPerBlock;
  const rewardPerYear = (blocksPerYear / endBlock) * rewardPerBlock;
  return rewardPerYear;
}

const getUpdatedTokenInfoValues = async () => {
  // Get from Osmosis the token's current price and daily volume
  const dailyData = await getOsmosisDailyData();

  if (Object.keys(dailyData).length === 0) {
    // Fetching the data from osmosis failed; MongoDB should not get updated
    return {};
  }

  const secretNetwork = await getClient();

  // query the blockchain to get current block height:
  const rewardPerYear = await getRewarPerYear(secretNetwork);

  const totalLockedResponse = await queryNoParams(
    secretNetwork,
    process.env.STAKING_ADDRESS,
    "total_locked"
  );
  const totalLocked = parseInt(totalLockedResponse.total_locked.amount);

  const apr = totalLocked ? (rewardPerYear * 100) / totalLocked : 0;
  // : (rewardPerYear * 100) / 20000000;

  const n = parseInt(process.env.NUM_OF_COMPOUNDING_PERIODS);
  const apy = Math.pow(1 + apr / n, n) - 1;

  const totalBalances = await queryNoParams(
    secretNetwork,
    process.env.PLATFORM_ADDRESS,
    "total_balances"
  );

  const liquidity =
    totalLocked +
    parseInt(totalBalances.total_balances.staked) +
    parseInt(totalBalances.total_balances.unbonding);

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
