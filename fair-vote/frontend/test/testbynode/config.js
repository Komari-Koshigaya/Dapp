// 引入 VoteRepository.json 里面包括 abi信息
let VoteRepository = require('./Vote')
let VoteFactoryRepository = require('./VoteFactory')
let Web3 = require("web3")

let VOTEFACTORY_ADDRESS = VoteFactoryRepository.networks['5777'].address;
// let JSONRPC_ENDPOINT = 'http://192.168.1.102:8545';
let JSONRPC_WS_ENDPOINT = 'ws://192.168.1.102:8545';
let web3,voteFactoryInstance,defaultAccount = '0x586c9d66cDf6274a7ea9F4CAe0bdB2087cB929C7';



let init = _=> {
   //初始化Web3  连接本地私有链
   if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // web3 = new Web3(new Web3.providers.HttpProvider(JSONRPC_ENDPOINT));
        web3 = new Web3(new Web3.providers.WebsocketProvider(JSONRPC_WS_ENDPOINT));
    }

    // 获取 合约对象
    voteFactoryInstance = new web3.eth.Contract(VoteFactoryRepository.abi,VOTEFACTORY_ADDRESS)
    console.log(voteFactoryInstance);

    //设置默认账户地址
    web3.eth.getAccounts().then((accounts) => {
        defaultAccount = accounts[0]
        console.log( "连接区块链成功，设置默认账号：" + defaultAccount );
    });
};
init()

//CommonJS 规范 暴露初始化函数
module.exports = {
  web3: web3,
  voteFactoryInstance: voteFactoryInstance,
  defaultAccount: defaultAccount
}
