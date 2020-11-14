// let VoteFactoryRepository = VoteFactoryRepository;
let VOTEFACTORY_ADDRESS = VoteFactoryRepository.networks['5777'].address
// let JSONRPC_ENDPOINT = 'http://192.168.1.102:8545';
let JSONRPC_WS_ENDPOINT = 'ws://192.168.1.102:8545';
let web3,voteFactoryInstance,defaultAccount = '0x586c9d66cDf6274a7ea9F4CAe0bdB2087cB929C7';
        


//==============> web3初始化
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


//==============> 创建投票界面
let createVote = _=>{
  //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
  voteFactoryInstance.methods.CreateVote('总统选举',2,8,1617255905,1617355905,1617455905,1617515905,1617555905)
  .send({
    from: defaultAccount,
    gas: 2721975
  })
  .on('receipt', function(receipt){
      console.log("创建新投票成功！\n")
      console.log(receipt);

      //交易发送成功后，获取 votelist
      voteFactoryInstance.methods.GetVoteList()
      .call({from: defaultAccount})
      .then(function(result){
          console.log(`共有 ${result.length} 个投票`)
          console.log( result )
      });
  })
  .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.error(error)
  });
};
// createVote();



//==============> 投票界面的四个子步骤
//搜索已有的投票合约
let searchVoteByName = voteName=>{
    let votelist =[],voteObj={};
      //获取 votelist
    voteFactoryInstance.methods.GetVoteList()
    .call({from: defaultAccount})
    .then(function(result){
        votelist = result;
        // console.log(`共有 ${result.length} 个投票` + votelist)
    });


    // for()

};
searchVoteByName()

//voteFactory创建vote实例后会到一个地址  根据该地址获取对应的vote实例
let getVoteInstance = voteAddress=>{
    // 获取 合约对象
    let voteInstance;
    voteInstance = new web3.eth.Contract(VoteRepository.abi,voteAddress);
    return voteInstance;
};
//1.向某个合约注册
let registerToVote = voteAddress=>{
    //获取投票实例
    let voteInstance = getVoteInstance(voteAddress);

    //读取该投票实例的参数
    voteInstance.methods.GetVoteInfo()
    .call({from: defaultAccount})
    .then(function(result){
        // console.log(result)

        let p = result[1].p, g= result[1].g;
        //生成 min-max之间的最大值  Math.floor(Math.random()*(max-min+1)+min);
        let xi = Math.floor(Math.random()*(4-2+1)+2), yi = g ** xi % p;
        let w = Math.floor(Math.random()*(30-3+1)+3), a = g ** w;
        let c = web3.utils.keccak256(''+g+yi+a);
        c = Number(c) % p;
        r= BigInt(w-xi*c);
        console.log("r太大了:"+ r+ ",c:"+ c + ",a-" +a+",yi:"+yi)

        //向该投票合约注册公钥
        voteInstance.methods.Register(r, a, c, yi)
        // voteInstance.methods.Register(100, 200, 300, 400)
        .send({
            from: defaultAccount,
            gas: 2721975
        })
        .on('receipt', function(receipt){
            if(receipt.status)   console.log("向 vote teacher 投票注册成功！\n")
            else   console.warn("向 vote teacher 投票注册失败");
        })
        .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.error(error)
        });

    });
};
registerToVote('0xaede2B9C55E0771A4497aF2157e43e8D918899fb')
