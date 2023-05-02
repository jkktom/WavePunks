// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract WaveNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
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

    function mint(uint256 _mintAmount) public payable {
        // Only allow minting after specified time
        // Must mint at least 1 token
        // Require enough payment
        // Do not let them mint more tokens than available
        require(block.timestamp >= allowMintingOn);
        require(_mintAmount > 0);
        require(msg.value >= cost * _mintAmount);
        uint256 supply = totalSupply();
        require(supply + _mintAmount <= maxSupply);

        // Create tokens
        for(uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }

        // Emit event
        emit Mint(_mintAmount, msg.sender);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'token does not exist');
        return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }
}











