const Web3 = require("web3");
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "681dc3f4126d2e935a99b101deae80b8ade75fe06f6647f304ab4cd5026ad5b0";

const API_URL = process.env.API_URL || "http://127.0.0.1:9545";
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || "0x2f6d487de1705340ef0b05ba416c9c7c89408549";//Accounts(0)の値
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x21F1Ae4E79591AF11E8e66049bEcc5cbFd6e77a5";//Account Adress
const CONTRACT_PATH =
  process.env.CONTRACT_PATH || "../build/contracts/LendableSBT.json";
const contractJson = require(CONTRACT_PATH);

const web3 = new Web3(API_URL);
const nftContract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
  from: WALLET_ADDRESS,
});
  
async function getRentalData() {
    // 特定のNFTの「user」のアドレスを取得する関数。
    // tokenId` user情報を取得するNFTのトークンID。
    // 戻り値 NFTの「user」のアドレスを示します。0アドレスの場合、「使用する」アドレスが存在しないことを示す。
  let renter = process.argv[2];
  let tokenId = process.argv[3];
  tokenId = Number(tokenId);
  let userinfo = await nftContract.methods.getRentalData(renter,tokenId).call();
  console.log(userinfo);
}

getRentalData();