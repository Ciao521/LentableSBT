const Web3 = require("web3");

const API_URL = process.env.API_URL || "http://127.0.0.1:9545";
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || "2f6d487de1705340ef0b05ba416c9c7c89408549";
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "e3C06523BFD8B41CC26BA2ED16A81c600473f900";
const CONTRACT_PATH =
  process.env.CONTRACT_PATH || "../build/contracts/lendableSBT.json";
const contractJson = require(CONTRACT_PATH);

const web3 = new Web3(API_URL);
const nftContract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
  from: WALLET_ADDRESS,
});

async function getRenters(tokenId) {
  console.log(await getRenters(1));
    return await contract.methods.getRenters(tokenId).call();
}  

async function getPastRenters(tokenId) {
    return await contract.methods.getPastRenters(tokenId).call();
}

async function userOf(tokenId) {
  return await contract.methods.userOf(tokenId).call();
}

async function userExpires(tokenId) {
  return await contract.methods.userExpires(tokenId).call();
}

// テスト例 */*/
// (async () => {
//       await setUser(1, '0x2f6d487de1705340ef0b05ba416c9c7c89408549', 111111);  // NFTの使用者とその期限を設定する
//       console.log(await userOf(1));  // 特定のNFTの「user」のアドレスを取得する
//       console.log(await userExpires(1));  // 特定のNFTの「user」の使用期限を取得する
//       await toggleRentability(1);  // トークンのレンタル可能性を切り替える
//       console.log(await getRenters(1));  // トークンをレンタルしている人たちを取得する
//       console.log(await getPastRenters(1));  // 過去の借手を取得する
//     })();
