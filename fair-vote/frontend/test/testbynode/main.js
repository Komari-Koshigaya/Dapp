//使用 CommonJS 规范 模块化 js 文件
var app = require("./config.js")  //导入 ./config.js exports 的变量
let web3 = app.web3, voteFactoryInstance = app.voteFactoryInstance, defaultAccount = app.defaultAccount;
console.log(voteFactoryInstance)

let testContractInit = _=>{
  //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
  voteFactoryInstance.methods.CreateVote('总统选举',2,8,1617255905,1617355905,1617455905,1617515905,1617555905)
  .send({
    from: defaultAccount,
    gas: 2721975
  })
  .on('receipt', function(receipt){
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
      console.warn(error)
  });

};
testContractInit();

        