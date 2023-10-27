require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");


const API_KEY = process.env.API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API = process.env.ETHERSCAN_API

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  // networks: {
  //   hardhat: {},
  //   goerli: {
  //     url: "https://goerli.infura.io/v3/your-infura-key" 
  //   }
  // }

  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`,
      accounts: [String(PRIVATE_KEY)],

    }
  },
  etherscan: {
    apiKey: String(ETHERSCAN_API)
  }
};
