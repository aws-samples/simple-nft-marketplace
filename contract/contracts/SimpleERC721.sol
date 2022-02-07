// contracts/SimpleERC721.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleERC721 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    struct TokenOnMarketplace {
        bool listing;
        uint256 price;
        address publisher;
        uint256 royalty;
    }

    mapping(uint256 => TokenOnMarketplace) public marketplace;

    constructor() ERC721("SimpleNftToken", "SNT") {}

    function newItem(string memory tokenURI, uint256 royalty) public returns (uint256) {
        require(royalty >= 0, "royalty must be greater than 0");
        require(royalty < 100, "royalty must be less than 100");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        _mint(_msgSender(), newItemId);
        _setTokenURI(newItemId, tokenURI);

        TokenOnMarketplace memory tmp;
        tmp.listing = false;
        tmp.price = MAX_INT;
        tmp.publisher = _msgSender();
        tmp.royalty = royalty;

        marketplace[newItemId] = tmp;

        return newItemId;
    }

    function listOnMarketplace(uint256 _tokenId, uint256 _price) public {
        require(_exists(_tokenId), "listOnMarketplace: token not found");
        require(ownerOf(_tokenId) == msg.sender, "listOnMarketplace: only owner can list the token on marketplace");
        marketplace[_tokenId].listing = true;
        marketplace[_tokenId].price = _price;
    }

    function removeFromMarketplace(uint256 _tokenId) public {
        require(_exists(_tokenId), "removeFromMarketplace: token not found");
        require(ownerOf(_tokenId) == msg.sender, "removeFromMarketplace: only owner can remove the token from marketplace");
        marketplace[_tokenId].listing = false;
        marketplace[_tokenId].price = MAX_INT;
    }

    function purchase(uint256 _tokenId) public payable {
        require(_exists(_tokenId), "purchase: token not found");
        require(marketplace[_tokenId].listing, "purchase: the token is not listed");
        require(msg.value == marketplace[_tokenId].price, "purchase: the price is not correct");

        uint256 fee = (msg.value * marketplace[_tokenId].royalty) / 100;

        payable(marketplace[_tokenId].publisher).transfer(fee);
        payable(ownerOf(_tokenId)).transfer(msg.value - fee);

        _transfer(ownerOf(_tokenId), msg.sender, _tokenId);

        marketplace[_tokenId].listing = false;
        marketplace[_tokenId].price = MAX_INT;
    }
}
