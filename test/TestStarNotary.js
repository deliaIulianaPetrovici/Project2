const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
  accounts=accs;
  owner=accounts[0];

});

it('can Create a Star', async() => {
  let tokenId=1;
  let instance=await StarNotary.deployed();
  await instance.createStar('Awesome Star', tokenId, {from:accounts[0]});
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId),"Awesome Star")
});

it('lets user1 put up their star for sale', async() => {
  let tokenId=2;
  let userAcc=accounts[1];
  let tokenPrice=web3.utils.toWei(".01", "ether");
  let instance=await StarNotary.deployed();
  await instance.createStar("Second Star",tokenId,{from:userAcc});
  await instance.putStarUpForSale(tokenId,tokenPrice,{from:userAcc});

  assert.equal(await instance.starsForSale.call(tokenId), tokenPrice);
});

describe('buyStar()', () => {
it('lets user1 get the funds after the sale', async() => {
  let sellerAcc=accounts[2];
  let buyerAcc=accounts[3];
  let tokenId=3;
  let tokenPrice=web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  let gasPrice= web3.utils.toWei(".00000005", "ether");

  let instance=await StarNotary.deployed();
  await instance.createStar('Star for sell', tokenId, {from:sellerAcc});
  await instance.putStarUpForSale(tokenId,tokenPrice,{from:sellerAcc});
  await instance.approve(buyerAcc,tokenId,{from:sellerAcc,gasPrice:gasPrice});



  let sellerBalanceBefore=await web3.eth.getBalance(sellerAcc);
  await instance.buyStar(tokenId,{from:buyerAcc, value:balance});
  let sellerBalanceAfter=await web3.eth.getBalance(sellerAcc);
  let value1 = Number(sellerBalanceBefore) + Number(tokenPrice);
  let value2 = Number(sellerBalanceAfter);
  assert.equal(value1, value2);

});

it('lets user2 buy a star, if it is put up for sale', async() => {
  let sellerAcc=accounts[2];
  let buyerAcc=accounts[3];
  let tokenId=4;
  let tokenPrice=web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  let gasPrice= web3.utils.toWei(".00000005", "ether");

  let instance=await StarNotary.deployed();
  await instance.createStar('Star for sell', tokenId, {from:sellerAcc});
  await instance.putStarUpForSale(tokenId,tokenPrice,{from:sellerAcc});
  await instance.approve(buyerAcc,tokenId,{from:sellerAcc,gasPrice:gasPrice});

  await instance.buyStar(tokenId,{from:buyerAcc, value:balance});
  assert.equal(await instance.ownerOf.call(tokenId),buyerAcc);


});

it('lets user2 buy a star and decreases its balance in ether', async() => {
  let sellerAcc=accounts[2];
  let buyerAcc=accounts[3];
  let tokenId=5;
  let tokenPrice=web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  let gasPrice= web3.utils.toWei("0.00000005", "ether");

  let instance=await StarNotary.deployed();
  await instance.createStar('Star for sell', tokenId, {from:sellerAcc});
  await instance.putStarUpForSale(tokenId,tokenPrice,{from:sellerAcc});
  await instance.approve(buyerAcc,tokenId,{from:sellerAcc,gasPrice:gasPrice});

  let buyerBalanceBefore=await web3.eth.getBalance(buyerAcc);

  await instance.buyStar(tokenId,{from:buyerAcc,value:balance,gasPrice:gasPrice});
  let buyerBalanceAfter=await web3.eth.getBalance(buyerAcc);






  //convert everything to ether for easier calculation
  buyerBalanceBefore=web3.utils.fromWei(String(buyerBalanceBefore), "ether");
  buyerBalanceAfter=web3.utils.fromWei(String(buyerBalanceAfter), "ether");
  tokenPrice=web3.utils.fromWei(String(tokenPrice), "ether");


   let value = Number(buyerBalanceBefore) - Number(buyerBalanceAfter);
     console.log(`value ${value}`)



   roundedValue=(Math.round(value * 100) / 100).toFixed(2);
   console.log(roundedValue)
   //compare with round value.
   assert.equal(roundedValue, tokenPrice);
});
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let tokenId=15;
    let owner=accounts[1];
    let instance=await StarNotary.deployed();
    await instance.createStar('Star for sell', tokenId, {from:owner});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), 'Star');
    assert.equal(await instance.symbol.call(), 'STR');
});

it('lets 2 users exchange stars', async() => {
  let tokenId1=7;
  let tokenId2=8;
  let user1=accounts[2];
  let user2=accounts[3];

    // 1. create 2 Stars with different tokenId

    let instance=await StarNotary.deployed();
    await instance.createStar('StarExchange1', tokenId1, {from:user1});
    await instance.createStar('StarExchange2', tokenId2, {from:user2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
     await instance.exchangeStars(tokenId1,tokenId2,{from:user1});
     assert.equal(await instance.ownerOf.call(tokenId1),user2);
     assert.equal(await instance.ownerOf.call(tokenId2),user1);

    //swap back
      await instance.exchangeStars(tokenId2,tokenId1,{from:user2});
      assert.equal(await instance.ownerOf.call(tokenId2),user2);
      assert.equal(await instance.ownerOf.call(tokenId1),user1);
});
describe('transferStar()', () => {

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let tokenId=9;
    let owner=accounts[2];
    let reciever=accounts[3];
    let instance=await StarNotary.deployed();
    await instance.createStar('StarExchange1', tokenId, {from:owner});
    // 2. use the transferStar function implemented in the Smart Contract
     await instance.transferStar(reciever,tokenId,{from:owner});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(tokenId),reciever);

});
it('does not let a user send a token that does not exist', async() => {
  // 1. create a Star with different tokenId
  let owner=accounts[2];
  let reciever=accounts[3];
  let instance=await StarNotary.deployed();

  //Try to send a token that does not exist
  let tokenId1=10;

  try {
    await instance.transferStar(reciever,tokenId1,{from:owner})
    assert.fail("The transaction should have thrown an error");
} catch(err) {
    assert.include(err.message, "revert", "The error message should contain 'revert'");
}

});
it('does not let a user to transfer a token if he is not the owner', async() => {
  // 1. create a Star with different tokenId
  let owner=accounts[2];
  let falseOwner=accounts[3];
  let reciever=accounts[4];
  let instance=await StarNotary.deployed();

  //Try to send a token that does not exist
  let tokenId=10;
  await instance.createStar('StarExchange1', tokenId, {from:owner});


  try {
    await instance.transferStar(reciever,tokenId,{from:falseOwner})
    assert.fail("The transaction should have thrown an error");
} catch(err) {
    assert.include(err.message, "revert", "The error message should contain 'revert'");
}
});
});

describe('lookUptokenIdToStarInfo()', () => {
it('lookUptokenIdToStarInfo test', async() => {
  let instance=await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let tokenId=11;
    let owner=accounts[1];
    await instance.createStar('Star Test', tokenId, {from:owner});

    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId, {from:owner}), "Star Test");
});
});