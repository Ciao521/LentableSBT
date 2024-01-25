// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.13;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";//発行されたトークンを列挙する機能がほしいので、拡張機能を追加
//import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./IERC4907.sol";
import {ERC5192} from "./ERC5192.sol";

//lendable SBTは、複数人がレンタル可能だが、譲渡付加なSBT
//SBT(SoulBound Token)は、アドレスに対して永久的に紐づけられたNFTのことを言います。ざっくりというと譲渡不可なNFTということになります。
contract lendableSBT is IERC4907,ERC5192,Ownable{
    bool private isLocked = true;//譲渡不可な環境状態であればTrue、袖ない場合はFalse
    using Counters for Counters.Counter; // トークンIDのカウンターのためのライブラリ
    Counters.Counter private _tokenIdCounter; // トークンIDのカウンター
    struct RentalInfo
    {
        address user;   // "貸手"が、トークンを渡す"借手"のアドレス
        uint256 tokenid; //"貸手"が、"借手"に貸すトークンID
        uint256 expires; // 貸手が指定する、レンタル終了のタイムスタンプ
        bool isrented; //　"貸し"ているかどうか
    }
    struct RequestInfo
    {
        address user; //　"借手"が希望する"貸手"のアドレス
        uint256 requestdate;//借手が希望するレンタル終了のタイムスタンプ
        uint256 tokenid; // "借手"が、"貸手"に希望するトークンID
    }

    // struct RentalInfo{
    //     //bool isRentable; // トークンがレンタル可能かどうか
    //     //address [] rentedBy; // トークンをレンタルしている借手のアドレス
    //     //uint256 [] endTimestamp; //レンタル終了のタイムスタンプ
    //     //address [] approvedRenter; //貸手が許可した借手
    //     //address [] pastRenters; //過去の借手
    // }
    
    
    // ??? mapping (uint256 =>UserInfo) internal Users;
    UserInfo[] Users;

    constructor(string memory name_, string memory symbol_, bool _isLocked)
     ERC5192(name_, symbol_, _isLocked)
    {
        isLocked = _isLocked;
    }

    // //SRC721のfunction部分
    // function mint(
    //     address to,
    //     string memory tokenURI
    // ) public onlyOwner returns (uint256) {
    //     _tokenIds.increment();
    //     uint256 newTokenId = _tokenIds.current();
    //     _mint(to, newTokenId);
    //     _setTokenURI(newTokenId, tokenURI);
    //     return newTokenId;
    // }

    ///　ここから、4907のfunction部分
    /// @notice set the user and expires of an NFT
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires

    //NFTの使用制限を設定します
    //"user" NFTを「使用する」アドレス。0アドレスの場合、「使用する」アドレスが存在しないことを示します。
    //"expires" UNIXタイムスタンプ形式で表される「user」の使用期限。この期限が過ぎると、ユーザーの権限が自動的に終了します。
    function setUser(uint256 tokenId, address user, uint64 expires) public virtual{
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC4907: transfer caller is not owner nor approved");
        UserInfo storage info =  users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    
    // 特定のNFTの「user」のアドレスを取得する関数。
    // tokenId` user情報を取得するNFTのトークンID。
    // 戻り値 NFTの「user」のアドレスを示します。0アドレスの場合、「使用する」アドレスが存在しないことを示す。
    function userOf(uint256 tokenId) public view virtual returns(address){
        if( uint256(_users[tokenId].expires) >=  block.timestamp){
            return  _users[tokenId].user;
        }
        else{
            return address(0);
        }
    }

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    // 特定のNFTのuserの使用権限を取得する関数
    function userExpires(uint256 tokenId) public view virtual returns(uint256){
        return _users[tokenId].expires;
    }

    /// @dev See {IERC165-supportsInterface}.
    /// ERC165のインターフェースをサポートしているかを確認するための関数。 引数として 0xad092b5c（IERC4907インターフェースのコンパクトID）を渡した場合にのみtrueを返します。
    // function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    //     return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    // }

    //Tokenが移動する場合に、トークンのつの引数を取ります。`from` は送信元アドレス、`to` は宛先アドレス、`tokenId` はトークンのID、`batchSize` はトランザクションで送信されるトークンのバッチサイズです。
    //トークンが移動する場合に、トークンの所有者が変更される可能性があるため、 `_users` マップからトークンの所有者を削除します。そして、`UpdateUser` イベントを発行して、トークンの所有者が変更されたことを通知します。

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        if (from != to && _users[tokenId].user != address(0)) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
    }
    //ここからSRC5192の部分
    
    //初期状態では譲渡不可な状態としてtokenIDを生成される
    // is Lockedで、スマートコントラクトが譲渡(Transfer）不可な環境かどうかの判断
    

    function safeMint(address to, uint256 tokenId) external {
    _safeMint(to, tokenId);
    if (isLocked) emit Locked(tokenId);
    }

    ///////ここから拡張機能 #check
    
    //貸手（健診者）が指定したトークンのレンタル可能性を切り替える
        // - トークンの所有者のみがこの操作を行うことができる
        // - レンタル可能性を切り替え（true <-> false）
    function toggleRentability(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can change rentability!");
        rentalInfos[tokenId].isRentable = !rentalInfos[tokenId].isRentable;
    }

    // 貸手を借手が承認する関数
    // function approveRenter(uint256 tokenId, address renter) external {
    //     require(ownerOf(tokenId) == msg.sender, "Only the owner can approve a renter!");
    //     rentalInfos[tokenId].approvedRenter = renter;
    // }
    
    //現在の借手を取得する関数
    // - トークンIDを指定してレンタルしているアドレスを返す
    // - トークンをレンタルしている人たちを取得する関数
    function getRenters(uint256 tokenId) external view returns(address[] memory) {
        return rentalInfos[tokenId].rentedBy;
    }

    //過去の借手を取得する関数
    function getPastRenters(uint256 tokenId) external view returns(address[] memory) {
        return rentalInfos[tokenId].pastRenters;
    }
    
    
    // 貸手から複数の借手に追加で与える関数(実装例1)

    // function rentOutMultiple(uint256[] memory tokenIds, address[] memory renters, uint256[] memory rentalDurations) public {
    //     require(tokenIds.length == renters.length && renters.length == rentalDurations.length, "Arrays must have the same length");
    //     for (uint256 i = 0; i < tokenIds.length; i++) {
    //         uint256 tokenId = tokenIds[i];
    //         address renter = renters[i];
    //         uint256 rentalDuration = rentalDurations[i];
    //         require(ownerOf(tokenId) == msg.sender, "Only the owner can rent out the NFT");
    //         require(rentalInfos[tokenId].isRentable, "The NFT is not rentable");
    //         rentalInfos[tokenId].rentedBy.push(renter);  // レンタル者を追加
    //         rentalInfos[tokenId].endTimestamp = block.timestamp + rentalDuration;
    //     }
    // }

    // function rentOutMultiple(uint256[] memory tokenIds, address[] memory renters, uint256[] memory rentalDurations) public {
    //     require(tokenIds.length == renters.length && renters.length == rentalDurations.length);

    //     for (uint256 i = 0; i < tokenIds.length; i++) {
    //         rentOutSingle(tokenIds[i], renters[i], rentalDurations[i]);
    //     }
    // }

function rentOutSingle(uint256 tokenId, address renter, uint256 ) internal {
    require(ownerOf(tokenId) == msg.sender, "Only the owner can rent out the NFT");
    require(rentalInfos[tokenId].isRentable, "The NFT is not rentable");

    rentalInfos[tokenId].rentedBy.push(renter);
    rentalInfos[tokenId].endTimestamp = block.timestamp + rentalDuration;
}

// 借手から貸手に返却する関数
        // - トークンのレンタル者のみが返却できる
        // - レンタル期間がまだ終了していないこと
        // - レンタル情報を更新：レンタル者と終了時刻をリセット

function returnRentedNFTs(uint256[] memory tokenIds, address returner) public {
    for (uint256 i = 0; i < tokenIds.length; i++) {
        returnSingleRentedNFT(tokenIds[i], returner);
    }
}


function returnSingleRentedNFT(uint256 tokenId, address returner) internal {
    require(block.timestamp <= rentalInfos[tokenId].endTimestamp, "Rental duration has expired");

    bool isRenter = false;
    uint256 renterCount = rentalInfos[tokenId].rentedBy.length;

    for (uint256 j = 0; j < renterCount; j++) {
        if (rentalInfos[tokenId].rentedBy[j] == returner) {
            isRenter = true;

            // 最後の借手を現在の位置に移動し、最後の借手を削除
            rentalInfos[tokenId].rentedBy[j] = rentalInfos[tokenId].rentedBy[renterCount - 1];
            rentalInfos[tokenId].rentedBy.pop();
            break;
        }
    }

    require(isRenter, "Only the renter can return the NFT");
}


    // function returnRentedNFTs(uint256[] memory tokenIds, address returner) public {
    //     for (uint256 i = 0; i < tokenIds.length; i++) {
    //         uint256 tokenId = tokenIds[i];
    //         require(block.timestamp <= rentalInfos[tokenId].endTimestamp, "Rental duration has expired");
           
    //         bool isRenter = false;
    //         for (uint256 j = 0; j < rentalInfos[tokenId].rentedBy.length; j++) {
    //             if (rentalInfos[tokenId].rentedBy[j] == returner) {
    //                 isRenter = true;
    //                 rentalInfos[tokenId].rentedBy[j] = rentalInfos[tokenId].rentedBy[rentalInfos[tokenId].rentedBy.length - 1];
    //                 rentalInfos[tokenId].rentedBy.pop();
    //                 break;
    //             }
    //         }
    //         require(isRenter, "Only the renter can return the NFT");
    //     }
    // }

}
///？？？？？？？？

SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC4907.sol";
import {ERC5192} from "./ERC5192.sol";

contract LendableSBT is ERC5192, Ownable {
    
    // ... [Other code remains unchanged]

    string private _currentBaseURI;

    constructor(string memory name_, string memory symbol_, bool _isLocked)
    ERC5192(name_, symbol_, _isLocked)
    {
        isLocked = _isLocked;
        _currentBaseURI = "https://lendableSBT/example/"; // Default value
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _currentBaseURI;
    }

    // Allow the owner to set the base URI
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _currentBaseURI = newBaseURI;
    }

    // ... [Other code remains unchanged]
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC4907.sol";
import {ERC5192} from "./ERC5192.sol";

contract LendableSBT is ERC5192, Ownable {
    
    struct UserInfo {
        uint256 expire;
        bool isRented;
    }

    struct RentalData {
        mapping(address => UserInfo) users;
    }

    mapping(uint256 => RentalData) tokenRentalData;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    bool private isLocked = true;

    constructor(string memory name_, string memory symbol_, bool _isLocked)
    ERC5192(name_, symbol_, _isLocked)
    {
        isLocked = _isLocked;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://lendableSBT/example/";
    }

    function mint(address to) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(to, newTokenId);
        if (isLocked) emit Locked(newTokenId);
        return newTokenId;
    }

    // Set rental data for a specific token and renter
    function setRentalData(address renter, uint256 tokenId, uint256 expire) public onlyOwner {
        tokenRentalData[tokenId].users[renter].expire = expire;
        tokenRentalData[tokenId].users[renter].isRented = false;
    }

    // Rent a token
    function rent(uint256 tokenId) public {
        require(tokenRentalData[tokenId].users[msg.sender].expire > block.timestamp, "Token is not available for rent");
        require(tokenRentalData[tokenId].users[msg.sender].isRented == false, "Token is already rented");
        tokenRentalData[tokenId].users[msg.sender].isRented = true;
    }

    // Get rental data for a specific token and renter
    function getRentalData(uint256 tokenId, address renter) public view returns (UserInfo memory) {
        return tokenRentalData[tokenId].users[renter];
    }

    // Pay reward to a specific address
    function payReward(address to, uint256 amount) external onlyOwner {
        payable(to).transfer(amount); // Paying in ETH for simplicity
    }

    // Get all renters for a specific token
    function getRenters(uint256 tokenId) external view returns (address[] memory) {
        uint256 count = 0;
        // Counting the number of renters
        for (address renter in tokenRentalData[tokenId].users) {
            if (tokenRentalData[tokenId].users[renter].isRented) {
                count++;
            }
        }

        address[] memory renters = new address[](count);
        uint256 index = 0;
        for (address renter in tokenRentalData[tokenId].users) {
            if (tokenRentalData[tokenId].users[renter].isRented) {
                renters[index] = renter;
                index++;
            }
        }
        return renters;
    }

    // Get all users for a specific token
    function getUsers(uint256 tokenId) external view returns (address[] memory) {
        uint256 count = 0;
        // Counting the number of users
        for (address user in tokenRentalData[tokenId].users) {
            count++;
        }

        address[] memory users = new address[](count);
        uint256 index = 0;
        for (address user in tokenRentalData[tokenId].users) {
            users[index] = user;
            index++;
        }
        return users;
    }
}

// 規定の支払い額を設定（例: 0.01 ETH）
uint256 public constant REWARD_AMOUNT = 0.01 ether;

function rent(uint256 tokenId) public payable {
    require(
        tokenRentalData[tokenId].users[msg.sender].expire > block.timestamp,
        "Token is not available for rent"
    );
    require(
        tokenRentalData[tokenId].users[msg.sender].isRented == false,
        "Token is already rented"
    );
    require(
        msg.value >= REWARD_AMOUNT,
        "Insufficient payment, please send the correct reward amount"
    );

    // トークンの所有者に支払いを行う
    address tokenOwner = ownerOf(tokenId);
    payable(tokenOwner).transfer(REWARD_AMOUNT);

    // トークンのレンタル状態を更新
    tokenRentalData[tokenId].users[msg.sender].isRented = true;
}

// トークンIDごとの支払い額を保持するマッピング
mapping(uint256 => uint256) public tokenRewardAmount;

// トークンの所有者が支払い額を設定する関数
function setRewardAmount(uint256 tokenId, uint256 amount) external {
    require(ownerOf(tokenId) == msg.sender, "Only the owner can set the reward amount");
    tokenRewardAmount[tokenId] = amount;
}

function rent(uint256 tokenId) public payable {
    require(
        tokenRentalData[tokenId].users[msg.sender].expire > block.timestamp,
        "Token is not available for rent"
    );
    require(
        tokenRentalData[tokenId].users[msg.sender].isRented == false,
        "Token is already rented"
    );
    require(
        msg.value >= tokenRewardAmount[tokenId],
        "Insufficient payment, please send the correct reward amount"
    );

    // トークンの所有者に支払いを行う
    address tokenOwner = ownerOf(tokenId);
    payable(tokenOwner).transfer(tokenRewardAmount[tokenId]);

    struct RentalData {
    mapping(address => UserInfo) users;
    uint256 rewardAmount; // トークンIDごとの支払い額
}


// ...

function rent(uint256 tokenId) public payable {
    require(
        tokenRentalData[tokenId].users[msg.sender].expire > block.timestamp,
        "Token is not available for rent"
    );
    require(
        tokenRentalData[tokenId].users[msg.sender].isRented == false,
        "Token is already rented"
    );


    // トークンの所有者に支払いを行う
    address tokenOwner = ownerOf(tokenId);
    payable(tokenOwner).transfer(tokenRentalData[tokenId].rewardAmount);

    // トークンのレンタル状態を更新
    tokenRentalData[tokenId].users[msg.sender].isRented = true;
}