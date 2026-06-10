// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title QuestEscrow
 * @dev Implement all functions so `test/QuestEscrow.assessment.test.ts` passes.
 */
contract QuestEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    enum QuestStatus {
        Open,
        Accepted,
        Submitted,
        Completed,
        Cancelled,
        Refunded
    }

    uint256 public constant FEE_BPS = 300;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    uint256 public questCount;
    mapping(address => uint256) public availableFees;

    constructor() Ownable(msg.sender) {}

    function _candidateStub() internal pure {
        revert("QuestEscrow: candidate implementation required");
    }

    struct Quest {
        address poster;
        address worker;
        string title;
        string description;
        uint256 reward;
        address token;
        uint256 acceptDeadline;
        uint256 reviewPeriod;
        uint256 reviewDeadline;
        QuestStatus status;
        string deliverableUri;
    }

    mapping(uint256 => Quest) public quests;

    function createQuest(
        string calldata title,
        string calldata description,
        uint256 reward,
        uint256 acceptDeadline,
        uint256 reviewPeriod,
        address token
    ) external payable returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(reward > 0, "Invalid reward");
        require(acceptDeadline > block.timestamp, "Invalid deadline");

        // ETH quest
        if (token == address(0)) {
            require(msg.value == reward, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH sent for ERC20 quest");
            IERC20(token).safeTransferFrom(msg.sender, address(this), reward);
        }

        uint256 questId = ++questCount;

        quests[questId] = Quest({
            poster: msg.sender,
            worker: address(0),
            title: title,
            description: description,
            reward: reward,
            token: token,
            acceptDeadline: acceptDeadline,
            reviewPeriod: reviewPeriod,
            reviewDeadline: 0,
            status: QuestStatus.Open,
            deliverableUri: ""
        });

        return questId;
    }

    function acceptQuest(uint256 questId) external {
        Quest storage quest = quests[questId];

        require(quest.status == QuestStatus.Open, "Quest not open");
        require(block.timestamp <= quest.acceptDeadline, "Acceptance closed");
        require(msg.sender != quest.poster, "Poster cannot accept");

        quest.worker = msg.sender;
        quest.status = QuestStatus.Accepted;
    }

    function submitWork(
        uint256 questId,
        string calldata deliverableUri
    ) external {
        Quest storage quest = quests[questId];

        require(
            quest.status == QuestStatus.Accepted,
            "Not accepted"
        );

        require(
            msg.sender == quest.worker,
            "Only worker"
        );

        quest.deliverableUri = deliverableUri;

        quest.reviewDeadline =
            block.timestamp + quest.reviewPeriod;

        quest.status = QuestStatus.Submitted;
    }

    function approveAndPay(uint256 questId) external nonReentrant {
        Quest storage quest = quests[questId];

        require(quest.status == QuestStatus.Submitted, "Not submitted");
        require(msg.sender == quest.poster, "Only poster");

        uint256 fee = (quest.reward * FEE_BPS) / BPS_DENOMINATOR;
        uint256 payout = quest.reward - fee;

        availableFees[quest.token] += fee;

        quest.status = QuestStatus.Completed;

        if (quest.token == address(0)) {
            payable(quest.worker).transfer(payout);
        } else {
            IERC20(quest.token).safeTransfer(quest.worker, payout);
        }
    }

    function claimTimeoutPayout(uint256 questId) external nonReentrant {
        Quest storage quest = quests[questId];

        require(quest.status == QuestStatus.Submitted, "Not submitted");
        require(msg.sender == quest.worker, "Only worker");
        require(
            block.timestamp > quest.reviewDeadline,
            "Review period active"
        );

        uint256 fee = (quest.reward * FEE_BPS) / BPS_DENOMINATOR;
        uint256 payout = quest.reward - fee;

        availableFees[quest.token] += fee;

        quest.status = QuestStatus.Completed;

        if (quest.token == address(0)) {
            payable(quest.worker).transfer(payout);
        } else {
            IERC20(quest.token).safeTransfer(quest.worker, payout);
        }
    }

    function cancelQuest(uint256 questId) external nonReentrant {
        Quest storage quest = quests[questId];

        require(quest.status == QuestStatus.Open, "Cannot cancel");
        require(msg.sender == quest.poster, "Only poster");

        quest.status = QuestStatus.Cancelled;

        if (quest.token == address(0)) {
            payable(quest.poster).transfer(quest.reward);
        } else {
            IERC20(quest.token).safeTransfer(quest.poster, quest.reward);
        }
    }

    function refundPoster(uint256 questId) external nonReentrant {
        Quest storage quest = quests[questId];

        require(msg.sender == quest.poster, "Only poster");
        if (quest.status == QuestStatus.Accepted) {
            require(
                block.timestamp > quest.acceptDeadline,
                "Acceptance period active"
            );
        } else if (quest.status == QuestStatus.Submitted) {
            require(
                block.timestamp > quest.reviewDeadline,
                "Review period active"
            );
        } else {
            revert("Invalid status");
        }

        quest.status = QuestStatus.Refunded;

        if (quest.token == address(0)) {
            payable(quest.poster).transfer(quest.reward);
        } else {
            IERC20(quest.token).safeTransfer(quest.poster, quest.reward);
        }
    }

    function withdrawFees(address token) external onlyOwner nonReentrant {
        uint256 amount = availableFees[token];

        require(amount > 0, "No fees available");

        availableFees[token] = 0;

        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    function getAvailableFees(address token)
        external
        view
        returns (uint256)
    {
        return availableFees[token];
    }

    function getQuest(uint256 questId)
        external
        view
        returns (Quest memory)
    {
        require(
            questId > 0 && questId <= questCount,
            "Quest does not exist"
        );

        return quests[questId];
    }
}
