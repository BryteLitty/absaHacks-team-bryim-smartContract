require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    goerli: {
      url: "https://goerli.infura.io/v3/your-infura-key" 
    }
  }

  // networks: {
  //   hardhat: {},
  //   sepolia: {
  //     url: "https://sepolia.infura.io/v3/your-infura-key"
  //   }
  // }  
};
