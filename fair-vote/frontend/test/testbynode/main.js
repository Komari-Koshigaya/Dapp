//使用 CommonJS 规范 模块化 js 文件
var app = require("./config.js")  //导入 ./config.js exports 的变量
let web3 = app.web3, contractInstance = app.contractInstance, defaultAccount = app.defaultAccount;
console.log(contractInstance)

let testContractInit = _=>{
  //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
  contractInstance.methods.Init(123,78,112,118,119,124,129)
  // .send({from: defaultAccount}) 
  //Error: No "from" address specified in neither the given options, nor the default options.
  //上述错误是由于defaultAccount 为空，演示可用某个固定的账户地址
  .send({from: '0x586c9d66cDf6274a7ea9F4CAe0bdB2087cB929C7'})
  // .on("receipt")  绑定 receipt 事件，web3.js源码中有 e.eventEmitter.emit("receipt", t), 触发该receipt事件
  .on('receipt', function(receipt){
      console.log(receipt)
      //交易发送成功后，获取产生的event事件
      let returnValues = receipt.events.NewInit.returnValues;
      console.log(`触发了事件，返回 new_p-${returnValues.new_p}、new_g-${returnValues.new_g}、new_q-${returnValues.new_q}、new_s-${returnValues.new_s}、new_o-${returnValues.new_o}`);
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
testContractInit();

        