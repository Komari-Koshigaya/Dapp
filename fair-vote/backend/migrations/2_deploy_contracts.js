// var Vote = artifacts.require("Vote");
var VoteFactory = artifacts.require("VoteFactory");

module.exports = function(deployer) {
  //先部署 引入的vote合约
  //Vote合约的构造函数需要参数，部署脚本没有参数时，会报错  Uncaught Error: Invalid number of parameters for "undefined". Got 0 expected 9!
  // deployer.deploy(Vote);
  // // deployer.deploy(Vote, '0x123456B4A7f031d9E9a8E781023b537f051447Ad','deploy',1,2,1617255905,1617355905,1617455905,1617655905,1617755905);
  // //再将vote合约与voteFactory合约链接
  // deployer.link(Vote, VoteFactory);

  //最后部署votefactory合约
  deployer.deploy(VoteFactory);
};

