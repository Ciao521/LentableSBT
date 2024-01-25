const Web3 = require("web3");

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "b1b62410ca504caeb055893c2e409d313a58cbfdf4f177837f349dec2ee6e22e";
const API_URL = process.env.API_URL || "http://127.0.0.1:9545";
const WALLET_ADDRESS =
  process.env.WALLET_ADDRESS || "0x8b707a3283db61fab6b1c4922b5574befd23a654";//Accounts(0)の値
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0xC98031d7f50b9d2291E9adf305c00652CB2c874a";//Account Adress
const CONTRACT_PATH =
  process.env.CONTRACT_PATH || "../build/contracts/LendableSBT.json";
const contractJson = require(CONTRACT_PATH);

const web3 = new Web3(API_URL);
const nftContract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
    from: WALLET_ADDRESS,
  });
// REST API でデータと署名を受け取りそのデータを元にアクセス制御を行う
// 保持していると主張する NFT の tokenId は 1 とする
const data = JSON.stringify({
  token : 1
  });
  // data に対して署名を行う
  const signature = web3.eth.accounts.sign(data, PRIVATE_KEY).signature;
  // data と signature を組み合わせてリクエストボディを作成
  const requestBody = {
    data: data,
    signature: signature,
  };
async function accessControll(requestBody) {
    // リクエストボディから data と signature を取得し、アドレスを復元する
    const recoveredAddress = await web3.eth.accounts.recover(
      requestBody.data,
      requestBody.signature
    );
    console.log(recoveredAddress);  
    let renter = process.argv[2];
    let tokenId = process.argv[3];
    
    // リクエストボディから tokenId を取得し、その tokenId の NFT を保有しているアドレスを取得する
        const owner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(owner);
    let isTokenExpired = await nftContract.methods.isTokenExpiredCheck(renter,tokenId).call();
    let isRented = await nftContract.methods.isTokenExpiredCheck(renter,tokenId).call();

    // アドレスが一致していればアクセスを許可する
    if (recoveredAddress === owner) {
      console.log("Access granted");
    }else if(isTokenExpired == true && isRented ==true){
            console.log("Access granted");
        }    
    else{
        console.log("Access denied");
    }
  }
  accessControll(requestBody);