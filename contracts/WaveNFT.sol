// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WaveNFT is ERC721Enumerable, Ownable {

    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    bool public isBorrowed;
    string public baseURI;
    string public baseExtension = ".json";

    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        bool _isBorrowed,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        cost = _cost;
        isBorrowed = _isBorrowed;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }

    
    // Your custom minting function and other logic here
}
