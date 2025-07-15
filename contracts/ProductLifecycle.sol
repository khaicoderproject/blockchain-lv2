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
    }

    struct ProductEventRecord {
        string productId;
        string action; // "Created", "Transferred", "Warranty", "Repair"
        address actor;
        uint256 timestamp;
        string note;
        address newOwner;
    }

    mapping(string => Product) public products;
    mapping(string => ProductEventRecord[]) public productHistory;

    event ProductEvent(
        string productId,
        string action,
        address indexed actor,
        uint256 timestamp,
        string note,
        address indexed newOwner
    );
    event RoleGranted(address indexed user, Role role);

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
        products[_id] = Product(_id, _info, msg.sender, true);
        _addHistory(_id, "Created", msg.sender, "Created", msg.sender);
    }

    function transferProduct(string memory _id, address _to, string memory _note) public productExists(_id) onlyProductOwner(_id) {
        Role senderRole = roles[msg.sender];
        Role receiverRole = roles[_to];
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
        require(_to != address(0), "Invalid address");
        products[_id].currentOwner = _to;
        _addHistory(_id, "Transferred", msg.sender, _note, _to);
    }

    function warrantyProduct(string memory _id, string memory _note) public productExists(_id) onlyProductOwner(_id) onlyRole(Role.WarrantyCenter) {
        _addHistory(_id, "Warranty", msg.sender, _note, products[_id].currentOwner);
    }

    function repairProduct(string memory _id, string memory _note) public productExists(_id) onlyProductOwner(_id) onlyRole(Role.WarrantyCenter) {
        _addHistory(_id, "Repair", msg.sender, _note, products[_id].currentOwner);
    }

    function getProduct(string memory _id) public view productExists(_id) returns (
        string memory, string memory, address, uint256 historyCount
    ) {
        Product storage p = products[_id];
        return (p.productId, p.info, p.currentOwner, productHistory[_id].length);
    }

    function getProductHistoryLength(string memory _id) public view productExists(_id) returns (uint256) {
        return productHistory[_id].length;
    }

    function getProductHistoryRecord(string memory _id, uint256 idx) public view productExists(_id) returns (
        string memory, address, uint256, string memory, address
    ) {
        require(idx < productHistory[_id].length, "Index out of bounds");
        ProductEventRecord storage rec = productHistory[_id][idx];
        return (rec.action, rec.actor, rec.timestamp, rec.note, rec.newOwner);
    }

    function _addHistory(string memory _id, string memory _action, address _actor, string memory _note, address _newOwner) internal {
        productHistory[_id].push(ProductEventRecord(
            _id,
            _action,
            _actor,
            block.timestamp,
            _note,
            _newOwner
        ));
        emit ProductEvent(_id, _action, _actor, block.timestamp, _note, _newOwner);
    }
} 