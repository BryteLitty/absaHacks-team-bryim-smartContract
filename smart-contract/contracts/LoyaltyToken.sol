// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoyaltyToken is ERC20, Ownable {
    // Rewards point scaling factor (e.g., 1 point = 0.01 token)
    uint256 public scalingFactor = 100;

    // Mapping of user addresses to their loyalty points
    mapping(address => uint256) public loyaltyPoints;

    constructor(
        string memory _name,
        string memory _symbol,
        address initialOwner
    ) ERC20(_name, _symbol) Ownable(initialOwner) {
        // Mint an initial supply to the contract owner
        _mint(initialOwner, 1000000 * 10**decimals());
    }

    // Mint new tokens (only the owner can call this)
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    // Add loyalty points to a user's balance
    function addLoyaltyPoints(address user, uint256 points) public onlyOwner {
        transfer( user, points);
        loyaltyPoints[user] += points;
    }

    // Redeem loyalty points for tokens
    function redeemLoyaltyPoints(uint256 points) public {
        require(loyaltyPoints[msg.sender] >= points, "Insufficient loyalty points");
        // uint256 tokensToTransfer = points * scalingFactor;
        // require(balanceOf(owner()) >= tokensToTransfer, "Contract does not have enough tokens to redeem");

        // // Transfer tokens from the contract to the user
        // transferFrom(owner(), msg.sender, tokensToTransfer);

        // Deduct the redeemed points from the user's balance
        loyaltyPoints[msg.sender] -= points;
    }

    // Allow users to check their loyalty points balance
    function checkLoyaltyPoints() public view returns (uint256) {
        return loyaltyPoints[msg.sender];
    }
}
