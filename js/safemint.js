// NFT を発行するスクリプト

const Web3 = require("web3");

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "681dc3f4126d2e935a99b101deae80b8ade75fe06f6647f304ab4cd5026ad5b0";
const API_URL = process.env.API_URL || "http://127.0.0.1:9545";
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || "2f6d487de1705340ef0b05ba416c9c7c89408549";//Accounts(0)の値
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "e3C06523BFD8B41CC26BA2ED16A81c600473f900";//Account Adress
const CONTRACT_PATH =
  process.env.CONTRACT_PATH || "../build/contracts/lendableSBT.json";
const contractJson = require(CONTRACT_PATH);

const web3 = new Web3(API_URL);
const nftContract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
  from: WALLET_ADDRESS,//ここのWALLET_ADDRESSは発行元の管理者を示す
});


async function safeMint() {
  // transaction のデータを作成
  const data = nftContract.methods.safeMint(WALLET_ADDRESS,0).encodeABI(); //mintでNFTを発行する際のWALLET_ADDRESSは発行先

  // transaction に用いるために予想される gas と gasPrice を取得
  const gasP = nftContract.methods.safeMint(WALLET_ADDRESS, 0).estimateGas();
  const gasPriceP = web3.eth.getGasPrice();
  const [gas, gasPrice] = await Promise.all([gasP, gasPriceP]);

  // transaction への署名を行う
  const tx = await web3.eth.accounts.signTransaction(
    {
      to: CONTRACT_ADDRESS,
      data,
      gas,
      gasPrice,
    },
    PRIVATE_KEY
  );

  // 署名済みの transaction を送信
  const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);
  console.log(receipt);
}

safeMint();
