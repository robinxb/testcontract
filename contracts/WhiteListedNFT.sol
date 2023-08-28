pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WhiteListedNFT is ERC721Enumerable, Ownable {
    address private _admin;
    mapping(address => bool) private _whiteList;
    mapping(address => bool) private _minted;
    uint256 public currentTokenId = 0;
    uint256 public MAX_NFT_COUNT = 0;

    constructor(address admin_, uint256 max_count_) ERC721("Test Token", "TNFT") {
        _admin = admin_;
        MAX_NFT_COUNT = max_count_;
    }

    modifier onlyAdmin() {
        require(_admin == msg.sender, "Only admin can execute this");
        _;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        _admin = newAdmin;
    }

    function getAdmin() external view returns (address) {
        return _admin;
    }

    function addToWhiteList(address addr) external onlyAdmin {
        _whiteList[addr] = true;
    }

    function removeFromWhiteList(address addr) external onlyAdmin {
        _whiteList[addr] = false;
    }

    function isOnWhiteList(address addr) external view returns (bool) {
        return _whiteList[addr];
    }

    function mint() external {
        require(_whiteList[msg.sender], "You are not on the whitelist");
        require(!_minted[msg.sender], "You have already minted");
        require(currentTokenId < MAX_NFT_COUNT, "Maximum NFTs minted");

        _minted[msg.sender] = true;
        currentTokenId++;

        _safeMint(msg.sender, currentTokenId);
    }

    function hasMinted(address user) external view returns (bool) {
        return _minted[user];
    }
}
