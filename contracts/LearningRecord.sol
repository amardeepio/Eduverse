// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// --- FINAL FIX: The Ecrecover library code is now included directly in this file ---
/**
 * @dev Recover signer address from a message by using their signature
 * @author BuidlGuidl
 * @custom:see-also {https://github.com/BuidlGuidl/Ecrecover}
 */
library Ecrecover {
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }
            return ecrecover(hash, v, r, s);
        } else {
            revert("Ecrecover: invalid signature length");
        }
    }

    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}


// --- Your main contract begins here ---

contract LearningRecord {
    // Using the Ecrecover library we just defined above
    using Ecrecover for bytes32;

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

    function addAchievementWithSignature(
        address _user,
        string calldata _moduleName,
        bytes calldata _signature
    ) external onlyOwner {
        bytes32 messageHash = keccak256(abi.encodePacked("complete-module:", _moduleName));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(_signature);

        require(signer == _user, "Invalid signature");
        require(signer != address(0), "Invalid signature recovery");

        _logAchievement(_user, _moduleName);
    }
    
    function _logAchievement(address _user, string memory _moduleName) private {
        achievements[_user].push(Achievement(_moduleName, block.timestamp));
        emit AchievementUnlocked(_user, _moduleName, block.timestamp);
    }

    function getAchievements(address _user) external view returns (Achievement[] memory) {
        return achievements[_user];
    }
}
