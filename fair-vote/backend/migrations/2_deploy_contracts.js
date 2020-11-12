var VoteFactory = artifacts.require("VoteFactory");

module.exports = function(deployer) {
  deployer.deploy(VoteFactory);
};