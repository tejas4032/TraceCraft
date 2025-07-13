// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BatchSupply {
    // Define a struct for the Batch
    struct Batch {
        uint256 id;
        string name;
        uint256 price;
        string manufacturerName;
        string manufacturerDetails;
        string longitude;
        string latitude;
        string category;
        address manufacturer; // Store the address of the manufacturer
        string certificateAuthority; // Name of the certificate provider
        string digitalSignature; // Digital signature of CA
        string certificateDocHash; // IPFS hash of the certificate document
        bool isCertified; // Certification status
    }

    // Define a struct for the Product
    struct Product {
    uint256 id;
    uint256 batchId;
    Batch batchDetails;
    address manufacturer;
    address logisticsPartner;
    address customer;
    string customerName; // Customer's name
    string customerAddress; // Customer's address
    string customerPhoneNumber; // Customer's phone number
    string customerEmail; // Customer's email
    string deliveryStatus;
    string certificateAuthority;
    string digitalSignature;
    string certificateDocHash;
    bool isCertified;
    Checkpoint[] checkpoints;
}


    // Define a struct for the Checkpoints
    struct Checkpoint {
        string location;
        string longitude;
        string latitude;
        uint256 checkInTime;
        uint256 checkOutTime;
    }

    // Mapping to store batches by their ID
    mapping(uint256 => Batch) private batches;

    // Mapping to store products by their ID
    mapping(uint256 => Product) private products;

    // Array to store all batch IDs
    uint256[] private batchIds;

    // Array to store all product IDs
    uint256[] private productIds;

    // Events
    event ProductAdded(
    uint256 productId,
    uint256 batchId,
    string customerName,
    string customerAddress,
    string customerPhoneNumber,
    string customerEmail
);

    event BatchCreated(
        uint256 batchId,
        string name,
        uint256 price,
        string manufacturerName,
        string manufacturerDetails,
        string longitude,
        string latitude,
        string category
    );

    event BatchCertified(
        uint256 batchId,
        string certificateAuthority,
        string certificateDocHash
    );

    event ProductAssignedToCourier(
        uint256 productId,
        address logisticsPartner
    );

    event ProductDelivered(
        uint256 productId,
        string deliveryStatus,
        address logisticsPartner
    );

    event ProductAssignedToCustomer(
        uint256 productId,
        address customer
    );

    event CheckpointAdded(
        uint256 productId,
        string location,
        string longitude,
        string latitude,
        uint256 checkInTime,
        uint256 checkOutTime
    );

    // Function to add a product
    function addProduct(
    uint256 _productId,
    uint256 _batchId,
    string memory _customerName,
    string memory _customerAddress,
    string memory _customerPhoneNumber,
    string memory _customerEmail
) public {
    // Ensure the product does not already exist
    require(products[_productId].id == 0, "Product with this ID already exists.");

    // Ensure the batch exists
    require(batches[_batchId].id != 0, "Batch with this ID does not exist.");

    // Create the product and link the batch details
    Product storage newProduct = products[_productId];
    newProduct.id = _productId;
    newProduct.batchId = _batchId;
    newProduct.batchDetails = batches[_batchId];
    newProduct.manufacturer = msg.sender;
    newProduct.logisticsPartner = address(0);
    newProduct.customer = address(0);
    newProduct.customerName = _customerName; // Store customer name
    newProduct.customerAddress = _customerAddress; // Store customer address
    newProduct.customerPhoneNumber = _customerPhoneNumber; // Store customer phone number
    newProduct.customerEmail = _customerEmail; // Store customer email
    newProduct.deliveryStatus = "";
    newProduct.certificateAuthority = "";
    newProduct.digitalSignature = "";
    newProduct.certificateDocHash = "";
    newProduct.isCertified = false;

    productIds.push(_productId);

    // Emit event to log the product addition
    emit ProductAdded(
    _productId,
    _batchId,
    _customerName,
    _customerAddress,
    _customerPhoneNumber,
    _customerEmail
);

}


    // Function to create a batch
    function addBatch(
        uint256 _id,
        string memory _name,
        uint256 _price,
        string memory _manufacturerName,
        string memory _manufacturerDetails,
        string memory _longitude,
        string memory _latitude,
        string memory _category
    ) public {
        require(batches[_id].id == 0, "Batch with this ID already exists.");

        Batch storage newBatch = batches[_id];
        newBatch.id = _id;
        newBatch.name = _name;
        newBatch.price = _price;
        newBatch.manufacturerName = _manufacturerName;
        newBatch.manufacturerDetails = _manufacturerDetails;
        newBatch.longitude = _longitude;
        newBatch.latitude = _latitude;
        newBatch.category = _category;
        newBatch.manufacturer = msg.sender;
        newBatch.isCertified = false;

        batchIds.push(_id);

        // Emit event for batch creation
        emit BatchCreated(_id, _name, _price, _manufacturerName, _manufacturerDetails, _longitude, _latitude, _category);
    }

    // Function to add a product to a batch
    // Function to add a product to a batch
function addProductToBatch(
    uint256 _batchId,
    uint256 _productId
) public {
    require(batches[_batchId].id != 0, "Batch does not exist.");
    require(products[_productId].id != 0, "Product does not exist.");

    // Link product to the batch
    products[_productId].batchId = _batchId;

    // Emit event to log the product addition to batch
    emit ProductAdded(
        _productId,
        _batchId,
        products[_productId].customerName,
        products[_productId].customerAddress,
        products[_productId].customerPhoneNumber,
        products[_productId].customerEmail
    );
}


    // Function to certify a batch
    function certifyBatch(
        uint256 _batchId,
        string memory _certificateAuthority,
        string memory _digitalSignature,
        string memory _certificateDocHash
    ) public {
        require(batches[_batchId].id != 0, "Batch does not exist.");
        require(!batches[_batchId].isCertified, "Batch is already certified.");

        batches[_batchId].certificateAuthority = _certificateAuthority;
        batches[_batchId].digitalSignature = _digitalSignature;
        batches[_batchId].certificateDocHash = _certificateDocHash;
        batches[_batchId].isCertified = true;

        // Emit event to log batch certification
        emit BatchCertified(_batchId, _certificateAuthority, _certificateDocHash);
    }

    // Function for logistics partner to assign themselves to a product
    function assignCourier(uint256 _productId) public {
        require(products[_productId].id != 0, "Product does not exist.");
        require(batches[products[_productId].batchId].isCertified, "Product batch must be certified before assigning a courier.");
        require(products[_productId].logisticsPartner == address(0), "Product already assigned to a logistics partner.");

        products[_productId].logisticsPartner = msg.sender;

        emit ProductAssignedToCourier(_productId, msg.sender);
    }

    // Function to add a checkpoint for a product
    function addCheckpoint(
        uint256 _productId,
        string memory _location,
        string memory _longitude,
        string memory _latitude,
        uint256 _checkInTime,
        uint256 _checkOutTime
    ) public {
        require(products[_productId].id != 0, "Product does not exist.");
        require(products[_productId].logisticsPartner == msg.sender, "Only the assigned logistics partner can add checkpoints.");

        products[_productId].checkpoints.push(Checkpoint(_location, _longitude, _latitude, _checkInTime, _checkOutTime));

        emit CheckpointAdded(_productId, _location, _longitude, _latitude, _checkInTime, _checkOutTime);
    }

    // Function for logistics partner to mark the product as delivered
    function markAsDelivered(uint256 _productId, string memory _deliveryStatus) public {
        require(products[_productId].id != 0, "Product does not exist.");
        require(products[_productId].logisticsPartner == msg.sender, "Only the assigned logistics partner can mark as delivered.");
        require(bytes(products[_productId].deliveryStatus).length == 0, "Product has already been delivered.");

        products[_productId].deliveryStatus = _deliveryStatus;

        emit ProductDelivered(_productId, _deliveryStatus, msg.sender);
    }

    // Function to assign a product to the customer
 function assignToCustomer(uint256 _productId, address _customer) public {
    require(products[_productId].id != 0, "Product does not exist.");
    require(batches[products[_productId].batchId].manufacturer == msg.sender, "Only the manufacturer can assign the product to a customer.");
    require(bytes(products[_productId].deliveryStatus).length != 0, "Product must be delivered before assigning to customer.");
    
    // Optionally, add a check for whether the delivery status is 'delivered' or 'shipped'
    require(keccak256(bytes(products[_productId].deliveryStatus)) == keccak256(bytes("delivered")), "Product must be delivered before assignment.");
    
    products[_productId].customer = _customer;

    emit ProductAssignedToCustomer(_productId, _customer);
}


    // Function to get a batch by ID
    function getBatch(uint256 _id) public view returns (Batch memory) {
        require(batches[_id].id != 0, "Batch not found.");
        return batches[_id];
    }


    // Function to get a product by ID
    function getProduct(uint256 _id) public view returns (Product memory) {
        require(products[_id].id != 0, "Product not found.");
        return products[_id];
    }

    // Function to get all product IDs
    function getAllProductIds() public view returns (uint256[] memory) {
        return productIds;
    }

    // Function to get all batch IDs
    function getAllBatchIds() public view returns (uint256[] memory) {
        return batchIds;
    }

    // Function to get all checkpoints for a specific product
    function getCheckpoints(uint256 _productId) public view returns (
        string[] memory locations,
        string[] memory longitudes,
        string[] memory latitudes,
        uint256[] memory checkInTimes,
        uint256[] memory checkOutTimes
    ) {
        require(products[_productId].id != 0, "Product does not exist.");

        uint256 checkpointCount = products[_productId].checkpoints.length;
        locations = new string[](checkpointCount);
        longitudes = new string[](checkpointCount);
        latitudes = new string[](checkpointCount);
        checkInTimes = new uint256[](checkpointCount);
        checkOutTimes = new uint256[](checkpointCount);

        for (uint256 i = 0; i < checkpointCount; i++) {
            Checkpoint memory checkpoint = products[_productId].checkpoints[i];
            locations[i] = checkpoint.location;
            longitudes[i] = checkpoint.longitude;
            latitudes[i] = checkpoint.latitude;
            checkInTimes[i] = checkpoint.checkInTime;
            checkOutTimes[i] = checkpoint.checkOutTime;
        }
    }

    function getCustomerDetails(uint256 _productId) public view returns (
    string memory customerName,
    string memory customerAddress,
    string memory customerPhoneNumber,
    string memory customerEmail
) {
    require(products[_productId].id != 0, "Product does not exist.");
    Product storage product = products[_productId];
    
    return (product.customerName, product.customerAddress, product.customerPhoneNumber, product.customerEmail);
}


    
}
