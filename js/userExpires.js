const Web3 = require("web3");

const API_URL = process.env.API_URL || "http://127.0.0.1:9545";
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || "0x2f6d487de1705340ef0b05ba416c9c7c89408549";
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "e3C06523BFD8B41CC26BA2ED16A81c600473f900";
const CONTRACT_PATH =
  process.env.CONTRACT_PATH || "../build/contracts/lendableSBT.json";
const contractJson = require(CONTRACT_PATH);

const web3 = new Web3(API_URL);
const nftContract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
  from: WALLET_ADDRESS,
});

async function userExpires() {
  // 指定したアドレスが保有している NFT の数を取得
  const balance = await nftContract.methods.balanceOf(WALLET_ADDRESS).call();//これでテストする。
  console.log(balance);
}

userExpires();