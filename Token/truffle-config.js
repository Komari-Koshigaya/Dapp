module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    ganache: {
      host: "169.254.255.227",
      port: 7545,
      network_id: "5777" // 自定义
    },
    development: {
      host: "222.201.139.45",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    }
  },
  //设置solidity编译器版本号
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
};
