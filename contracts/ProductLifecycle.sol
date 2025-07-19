// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductLifecycle {
    address public owner;

    enum Role { None, Manufacturer, Dealer, Customer, WarrantyCenter }
    mapping(address => Role) public roles;

    struct Product {
        string productId;
        string info;
        address currentOwner;
        bool exists;
        uint256 createdAt;
        uint256 lastModified;
        bool isSuspicious;
        string suspiciousReason;
    }

    struct ProductEventRecord {
        string productId;
        string action; // "Created", "Transferred", "Warranty", "Repair"
        address actor;
        uint256 timestamp;
        string note;
        address newOwner;
        bool isSuspicious;
        string suspiciousReason;
    }

    mapping(string => Product) public products;
    mapping(string => ProductEventRecord[]) public productHistory;
    mapping(string => bool) public duplicateProducts;
    mapping(address => uint256) public userActivityCount;
    mapping(address => uint256) public lastActivityTime;

    // Anti-counterfeit thresholds
    uint256 public constant SUSPICIOUS_TIME_THRESHOLD = 60; // 1 minute (giảm từ 5 phút)
    uint256 public constant MAX_ACTIVITY_PER_HOUR = 100; // Tăng từ 50 lên 100
    uint256 public constant SUSPICIOUS_TRANSFER_THRESHOLD = 10; // transfers in 1 hour

    event ProductEvent(
        string productId,
        string action,
        address indexed actor,
        uint256 timestamp,
        string note,
        address indexed newOwner,
        bool isSuspicious,
        string suspiciousReason
    );
    event RoleGranted(address indexed user, Role role);
    event SuspiciousActivityDetected(
        string productId,
        address actor,
        string reason,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can do this");
        _;
    }
    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r, "Your role is not allowed");
        _;
    }
    modifier onlyProductOwner(string memory _id) {
        require(products[_id].currentOwner == msg.sender, "You are not the product owner");
        _;
    }
    modifier productExists(string memory _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.Manufacturer;
    }

    function grantRole(address user, Role role) public onlyOwner {
        require(role != Role.None, "Invalid role");
        roles[user] = role;
        emit RoleGranted(user, role);
    }

    function removeRole(address user) public onlyRole(Role.Manufacturer) {
        require(user != msg.sender, "Cannot remove your own role");
        roles[user] = Role.None;
        emit RoleGranted(user, Role.None);
    }

    function createProduct(string memory _id, string memory _info) public onlyRole(Role.Manufacturer) {
        require(!products[_id].exists, "Product already exists");
        require(bytes(_id).length > 0, "Product ID cannot be empty");
        require(bytes(_info).length > 0, "Product info cannot be empty");
        
        // Check for duplicate patterns
        bool isDuplicate = _checkDuplicatePattern(_id);
        
        // Update user activity
        _updateUserActivity(msg.sender);
        
        // DISABLE suspicious check for product creation (for demo purposes)
        bool isSuspicious = false; // Always false for creation
        string memory suspiciousReason = "";
        
        products[_id] = Product(
            _id, 
            _info, 
            msg.sender, 
            true, 
            block.timestamp, 
            block.timestamp,
            isSuspicious,
            suspiciousReason
        );
        
        _addHistory(_id, "Created", msg.sender, "Created", msg.sender, isSuspicious, suspiciousReason);
    }

    function transferProduct(string memory _id, address _to, string memory _note) public productExists(_id) onlyProductOwner(_id) {
        require(_to != address(0), "Invalid address");
        require(_to != msg.sender, "Cannot transfer to yourself");
        
        Role senderRole = roles[msg.sender];
        Role receiverRole = roles[_to];
        
        // Business logic validation
        if (senderRole == Role.Manufacturer) {
            require(
                receiverRole == Role.Dealer || receiverRole == Role.Customer,
                "Manufacturer can only transfer to Dealer or Customer"
            );
        } else if (senderRole == Role.Dealer) {
            require(
                receiverRole == Role.Dealer || receiverRole == Role.Customer,
                "Dealer can only transfer to Dealer or Customer"
            );
        } else if (senderRole == Role.Customer) {
            require(
                receiverRole == Role.WarrantyCenter,
                "Customer can only transfer to Warranty Center for warranty"
            );
        } else {
            revert("This role cannot transfer product");
        }
        
        // Anti-counterfeit checks
        bool isSuspicious = _checkSuspiciousTransfer(_id, msg.sender, _to);
        string memory suspiciousReason = "";
        
        if (isSuspicious) {
            suspiciousReason = "Suspicious transfer pattern detected";
            products[_id].isSuspicious = true;
            products[_id].suspiciousReason = suspiciousReason;
        }
        
        // Update product
        products[_id].currentOwner = _to;
        products[_id].lastModified = block.timestamp;
        
        // Update user activity
        _updateUserActivity(msg.sender);
        _updateUserActivity(_to);
        
        _addHistory(_id, "Transferred", msg.sender, _note, _to, isSuspicious, suspiciousReason);
        
        if (isSuspicious) {
            emit SuspiciousActivityDetected(_id, msg.sender, suspiciousReason, block.timestamp);
        }
    }

    function warrantyProduct(string memory _id, string memory _note) public productExists(_id) onlyProductOwner(_id) onlyRole(Role.WarrantyCenter) {
        // Check for suspicious activity (rate limiting)
        bool isSuspicious = _checkSuspiciousActivity(msg.sender, "warranty") || _checkSuspiciousWarranty(_id);
        string memory suspiciousReason = "";
        
        if (isSuspicious) {
            suspiciousReason = "Suspicious warranty activity detected";
            products[_id].isSuspicious = true;
            products[_id].suspiciousReason = suspiciousReason;
        }
        
        _updateUserActivity(msg.sender);
        _addHistory(_id, "Warranty", msg.sender, _note, products[_id].currentOwner, isSuspicious, suspiciousReason);
        
        if (isSuspicious) {
            emit SuspiciousActivityDetected(_id, msg.sender, suspiciousReason, block.timestamp);
        }
    }

    function repairProduct(string memory _id, string memory _note) public productExists(_id) onlyProductOwner(_id) onlyRole(Role.WarrantyCenter) {
        // Check for suspicious activity (rate limiting)
        bool isSuspicious = _checkSuspiciousActivity(msg.sender, "repair") || _checkSuspiciousRepair(_id);
        string memory suspiciousReason = "";
        
        if (isSuspicious) {
            suspiciousReason = "Suspicious repair activity detected";
            products[_id].isSuspicious = true;
            products[_id].suspiciousReason = suspiciousReason;
        }
        
        _updateUserActivity(msg.sender);
        _addHistory(_id, "Repair", msg.sender, _note, products[_id].currentOwner, isSuspicious, suspiciousReason);
        
        if (isSuspicious) {
            emit SuspiciousActivityDetected(_id, msg.sender, suspiciousReason, block.timestamp);
        }
    }

    // Anti-counterfeit detection functions
    function _checkDuplicatePattern(string memory _id) internal view returns (bool) {
        // Check if similar product IDs exist (basic pattern matching)
        return duplicateProducts[_id];
    }

    function _checkSuspiciousActivity(address _user, string memory _action) internal view returns (bool) {
        // Skip check for first activity (new user)
        if (lastActivityTime[_user] == 0) {
            return false;
        }
        
        // Check if user has too much activity in short time (more strict)
        if (userActivityCount[_user] > 20) { // Giảm từ 100 xuống 20
            return true;
        }
        
        // Check if actions are too frequent (more strict)
        if (block.timestamp - lastActivityTime[_user] < 30) { // Giảm từ 60 xuống 30 giây
            return true;
        }
        
        return false;
    }

    function _checkSuspiciousTransfer(string memory _id, address _from, address _to) internal view returns (bool) {
        // Check if product was transferred too many times recently
        uint256 transferCount = 0;
        uint256 oneHourAgo = block.timestamp - 3600;
        
        for (uint256 i = 0; i < productHistory[_id].length; i++) {
            if (keccak256(bytes(productHistory[_id][i].action)) == keccak256(bytes("Transferred")) && 
                productHistory[_id][i].timestamp > oneHourAgo) {
                transferCount++;
            }
        }
        
        return transferCount > SUSPICIOUS_TRANSFER_THRESHOLD;
    }

    function _checkSuspiciousWarranty(string memory _id) internal view returns (bool) {
        // Check if warranty was requested too soon after transfer
        if (productHistory[_id].length > 0) {
            ProductEventRecord storage lastRecord = productHistory[_id][productHistory[_id].length - 1];
            if (keccak256(bytes(lastRecord.action)) == keccak256(bytes("Transferred")) && 
                block.timestamp - lastRecord.timestamp < 3600) { // Less than 1 hour
                return true;
            }
        }
        
        // Check for warranty spam (more than 2 warranties in 5 minutes)
        uint256 warrantyCount = 0;
        uint256 fiveMinutesAgo = block.timestamp - 300;
        
        for (uint256 i = 0; i < productHistory[_id].length; i++) {
            if (keccak256(bytes(productHistory[_id][i].action)) == keccak256(bytes("Warranty")) && 
                productHistory[_id][i].timestamp > fiveMinutesAgo) {
                warrantyCount++;
            }
        }
        
        return warrantyCount > 2; // More than 2 warranties in 5 minutes
    }

    function _checkSuspiciousRepair(string memory _id) internal view returns (bool) {
        // Check for unusual repair patterns
        uint256 repairCount = 0;
        uint256 oneDayAgo = block.timestamp - 86400;
        
        for (uint256 i = 0; i < productHistory[_id].length; i++) {
            if (keccak256(bytes(productHistory[_id][i].action)) == keccak256(bytes("Repair")) && 
                productHistory[_id][i].timestamp > oneDayAgo) {
                repairCount++;
            }
        }
        
        // Check for repair spam (more than 2 repairs in 5 minutes)
        uint256 recentRepairCount = 0;
        uint256 fiveMinutesAgo = block.timestamp - 300;
        
        for (uint256 i = 0; i < productHistory[_id].length; i++) {
            if (keccak256(bytes(productHistory[_id][i].action)) == keccak256(bytes("Repair")) && 
                productHistory[_id][i].timestamp > fiveMinutesAgo) {
                recentRepairCount++;
            }
        }
        
        return repairCount > 3 || recentRepairCount > 2; // More than 3 repairs in 1 day OR more than 2 repairs in 5 minutes
    }

    function _updateUserActivity(address _user) internal {
        uint256 oneHourAgo = block.timestamp - 3600;
        
        // Reset count if it's been more than 1 hour
        if (lastActivityTime[_user] < oneHourAgo) {
            userActivityCount[_user] = 1;
        } else {
            // Rate limiting: minimum 10 seconds between actions
            require(block.timestamp - lastActivityTime[_user] >= 10, "Action too frequent. Please wait 10 seconds.");
            userActivityCount[_user]++;
        }
        
        lastActivityTime[_user] = block.timestamp;
    }

    function _addHistory(string memory _id, string memory _action, address _actor, string memory _note, address _newOwner, bool _isSuspicious, string memory _suspiciousReason) internal {
        productHistory[_id].push(ProductEventRecord(
            _id,
            _action,
            _actor,
            block.timestamp,
            _note,
            _newOwner,
            _isSuspicious,
            _suspiciousReason
        ));
        emit ProductEvent(_id, _action, _actor, block.timestamp, _note, _newOwner, _isSuspicious, _suspiciousReason);
    }

    // View functions
    function getProduct(string memory _id) public view productExists(_id) returns (
        string memory, string memory, address, uint256 historyCount, bool isSuspicious, string memory suspiciousReason
    ) {
        Product storage p = products[_id];
        return (p.productId, p.info, p.currentOwner, productHistory[_id].length, p.isSuspicious, p.suspiciousReason);
    }

    function getProductHistoryLength(string memory _id) public view productExists(_id) returns (uint256) {
        return productHistory[_id].length;
    }

    function getProductHistoryRecord(string memory _id, uint256 idx) public view productExists(_id) returns (
        string memory, address, uint256, string memory, address, bool, string memory
    ) {
        require(idx < productHistory[_id].length, "Index out of bounds");
        ProductEventRecord storage rec = productHistory[_id][idx];
        return (rec.action, rec.actor, rec.timestamp, rec.note, rec.newOwner, rec.isSuspicious, rec.suspiciousReason);
    }

    function isProductSuspicious(string memory _id) public view productExists(_id) returns (bool) {
        return products[_id].isSuspicious;
    }

    function getSuspiciousReason(string memory _id) public view productExists(_id) returns (string memory) {
        return products[_id].suspiciousReason;
    }

    // Function to clear suspicious status (for demo purposes)
    function clearSuspiciousStatus(string memory _id) public onlyRole(Role.Manufacturer) productExists(_id) {
        products[_id].isSuspicious = false;
        products[_id].suspiciousReason = "";
        emit ProductEvent(_id, "SuspiciousStatusCleared", msg.sender, block.timestamp, "Suspicious status cleared", products[_id].currentOwner, false, "");
    }
} 