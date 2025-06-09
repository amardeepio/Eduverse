// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LearningRecord {
    struct Achievement {
        string moduleName;
        uint256 timestamp;
    }

    mapping(address => Achievement[]) public achievements;
    address public owner;

    event AchievementUnlocked(address indexed user, string moduleName, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addAchievement(address _user, string calldata _moduleName) external onlyOwner {
        achievements[_user].push(Achievement(_moduleName, block.timestamp));
        emit AchievementUnlocked(_user, _moduleName, block.timestamp);
    }

    function getAchievements(address _user) external view returns (Achievement[] memory) {
        return achievements[_user];
    }
}