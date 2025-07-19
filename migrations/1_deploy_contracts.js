const ProductLifecycle = artifacts.require("ProductLifecycle");
 
module.exports = function (deployer) {
  deployer.deploy(ProductLifecycle);
}; 