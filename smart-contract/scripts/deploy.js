require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const signer = wallet.connect(ethers.provider);

  const name = "LoyaltyToken";
  const symbol = "LOY";  

  console.log("Deploying contracts with the account:", signer.address);

  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  
  const loyaltyToken = await LoyaltyToken.connect(signer).deploy(
    name, 
    symbol,
    signer.address
  );

  console.log("LoyaltyToken deployed to:", loyaltyToken.target);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });