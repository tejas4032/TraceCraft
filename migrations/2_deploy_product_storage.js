const BatchSupply = artifacts.require("BatchSupply");

module.exports = function (deployer) {
  // Deploy the ProductNewTrack contract
  deployer.deploy(BatchSupply);
};