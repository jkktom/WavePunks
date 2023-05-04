// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract WaveNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    using Strings for uint256;
    uint256 public redemptionPeriod;
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

    struct LendingOffer {
        uint256 deposit;
        uint256 lendingStartTime;
        uint256 lendingExpiration;
        uint256 redemptionPeriod;
        address owner;
        address borrower;
        bool isActive;
    }

    event LendingOfferCreated(
        address indexed owner,
        uint256 indexed timestamp,
        uint256 indexed tokenId,
        uint256 deposit,
        uint256 lendingStartTime,
        uint256 lendingExpiration,
        uint256 redemptionPeriod
    );

    event LendingOfferCanceled(
        
        uint256 indexed tokenId,
        bool isActive
    );


    mapping(uint256 => LendingOffer) public lendingOffers;

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
    // Owner functions

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function createLendingOffer(
        uint256 _tokenId,
        uint256 _deposit,
        uint256 _lendingStartTime,
        uint256 _lendingExpiration,
        uint256 _redemptionPeriod
    ) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(lendingOffers[_tokenId].isActive == false, "Already rented");
        require(_lendingStartTime < _lendingExpiration, "Set lending time properly");

        LendingOffer memory newOffer = LendingOffer({
            deposit: _deposit,
            lendingStartTime: _lendingStartTime,
            lendingExpiration: _lendingExpiration,
            redemptionPeriod: _redemptionPeriod,
            owner: msg.sender,
            borrower: address(0),
            isActive: true
        });

        lendingOffers[_tokenId] = newOffer;

        emit LendingOfferCreated(
            msg.sender, 
            block.timestamp, 
            _tokenId, 
            _deposit, 
            _lendingStartTime, 
            _lendingExpiration,
            _redemptionPeriod
        );
        
    }
    
    function borrowNFT(uint256 tokenId) public payable {
        LendingOffer storage offer = lendingOffers[tokenId];
        require(offer.isActive, "Lending offer is not active");
        require(block.timestamp >= offer.lendingStartTime, "Lending has not started yet");
        require(block.timestamp <= offer.lendingExpiration, "Lending offer has expired");
        require(msg.value == offer.deposit, "Insufficient payment");

        offer.borrower = msg.sender;
        offer.isActive = false;
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");

        LendingOffer memory offer = lendingOffers[tokenId];

        bool withinLendingPeriod = 
            block.timestamp >= offer.lendingStartTime 
            && block.timestamp <= offer.lendingExpiration;

        if (withinLendingPeriod && offer.borrower != address(0)) {
            return offer.borrower;
        } else {
            return ERC721.ownerOf(tokenId);
        }
    }
    function cancelLendingOffer(uint256 tokenId) public {
        LendingOffer storage offer = lendingOffers[tokenId];
        require(offer.owner == msg.sender, "Not the lender");
        require(offer.borrower == address(0), "NFT is currently borrowed");

        offer.isActive = false;
        emit LendingOfferCanceled(tokenId, offer.isActive);
    }

    // function returnLentNFT(uint256 tokenId) public payable {
    //     LendingOffer storage offer = lendingOffers[tokenId];
    //     require(block.timestamp >= offer.lendingExpiration, "Not yet expired");
    //     require(offer.borrower == msg.sender, "Not the borrower");
    //     require(msg.value == offer.deposit, "Insufficient deposit return");

    //     uint256 redemptionDeadline = offer.lendingExpiration + offer.redemptionPeriod;
    //     require(block.timestamp <= redemptionDeadline, "Redemption deadline passed");

    //     transferFrom(msg.sender, offer.owner, tokenId);

    //     payable(msg.sender).transfer(offer.deposit);

    //     offer.isActive = false;
    // }

    // function redeemNFT(uint256 tokenId) public payable {
    //     LendingOffer storage offer = lendingOffers[tokenId];
    //     require(offer.owner == msg.sender, "Not the owner");
    //     require(block.timestamp >= offer.lendingExpiration, "Lending period not expired");
    //     require(msg.value == offer.deposit, "Insufficient deposit payment");

    //     uint256 redemptionDeadline = offer.lendingExpiration + offer.redemptionPeriod;
    //     require(block.timestamp <= redemptionDeadline, "Redemption deadline passed");

    //     transferFrom(offer.borrower, msg.sender, tokenId);

    //     // Return the deposit to the borrower
    //     payable(offer.borrower).transfer(offer.deposit);

    //     // Reset the lending offer
    //     offer.isActive = false;
    //     offer.borrower = address(0);
    // }

    // function redeemNFT(uint256 tokenId) public payable {
    //     LendingOffer storage offer = lendingOffers[tokenId];
    //     require(block.timestamp >= offer.lendingExpiration, "Not yet expired");
    //     require(offer.owner == msg.sender, "Not the owner");
    //     require(msg.value == offer.deposit, "Insufficient deposit");

    //     uint256 redemptionDeadline = offer.lendingExpiration + offer.redemptionPeriod;
    //     require(block.timestamp <= redemptionDeadline, "Redemption deadline passed");

    //     _approve(address(this), tokenId); // Approve the contract to transfer the NFT
    //     safeTransferFrom(offer.borrower, msg.sender, tokenId); // Transfer the NFT back to the owner

    //     payable(offer.borrower).transfer(offer.deposit); // Return the deposit to the borrower

    //     offer.isActive = false;
    // }

    function redeemNFT(uint256 tokenId) public payable {
        LendingOffer storage offer = lendingOffers[tokenId];
        require(offer.owner == msg.sender, "Not the owner");
        require(block.timestamp >= offer.lendingExpiration, "Not yet expired");
        require(msg.value == offer.deposit, "Insufficient deposit return");

        uint256 redemptionDeadline = offer.lendingExpiration + offer.redemptionPeriod;
        require(block.timestamp <= redemptionDeadline, "Redemption deadline passed");

        if (offer.borrower != address(0)) {
            // Refund the deposit to the borrower
            payable(offer.borrower).transfer(offer.deposit);
            offer.borrower = address(0);
        }

        offer.isActive = false;
    }



}











