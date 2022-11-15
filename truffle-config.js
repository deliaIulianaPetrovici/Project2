require('dotenv').config();
   const HDWalletProvider = require('@truffle/hdwallet-provider');
   const { INFURA_API_KEY, MNEMONIC } = process.env;


module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */


     networks: {
       development: {
         host: "127.0.0.1",
         port: 7545,
         network_id: "*"
       },
       develop: {
        port: 7545
      },
       goerli: {
         provider: () => new HDWalletProvider(MNEMONIC, INFURA_API_KEY),
         network_id: '5',
         gas: 4465030
       }
     },


  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.13",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
