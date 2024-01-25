const Web3 = require("web3");

const API_URL = process.env.API_URL || "http://127.0.0.1:9545";
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || "0x2f6d487de1705340ef0b05ba416c9c7c89408549";//Accounts(0)の値
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0xA8495afD7c00f5aC9c80c105d5E04D5F0e03d215";//Account Adress
const CONTRACT_PATH =
  process.env.CONTRACT_PATH || "../build/contracts/LendableSBT.json";
const contractJson = require(CONTRACT_PATH);

const web3 = new Web3(API_URL);
const nftContract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
  from: WALLET_ADDRESS,
});
async function isRentedCheck() {
  // 特定のNFTの「user」のアドレスを取得する関数。
  // tokenId` user情報を取得するNFTのトークンID。
  // 戻り値 NFTの「user」のアドレスを示します。0アドレスの場合、「使用する」アドレスが存在しないことを示す。
  let renter = process[2];
  let  tokenId = process.argv[3];
tokenId = Number(tokenId);
let isTokenExpired= await nftContract.methods.isRentedCheck(renter,tokenId).call();
console.log(isTokenExpired);
}
isRentedCheck();