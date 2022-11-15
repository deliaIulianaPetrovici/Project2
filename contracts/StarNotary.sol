// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";


// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star{
      string name;

    }




    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    constructor() ERC721("Star", "STR") {
    }


    // mapping the Star with the tokenId
    mapping(uint256=>Star) public tokenIdToStarInfo;


    // mapping the TokenId and price
    mapping(uint256=>uint256) public starsForSale;



    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters

        Star memory newStar=Star(_name);
        tokenIdToStarInfo[_tokenId]=newStar;
        _safeMint(msg.sender, _tokenId);

    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
      require(_exists(_tokenId)==true,"The token does not exist");
      require(msg.sender== ownerOf(_tokenId),"You can't sale the Star you don't owned");
      starsForSale[_tokenId]=_price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
      return payable(x);

    }


    // Function that allows you to buy a star
    function buyStar(uint256 _tokenId) public payable {
      //starCost - price of the star stored in starsForSale mapping
      uint256 starCost=starsForSale[_tokenId];
      //if starCost == 0 - star is not for sale, we require(starCost>0)
      require(starCost>0, "Star should be up for sale");
      //get the address of the tokens owner
      address ownerAddress=ownerOf(_tokenId);

      //msg.value(uint) -  number of wei sent with the message
      //the number of wei sent must be higher than the starCost
      require(msg.value>starCost, "You don't have enough ether to buy the star");


      /**safeTransferFrom (IERC721)- Safely transfers tokenId token from from(ownerAddress)
       to to(msg.sender), checking first
      that contract recipients are aware of the ERC721 protocol to prevent
       tokens from being forever locked
       */

      transferFrom(ownerAddress, msg.sender, _tokenId);

      //To transfer ETH the address must be of type payable
      address payable payableOwnerAddress =_make_payable(ownerAddress);
      //Transfer the ETH for the star to the owner
       // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
      (bool sent, ) = payableOwnerAddress.call{value: starCost}("");
      require(sent, "Failed to send Ether");

      //the number of wei sent must be higher than the starCost - required amount
      if(msg.value>starCost){
        uint256 tosendBack=0;
        unchecked {
          tosendBack=msg.value-starCost;
        }
       //transfer back the remaining ETH
        (bool sent1, ) = payable(msg.sender).call{value: tosendBack}("");
      require(sent1, "Failed to send Ether");









      }

    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        // require(_isApprovedOrOwner(msg.sender, _tokenId)==true,"You are now allowed to manage the token");
        return tokenIdToStarInfo[_tokenId].name;
    }

    function checkNewOwner(address oldOwner, address newOwner, uint256 _token) private view returns(bool){
       //Check which address is the current owner of the token
        address currentOwner=ownerOf(_token);
        //require that the old owner is not the current owner of the token (after transfer)
        require(currentOwner!= oldOwner,"The token  has the same owner still");
        //require that the current owner is the address the token was sent to (after transfer)
        require(currentOwner==newOwner,"The token is not owned by the indended address");

        return true;

    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
      //_exists - returns whether the "tokenId" exist
       require(_exists(_tokenId1)==true, "_tokenId1 does not exist");
       require(_exists(_tokenId2)==true, "_tokenId2 does not exist");
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        require(msg.sender== ownerOf(_tokenId1) || msg.sender==ownerOf(_tokenId2));
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)

        address ownerOfToken1=ownerOf(_tokenId1);
        address ownerOfToken2=ownerOf(_tokenId2);
        //  safeTransferFrom(ownerOfToken1, ownerOfToken2, _tokenId1);
        //  safeTransferFrom(ownerOfToken2, ownerOfToken1, _tokenId2);

        if(msg.sender==ownerOfToken1){


          safeTransferFrom(ownerOfToken1, ownerOfToken2, _tokenId1);


           if(checkNewOwner(ownerOfToken1, ownerOfToken2, _tokenId1)==true){
               _approve(ownerOfToken1,_tokenId2);
             //If the _tokenId1 is recieved by the owner of _tokenId2
             //Transfer the _tokenId2
              safeTransferFrom(ownerOfToken2, ownerOfToken1, _tokenId2);

               require(checkNewOwner(ownerOfToken2, ownerOfToken1, _tokenId2)==true,"The transfer of _tokenId2 went wrong");
           }
         }else if(msg.sender==ownerOfToken2){
            safeTransferFrom(ownerOfToken2, ownerOfToken1, _tokenId2);
            if(checkNewOwner(ownerOfToken2, ownerOfToken1, _tokenId2)==true){
             //If the _tokenId2 is recieved by the owner of _tokenId1
             //Aprove owner2 to manage _tokenId1
             _approve(ownerOfToken2,_tokenId1);
             //Transfer the _tokenId1
              safeTransferFrom(ownerOfToken1, ownerOfToken2, _tokenId1);
              require(checkNewOwner(ownerOfToken1, ownerOfToken2, _tokenId1)==true,"The transfer of _tokenId1 went wrong");
           }
        }


    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
      require(_exists(_tokenId)==true,"Token does not exist");
        //1. Check if the sender is the ownerOf(_tokenId)
        require(_isApprovedOrOwner(msg.sender,_tokenId)==true,"You are not allowed to manage the token");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        safeTransferFrom(msg.sender, _to1, _tokenId);

    }
}
