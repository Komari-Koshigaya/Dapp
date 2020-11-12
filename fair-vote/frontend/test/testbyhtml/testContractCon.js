let VoteFactoryRepository = VoteRepository;
let VoteFactory_ADDRESS = VoteFactoryRepository.networks['5777'].address
let JSONRPC_ENDPOINT = 'http://192.168.1.102:8545';
let JSONRPC_WS_ENDPOINT = 'ws://192.168.1.102:8545';
let web3,contractInstance,defaultAccount;
        


(_=>{
   //初始化Web3  连接本地私有链
   if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // web3 = new Web3(new Web3.providers.HttpProvider(JSONRPC_ENDPOINT));
        web3 = new Web3(new Web3.providers.WebsocketProvider(JSONRPC_WS_ENDPOINT));
    }

    // 获取 合约对象
    contractInstance = new web3.eth.Contract(VoteRepository.abi,VoteFactory_ADDRESS)
    console.log(contractInstance);

    //设置默认账户地址
    web3.eth.getAccounts().then((accounts) => {
      defaultAccount = accounts[0]
        console.log( "连接区块链成功，设置默认账号：" + defaultAccount );
    });
})();



let testContractConn = _=>{
  //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
  contractInstance.methods.CreateVote('vote teacher',1616555905,1617155905,1617255905,1617355905,1617455905,1617515905,1617555905)
  // .send({from: defaultAccount}) 
  //Error: No "from" address specified in neither the given options, nor the default options.
  //上述错误是由于defaultAccount 为空，演示可用某个固定的账户地址
  .send({from: '0x586c9d66cDf6274a7ea9F4CAe0bdB2087cB929C7'})
  .on('receipt', function(receipt){
      // console.log(receipt)
      //交易发送成功后，获取产生的event事件
      // contractInstance.methods.GetVoteList()
      // .call({from: '0x586c9d66cDf6274a7ea9F4CAe0bdB2087cB929C7'})
      // .on('receipt', function(receipt){
      //     console.log('get the list:' + receipt)
      // });
  })
  .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.warn(error)
  });

  //ws socket 监听指定的event事件
  // contractInstance.events.NewInit({
  //   filter: {},
  //   fromBlock: 0
  // },function(error, event){
  // }).on('data', function(event){
  //   console.log(event); // same results as the optional callback above
  //   let returnValues = event.returnValues;
  //   // 模板字符串`你好, ${name}, 你今年${age}岁了!`;
  //   console.log(`触发了 ${event.event} 事件，返回 new_p-${returnValues.new_p}、new_g-${returnValues.new_g}、new_q-${returnValues.new_q}、new_s-${returnValues.new_s}、new_o-${returnValues.new_o}`);
  // }).on('changed', function(event){
  // // remove event from local database
  // }).on('error', console.error);
};
testContractConn();


console.log("'hello'的keccak256(Web3.js库)的值是- " + web3.utils.keccak256('hello'))




