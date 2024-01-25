import React, { useState ,useRef} from 'react';
import Web3 from 'web3';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './App.css';
const contractJson = require("./LendableSBT.json");
const web3 = new Web3("http://127.0.0.1:9545");
const CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS || "0x4c62573AB847717909940eB85ADd8c8238aA31A9";//YOU HAVE TO CHECK

function App() {
    // States
    // address
    const [owner, setOwner] = useState("0x1f181f82db4370edd25f5beb00d9c69585e771b9");//owner
    const [renter, setRenter] = useState("0xf8668a15fdf9e07d6a4ac48f654bbda728517fe2");//renter
    const [outsider, setoutsider] = useState("0x72cb87f67e1b5685a2e81051047c9ec814773c30");//outsider
    const [access, setaccess] = useState("");//access
    //privatekey
    const [privateKey, setPrivateKey] = useState("51000e5aa7faa2576d155255490507bcfa53545edf18b84fa6e0bf9f6b0a7f19");//owner
    const [privateKey2, setPrivateKey2] = useState("26a9bafabd11c7e13b319313596bcc7f58b71cc52e9055a61975fe96a3710678");//renter
    const [privateKey3, setPrivateKey3] = useState("4ddd9ad786ad47f7507e0a59073ed830b6e49a0b4963567e9cbf31b1854a03c0");//outsider
    const [privateKey4, setPrivateKey4] = useState("");//access
    const [output, setOutput] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [_tokenId, _setTokenId] = useState("");
    const [__tokenId, __setTokenId] = useState("");
    const [expire, setExpire] = useState("");
    const [rewardAmount, setRewardAmount] = useState("");
    const textAreaRef = useRef(null);
    const [value, setvalue] = useState("");
    const [step1Result, setStep1Result] = useState('');
    const [step2Result, setStep2Result] = useState('');
    const [step3Result, setStep3Result] = useState('');
    const [step4Result, setStep4Result] = useState('');
    const [step5Result, setStep5Result] = useState('');
    const [step6Result, setStep6Result] = useState('');
    const [step7Result, setStep7Result] = useState('');
    const [step8Result, setStep8Result] = useState('');

    //const [settokenURI, setTokenURIResult] = useState("");

    const contract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
        from: owner,
      });
    const contract2 = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
        from: renter,
      });
    const contract4 = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS, {
        from: access,
      });

      const mintToken = async () => {
        try {
            let currentTokenId = await contract.methods.mint(owner).call();
            let nonce = await web3.eth.getTransactionCount(owner, 'latest');
            const data = contract.methods.mint(owner).encodeABI();
            let gas = await contract.methods.mint(owner).estimateGas();
            const gasPrice = await web3.eth.getGasPrice();
            gas = Number(gas);
            const tx = await web3.eth.accounts.signTransaction({
                nonce: "0x" + nonce.toString(16),
                to: CONTRACT_ADDRESS,
                data,
                gas: Math.floor(gas * 1.1),
                gasPrice,
            }, privateKey);

            let receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);
            setStep1Result(`発行したToken Idは、${currentTokenId}.`);
        } catch (error) {
            setStep1Result('failure');
            // エラーメッセージを表示するための追加コード
            console.error(error);
        }
    };

    const rent = async (_tokenId) => {
        let nonce = await web3.eth.getTransactionCount(renter, 'latest');
        const data = contract2.methods.rent(_tokenId).encodeABI(); 
        let _gas = await contract2.methods.rent(_tokenId).estimateGas();
        const gasPrice = await web3.eth.getGasPrice();
        console.log(_gas);
        _gas = Number(_gas);
        console.log(_gas);
        const tx = await web3.eth.accounts.signTransaction({
            nonce: "0x" + nonce.toString(16),
            to: CONTRACT_ADDRESS,
            data,
            gas: Math.floor(_gas * 1.1),
            gasPrice,
            value: Number(value),
        }, privateKey2);
        await web3.eth.sendSignedTransaction(tx.rawTransaction);
        setStep5Result(`Token Idは、${_tokenId}を、借りました。`);
    }
    const setRentalData = async () => {
        try{
        let nonce = await web3.eth.getTransactionCount(owner, 'latest');
        let _tokenId = Number(tokenId);
        let _expire = new Date(expire).getTime() / 1000;
        let _rewardAmount = Number(rewardAmount);
    
        const data = contract.methods.setRentalData(renter, _tokenId, _expire, _rewardAmount).encodeABI();
        let _gas = await contract.methods.setRentalData(renter, _tokenId, _expire, _rewardAmount).estimateGas();
        const gasPrice = await web3.eth.getGasPrice();
        _gas = Number(_gas);
    
        const tx = await web3.eth.accounts.signTransaction({
            nonce: "0x" + nonce.toString(16),
            to: CONTRACT_ADDRESS,
            data,
            gas: Math.floor(_gas * 1.1),
            gasPrice,
        }, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);
        setStep2Result('完了');
    }catch(error) {
        setStep2Result(`エラー: ${error.message}`);
        console.error(error);
        }
    };
    
    const tokenURI = async (tokenId) => {
        const uri = await contract.methods.tokenURI(tokenId).call();
        setStep8Result(`Token URI: ${uri}`);
    };
        
    const getRentalData = async (renter, tokenId) => {
            try{tokenId = Number(tokenId);
            let rentalData = await contract.methods.getRentalData(renter, tokenId).call();
            var day = new Date(expire);
            setStep3Result(`有効期限: ${day}. レンタル状況: ${rentalData.isRented}. 値段: ${rentalData.rewardAmount}ETH`);}
            catch(error){ 
            console.error(error);
            setStep3Result(`エラー: ${error.message}`);}
        };
        
    const isTokenExpiredCheck = async (renter, tokenId) => {
        try{
            tokenId = Number(tokenId);
            let check_expireday = await contract.methods.isTokenExpiredCheck(renter, tokenId).call();
            let check_isRented = await contract.methods.isRentedCheck(renter, tokenId).call();
            if (check_expireday === true && check_isRented === false)
                setStep4Result(`○レンタル可能です。`);
            else
                setStep4Result(`×レンタルできません。`);
        }catch(error){
            console.error(error);
            setStep4Result(`エラー: ${error.message}`);}
        };
        
    const isRentedCheck = async (renter,_tokenId) => {
            _tokenId = Number(_tokenId);
            let check_isRented = await contract.methods.isRentedCheck(renter,_tokenId).call();
           
            if (check_isRented == true){
                setStep6Result(`レンタル済みです。`);
            }else
                setStep6Result(`まだ、レンタルしていません。`);
        }; 
        
    const accessControll = async (__tokenId) => {
        const data = JSON.stringify({ token: __tokenId });
        const signed = web3.eth.accounts.sign(data,privateKey4);
        const signature = signed.signature;
            console.log(privateKey4);
            const requestBody = {
                data: data,
                signature: signature,
            };
        
            const recoveredAddress = web3.eth.accounts.recover(
                requestBody.data,
                requestBody.signature
            );
        
            const owner = await contract.methods.ownerOf(__tokenId).call();
            console.log(owner);
            let check_expireday = await contract4.methods.isTokenExpiredCheck(recoveredAddress, __tokenId).call();
            let check_isRented = await contract4.methods.isRentedCheck(recoveredAddress,__tokenId).call();
            console.log(recoveredAddress);
            console.log(check_expireday,check_isRented);
            if (recoveredAddress === owner) {
                setOutput("Access granted");
            } else if(check_expireday == true && check_isRented == true){
                setOutput("Access granted");
            } else {
                setOutput("Access denied");
            }
        };

        const handleCopyText = (text) => {
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            });
        };
        
        
    return (
     <div>
        <div className="table-section">
            <h4>Accounts:</h4>
            <ul>
                {['0x1f181f82db4370edd25f5beb00d9c69585e771b9','0xf8668a15fdf9e07d6a4ac48f654bbda728517fe2','0x72cb87f67e1b5685a2e81051047c9ec814773c30','0x774416f18d777c4f25aa775d8ecdbe3f99880278'].map((address, index) => (
                    <li key={index}>
                        ({index}) {address} <button onClick={() => handleCopyText(address)}>Copy</button>
                    </li>
                ))}
            </ul>

            <h4>Private Keys:</h4>
            <ul>
                {['51000e5aa7faa2576d155255490507bcfa53545edf18b84fa6e0bf9f6b0a7f19','26a9bafabd11c7e13b319313596bcc7f58b71cc52e9055a61975fe96a3710678','4ddd9ad786ad47f7507e0a59073ed830b6e49a0b4963567e9cbf31b1854a03c0','c7223bf42b2ae721f8822cc1246280e645d83d00eab787628b175a1cb8ec0282'].map((key, index) => (
                    <li key={index}>
                        ({index}) {key} <button onClick={() => handleCopyText(key)}>Copy</button>
                    </li>
                ))}
            </ul>
        </div>
        {/* Owner and Minting Section */}
        <div className="step0-section">
            <p className="step0-title"><b>ステップ0.アドレスと秘密鍵の設定</b></p>
            <div className="address-group">
                <p>データ管理者</p>
                <input type="text" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Owner address" />
                <input type="text" value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder="Owner's Private Key" />
            </div>
            <div className="address-group">
                <p>保険会社</p>
                <input type="text" value={renter} onChange={e => setRenter(e.target.value)} placeholder="Renter address" />
                <input type="text" value={privateKey2} onChange={e => setPrivateKey2(e.target.value)} placeholder="Renter's Private Key" />
            </div>
            <div className="address-group">
                <p>部外者</p>
                <input type="text" value={outsider} onChange={e => setoutsider(e.target.value)} placeholder="Outsider address" />
                <input type="text" value={privateKey3} onChange={e => setPrivateKey3(e.target.value)} placeholder="Outsider's Private Key" />
            </div>
        </div>

            <div>
                {/* ステップ1: NFTの発行 */}
                <p><b>ステップ1.データ管理者がNFTを新たに発行(mint)</b></p>
               
                <div>
                    <button onClick={mintToken}>Mint Token</button>
                </div>
                    <div className="success-result">
                        <FaCheckCircle className="result-icon" />
                        <div className="result-section">
                            <h3><span>{step1Result}</span></h3>
                        </div>
                    </div>
            </div>
            {/* Rental Data Section */}
            <div>
                <p><b>ステップ2.レンタル情報を設定</b></p>
                <input type="text" value={renter} onChange={e => setRenter(e.target.value)} placeholder="貸出先のアドレス" />
                <input type="text" value={tokenId} onChange={e => setTokenId(e.target.value)} placeholder="貸し出すToken ID" />
                <input type="text" value={expire} onChange={e => setExpire(e.target.value)} placeholder="有効期限 (YYYY-MM-DD)" />
                <input type="text" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} placeholder="値段" />
                <button onClick={setRentalData}>Set Rental Data</button>
            </div>
            <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step2Result && (<span>{step2Result}</span>)}</h3>
                </div>
            </div>

            <div>
                <p><b>ステップ3.レンタル情報の確認</b></p>
                <input type="text" value={renter} onChange={e => setRenter(e.target.value)} placeholder="貸出先のアドレス" />
                <input type="text" value={tokenId} onChange={e => setTokenId(e.target.value)} placeholder="Token ID" />
                <button onClick={() => getRentalData(renter, tokenId)}>Get Rental Data</button>
                <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step3Result && (<span>{step3Result}</span>)}</h3>
                </div>
                </div>
            </div>
            <div>
                <p><b>ステップ4.レンタル可能かどうか</b></p>
                <input type="text" value={renter} onChange={e => setRenter(e.target.value)} placeholder="アドレス" />
                <input type="text" value={_tokenId} onChange={e => _setTokenId(e.target.value)} placeholder="Token ID"/>
                <button onClick={() => isTokenExpiredCheck(renter, _tokenId)}>Check</button>
                <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step4Result && (<span>{step4Result}</span>)}</h3>
                </div>
                </div>
            </div>

            <div>
            <p><b>ステップ5.レンタルする</b></p>
                <input type="text" value={_tokenId} onChange={e => _setTokenId(e.target.value)} placeholder="Token ID " />
                <input type="text" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} placeholder="値段" />
                <button onClick={() => rent(_tokenId)}>Rent</button>
                <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step5Result && (<span>{step5Result}</span>)}</h3>
                </div>
                </div>
            </div>
            <div>
                <p><b>ステップ6.レンタルできたかどうかの確認</b></p>
                <input type="text" value={renter} onChange={e => setRenter(e.target.value)} placeholder="アドレス" />
                <input type="text" value={_tokenId} onChange={e => _setTokenId(e.target.value)} placeholder="Token ID"/>
                <button onClick={() => isRentedCheck(renter, _tokenId)}>Check</button>
                <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step6Result && (<span>{step6Result}</span>)}</h3>
                </div>
                </div>
            </div>
            
            <div>
            <p><b>ステップ7.アクセスコントロール</b></p>
                <input type="text" value={access} onChange={e => setaccess(e.target.value)} placeholder="Your Address" />
                <input type="text" value={privateKey4} onChange={e => setPrivateKey4(e.target.value)} placeholder="Your Private Key"/>
                <input type="text" value={__tokenId} onChange={e => __setTokenId(e.target.value)} placeholder="Token ID" />
                <button onClick={() => accessControll(__tokenId)}>Access</button>
                <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step7Result && (<span>{step7Result}</span>)}</h3>
                </div>
                </div>
            </div>

            <div>
                <p><b>ステップ8.Token_IDのURIを表示</b></p>
                <input type="text" value={__tokenId} onChange={e => __setTokenId(e.target.value)} placeholder="Token ID for URI" />
                <button onClick={() => tokenURI(__tokenId)}>Fetch Token URI</button>
                <div className="success-result">
                <FaCheckCircle className="result-icon" />
                <div className="result-section">
                    <h3>{step8Result && (<span>{step8Result}</span>)}</h3>
                </div>
                </div>
            </div>
        {/* 実行結果のセクションを追加 */}
    </div>
        )   
    };
export default App;
