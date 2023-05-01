// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract WaveNFT is ERC721Enumerable {
    uint256 public cost;
    bool public isBorrowed;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        bool _isBorrowed
    ) ERC721(_name, _symbol) {
        cost = _cost;
        isBorrowed = _isBorrowed;
    }

    
    // Your custom minting function and other logic here
}
