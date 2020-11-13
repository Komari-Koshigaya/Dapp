// let VoteFactoryRepository = VoteRepository;
let VOTEFACTORY_ADDRESS = VoteFactoryRepository.networks['5777'].address
// let JSONRPC_ENDPOINT = 'http://192.168.1.102:8545';
let JSONRPC_WS_ENDPOINT = 'ws://192.168.1.102:8545';
let web3,voteFactoryInstance,defaultAccount = '0x586c9d66cDf6274a7ea9F4CAe0bdB2087cB929C7';
        


(_=>{
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
})();



let testContractConn = _=>{
  //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
  voteFactoryInstance.methods.CreateVote('test vote',2,8,1617255905,1617355905,1617455905,1617515905,1617555905)
  .send({from: defaultAccount}) 
  // //Error: No "from" address specified in neither the given options, nor the default options.
  // //上述错误是由于defaultAccount 为空
  .on('receipt', function(receipt){
      console.log(receipt)
      //交易发送成功后，获取 votelist
      voteFactoryInstance.methods.GetVoteList()
      .call({from: defaultAccount})
      .on('receipt', function(receipt){
          console.log('get the list:' + receipt)
      });
  })
  .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.error(error)
  });
};
testContractConn();


console.log("'hello'的keccak256(Web3.js库)的值是- " + web3.utils.keccak256('hello'))




