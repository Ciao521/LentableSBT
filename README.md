# NFT のデプロイと NFT によるアクセス制御のデモ

## 前準備

1. スマートコントラクト開発フレームワークである truffle と Openzeppelin が実装している NFT のパッケージをインストールする
   ```
   npm install
   ```
1. truffle を用いてローカルにブロックチェーンを立ち上げる
   ```
   npx truffle develop --log
   ```
   ```
   --log
   ```
   で動きをみることができる。＾Cを使うとその時点で、動作が終了してしまう。
   そのため、ターミナルを別で開いて、以下のコードを実行していく。
## NFT をデプロイする

1. スマートコントラクトのコードである DemoNFT721.sol をコンパイルする
   ```
   npx truffle compile
   ```
1. スマートコントラクトをデプロイする

   ```
   npx truffle migrate

   // 以下出力例
   Compiling your contracts...
   ===========================
   > Everything is up to date, there is nothing to compile.


   Starting migrations...
   ======================
   > Network name:    'development'
   > Network id:      5777
   > Block gas limit: 6721975 (0x6691b7)


   1_nftdemo_migration.js
   ======================

   Deploying 'DemoNFT721'
   ----------------------
   > transaction hash:    0xbbdfacae7f8835a1b9b4ac51125814b7752cfedaef25875f2ce327a5f510c640
   > Blocks: 0            Seconds: 0
   > contract address:    0x776f57E69D4d675b46c7eA9Ce380A8B0cbc5C01B
   > block number:        1
   > block timestamp:     1692336260
   > account:             0xC43f95CEf7Ab327328ca5666A9A7bBEB2bf7583b
   > balance:             99.991100587375
   > gas used:            2636863 (0x283c3f)
   > gas price:           3.375 gwei
   > value sent:          0 ETH
   > total cost:          0.008899412625 ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:      0.008899412625 ETH

   Summary
   =======
   > Total deployments:   1
   > Final cost:          0.008899412625 ETH
   ```

1. 2 でデプロイした際のログに出ている `contract address` を環境変数に設定する.
   ```
   export CONTRACT_ADDRESS={contract address}
   ```

# lendableSBT_DEMO
### account

Accounts:
(0) 0x2f6d487de1705340ef0b05ba416c9c7c89408549
(1) 0xbe0f2b693387b5afc846dfa1aaa2f280c2d85f01
(2) 0x8b707a3283db61fab6b1c4922b5574befd23a654
(3) 0xfd5c5be03a4e690515b5c1217c254cf0af98e5da
(4) 0x872ad3e4079db634a9544576b45f635634a7a2ab
(5) 0xeeb99a4e7006be0f442c00451b232353f182ab06
(6) 0xcd891da0aab6747153daa626df3960a48ba2e4bd
(7) 0xbe4202c7fa7a38fbf3fa87d8ca07d602311459d9
(8) 0x54f7a3dc7dd85c3bddf391fb4529a0ccebb3ab37
(9) 0x46e26f13746c28100a435511eaa35f348727a6e1

### Private Keys:
Private Keys:
(0) 681dc3f4126d2e935a99b101deae80b8ade75fe06f6647f304ab4cd5026ad5b0
(1) 312d97f3e64bc0750793c814046f838dcff0c3fcee91e6083f4d1056b41b79ef
(2) b1b62410ca504caeb055893c2e409d313a58cbfdf4f177837f349dec2ee6e22e
(3) 80569852438611a880efdb74597a17338673e8f329d4c1ce586448046c598885
(4) 9763b50a4f8a599451a1611fecde075cb5866872fc7fad341544633b12b931ec
(5) d662e26411f061c2eb2333449aba8233a7445e15f03bbb8a6d1fa7d4d20b9f7a
(6) 09d016ced303b2c0b72c75f6f7adf7eeeafbd28a7ac41fc2adc138e7335dbc72
(7) fa2e12eddd2d48aed6065d20703d1207618576e386e49cd34a4ecfc6437946bc
(8) f93bd34474278a13504f2010e2457813a2a4ffedc88509c903070869e3231e54
(9) cdcb18258eac924e3611444d3ec2c6014280e526ad812bc0725aa8cae9eb3d11

# How to test
##  1. BaseURIの設定
### 実行例:
~~~
node nftactions.js baseURI "https://example.com/nft/"
~~~
### 実行結果:
このコマンドは、NFTのBaseURIを指定したURIに変更します。実際の結果としては、トランザクションの受領がコンソールに表示されます。
~~~
Transaction receipt: node nftactions.js baseURI "https://lendableSBT/example/1"
~~~
## 2. Tokenの発行 (Mint)
### 実行例:
~~~
node nftactions.js mint
~~~
### 実行結果:
新しいNFTトークンが発行されます。結果として、新しく発行されたトークンのIDが表示されるはずです。
~~~
mint tokenId: [新しいトークンID]
~~~
## 3. 貸し出し設定
### 実行例:
~~~
node nftactions.js set 0xc3de40cdbf4995332f406bf9fef28f751f4fdcc5 1 "2023-12-31" 100
~~~
## 4. トークンを借りる
### 実行例:
~~~
node nftactions.js rent 1
~~~
## 5. トークンのURI取得
### 実行例:
~~~
node nftactions.js tokenURI 1
~~~
### 実行結果:
トークンID 1 のURIが取得され、表示されます。
~~~
Token URI: https://example.com/nft/1
~~~
## 6. 貸し出し情報の取得
### 実行例:
~~~
node nftactions.js get 0xc3de40cdbf4995332f406bf9fef28f751f4fdcc5 1
~~~
## 7. トークンの有効期限チェック

### 実行例:
~~~
node nftactions.js check 0xc3de40cdbf4995332f406bf9fef28f751f4fdcc5 1
~~~
### 予想される結果:
トークンID `1` の有効期限がチェックされ、結果が表示されます。
~~~
Token Expiry: [true or false]
~~~

## 8. トークンが貸し出されているかチェック

### 実行例:
~~~
node nftactions.js isRentedCheck 0xc3de40cdbf4995332f406bf9fef28f751f4fdcc5 1
~~~
### 予想される結果:
トークンID `1` が貸し出されているかどうかがチェックされ、結果が表示されます。
~~~
Is Rented: [true or false]
~~~

## 9. アクセス制御チェック

### 実行例:
~~~
node nftactions.js access 1
~~~
### 予想される結果:
トークンID `1` のアクセス権限がチェックされ、結果が表示されます。
~~~
Access granted
~~~
または、
~~~
Access denied
~~~
まず、所有者の場合
~~~
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ node nftactions.js access 1
Access granted
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ node nftactions.js access 2
Access granted
~~~
つぎに、レンタルした人の場合
~~~
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ export WALLET_ADDRESS3=0xbe0f2b693387b5afc846dfa1aaa2f280c2d85f01
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ export PRIVATE_KEY3=312d97f3e64bc0750793c814046f838dcff0c3fcee91e6083f4d1056b41b79ef
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ node nftactions.js access 1
Access denied
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ node nftactions.js access 2
Access granted
~~~
最後に、部外者の場合
~~~
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ export PRIVATE_KEY3=b1b62410ca504caeb055893c2e409d313a58cbfdf4f177837f349dec2ee6e22e
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ export WALLET_ADDRESS3=0x8b707a3283db61fab6b1c4922b5574befd23a654
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ node nftactions.js access 2
Access denied
yasuhiro_iwai@ubuntu-2204-edr:~/intern/LendaleSBT$ node nftactions.js access 1
Access denied
~~~~

# コントラクトアドレスが間違っているとき
/home/yasuhiro_iwai/intern/LendaleSBT/node_modules/web3-eth-abi/lib/index.js:304
        throw new Error('Returned values aren\'t valid, did it run Out of Gas? ' +