// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract WaveNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    // using SafeMath for uint256;
    using Strings for uint256;
    // uint256 public redemptionPeriod;
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    string public baseURI;
    string public constant baseExtension = ".json";

    event Mint(uint256 tokenId, address minter);
    event Withdraw(uint256 amount, address owner);

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
        initialState,
        lendingOpen,
        lendingPeriod,
        expired,
        seized
    }

    modifier updateTokenState(uint256 tokenId) {
        TokenState currentState = _getTokenState(tokenId);
        if (currentState != tokenStates[tokenId]) {
            if (currentState == TokenState.seized) {
                _seizeNFT(tokenId);
            } else {
                tokenStates[tokenId] = currentState;
            }
        }
        _;
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
        uint256 indexed tokenId
    );
    event Rented(
        uint256 indexed tokenId
    );
    event Seized(
        uint256 indexed tokenId
    );
    event Redeemed(
        uint256 indexed tokenId
    );


    mapping(uint256 => LendingOffer) public lendingOffers;
    mapping(uint256 => TokenState) public tokenStates;

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

    function withdraw() external onlyOwner {
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
    ) external {
        TokenState tokenState = _getTokenState(_tokenId);
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(tokenState == TokenState.initialState, "Not InitialState");
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
    
    function borrowNFT(uint256 tokenId) external payable nonReentrant updateTokenState(tokenId) {
        //check lending is open
        TokenState tokenState = _getTokenState(tokenId);
        require(ownerOf(tokenId) != msg.sender, "borrowing from yourself");
        require(tokenState == TokenState.lendingOpen, "Not Open");
        //check startTime
        LendingOffer storage offer = lendingOffers[tokenId];
        // require(block.timestamp >= offer.lendingStartTime, "Wait for the start time");
        require(msg.value == offer.deposit, "Insufficient payment");

        offer.borrower = msg.sender;
        tokenStates[tokenId] = TokenState.lendingPeriod;
        emit Rented(tokenId);
    }


    function _seizeNFT(uint256 tokenId) internal {
        LendingOffer storage offer = lendingOffers[tokenId];
        require(offer.borrower != address(0), "No borrower for this token");

        // Transfer NFT ownership permanently to the borrower
        _safeTransfer(offer.owner, offer.borrower, tokenId, "");

        // Clear the lending offer
        delete lendingOffers[tokenId];
        tokenStates[tokenId] = TokenState.initialState;
        emit Seized(tokenId);
    }    

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");

        if (_getTokenState(tokenId) == TokenState.lendingPeriod 
            || _getTokenState(tokenId) == TokenState.expired
            || _getTokenState(tokenId) == TokenState.seized
        ) {
            if (msg.sender == lendingOffers[tokenId].borrower) {
                revert("Claim the NFT");
            } else {
                return lendingOffers[tokenId].borrower;
            }
        } else if (
            _getTokenState(tokenId) == TokenState.initialState || _getTokenState(tokenId) == TokenState.lendingOpen
        ) {
            // If the token is in any other state, return the original owner
            return ERC721.ownerOf(tokenId);
        } else {
            revert("Unexpected token state");
        }
    }



    function redeemNFT(uint256 tokenId) external payable nonReentrant updateTokenState(tokenId) {
        TokenState tokenState = _getTokenState(tokenId);
        require(tokenState == TokenState.expired, "Not yet expired");
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

    function _getTokenState(uint256 tokenId) internal view returns (TokenState) {

        LendingOffer storage offer = lendingOffers[tokenId];
        TokenState currentTokenState = tokenStates[tokenId];

        if (currentTokenState == TokenState.initialState) {
            return TokenState.initialState;
        } else if (offer.borrower == address(0)) {
            return TokenState.lendingOpen;
        } else if (block.timestamp <= offer.lendingExpiration) {
            return TokenState.lendingPeriod;
        } else if (block.timestamp > offer.lendingExpiration && block.timestamp <= offer.lendingExpiration + offer.redemptionPeriod) {
            return TokenState.expired;
        } else {
            return TokenState.seized;
        }

    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function claimNFT(uint256 tokenId) external {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        require(msg.sender == lendingOffers[tokenId].borrower, "Caller is not the borrower");

        TokenState tokenState = _getTokenState(tokenId);
        require(tokenState == TokenState.seized, "Token is not in seized state");

        _seizeNFT(tokenId);
    }

}
