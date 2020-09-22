var METoken = artifacts.require("METoken")

module.exports = function (deployer) {
	deployer.deploy(METoken);
}