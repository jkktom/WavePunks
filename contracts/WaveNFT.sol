// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract WaveNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    using Strings for uint256;
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    string public baseURI;
    string public constant baseExtension = ".json";

    event Mint(uint256 tokenId, address minter);

    event DrainContract(uint256 amount, address owner);

    event LendingOfferCreated(
        address indexed owner,
        uint256 indexed timestamp,
        uint256 indexed tokenId,
        uint256 deposit,
        uint256 lendingStartTime,
        uint256 lendingExpiration,
        uint256 redemptionPeriod
    );

    event LendingOfferCanceled(uint256 indexed tokenId);
    event Rented(uint256 indexed tokenId);
    event Seized(uint256 indexed tokenId);
    event Expired(uint256 indexed tokenId);
    event Redeemed(uint256 indexed tokenId);

    mapping(uint256 => LendingOffer) public lendingOffers;
    mapping(uint256 => TokenState) public tokenStates;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        cost = _cost;
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
    }

    enum TokenState {
        initialState, // color
        lendingOpen,
        lendingPeriod,
        expired,
        seized
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function mint() public payable nonReentrant {
        require(block.timestamp >= allowMintingOn, "Minting has not started yet");
        require(msg.value == cost, "Incorrect payment");
        require(totalSupply() < maxSupply, "Max supply reached");

        // Create tokens
        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);

        tokenStates[tokenId] = TokenState.initialState;

        // Emit event
        emit Mint(tokenId, msg.sender);
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

    function tokensOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }
    // Owner functions

    function withdrawAndDrainContract() external onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit DrainContract(balance, msg.sender);
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
    ) external {
        updateTokenStatus(_tokenId);
        require(tokenStates[_tokenId] == TokenState.initialState, "Not InitialState");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_lendingStartTime < _lendingExpiration, "Set lending time properly");

        LendingOffer memory newOffer = LendingOffer({
            deposit: _deposit,
            lendingStartTime: _lendingStartTime,
            lendingExpiration: _lendingExpiration,
            redemptionPeriod: _redemptionPeriod,
            owner: msg.sender,
            borrower: address(0)
        });

        lendingOffers[_tokenId] = newOffer;
        tokenStates[_tokenId] = TokenState.lendingOpen;

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

    function cancelLendingOffer(uint256 tokenId) external {
        require(tokenStates[tokenId] == TokenState.lendingOpen, "No lending offer Open");
        LendingOffer storage offer = lendingOffers[tokenId];
        require(offer.owner == msg.sender, "Not the lender");

        delete lendingOffers[tokenId];
        tokenStates[tokenId] = TokenState.initialState;
        emit LendingOfferCanceled(tokenId);
    }

    function borrowNFT(uint256 tokenId) external payable nonReentrant {
        updateTokenStatus(tokenId);
        //check lending is open
        require(tokenStates[tokenId] == TokenState.lendingOpen, "Not Open");
        require(ownerOf(tokenId) != msg.sender, "borrowing from yourself");
        require(msg.value == lendingOffers[tokenId].deposit, "Insufficient payment");

        lendingOffers[tokenId].borrower = msg.sender;
        tokenStates[tokenId] = TokenState.lendingPeriod;
        emit Rented(tokenId);
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        if (tokenStates[tokenId] == TokenState.initialState 
            || tokenStates[tokenId] == TokenState.lendingOpen
        ) {
            return ERC721.ownerOf(tokenId);
        } else {
            return lendingOffers[tokenId].borrower;
        }
    }

    function redeemNFT(uint256 tokenId) external payable nonReentrant {
        updateTokenStatus(tokenId);
        require(tokenStates[tokenId] == TokenState.expired, "Not yet expired");
        LendingOffer storage offer = lendingOffers[tokenId];
        require(offer.owner == msg.sender, "Not the owner");
        require(msg.value == offer.deposit, "Insufficient deposit return");

        // Refund the deposit to the borrower
        payable(offer.borrower).transfer(offer.deposit);
        offer.borrower = address(0);

        tokenStates[tokenId] = TokenState.initialState;
        delete lendingOffers[tokenId];
        emit Redeemed(tokenId);
    }

    function claimNFT(uint256 tokenId) external {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        updateTokenStatus(tokenId);
        LendingOffer storage offer = lendingOffers[tokenId];
        require(msg.sender == offer.borrower, "Caller is not the borrower");
        require(tokenStates[tokenId] == TokenState.seized, "Token is not in seized state");

        _safeTransfer(offer.owner, offer.borrower, tokenId, "");
        delete lendingOffers[tokenId];
        tokenStates[tokenId] = TokenState.initialState;
        emit Seized(tokenId);
    }

    function updateTokenStatus(uint256 tokenId) public {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        LendingOffer storage offer = lendingOffers[tokenId];

        if (tokenStates[tokenId] == TokenState.lendingOpen) {
            if (block.timestamp > offer.lendingExpiration) {
                delete lendingOffers[tokenId];
                tokenStates[tokenId] = TokenState.initialState;
                emit LendingOfferCanceled(tokenId);
            }
        } else if (tokenStates[tokenId] == TokenState.lendingPeriod
            || tokenStates[tokenId] == TokenState.expired
        ) {
            if (block.timestamp > offer.lendingExpiration) {
                if (block.timestamp > offer.lendingExpiration + offer.redemptionPeriod) {
                    tokenStates[tokenId] = TokenState.seized;
                    emit Seized(tokenId);
                } else {
                    tokenStates[tokenId] = TokenState.expired;
                    emit Expired(tokenId);
                }
            }
        }
    }

}









