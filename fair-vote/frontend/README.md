# 公平投票协议 前端

## 简单测试

### web3.js监听合约 event

> 需要先安装 node.js，而后通过 `npm install web3` 安装web3.js模块

1.以下是一个简单的web3.js代码 填入合约地址、abi、和要监听的事件名

```javascript
var Web3 = require("web3")
var web3;

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545"));
}
        
var contractAbi = [];//copy and past contract's abi into []
var contractaAddress = "0x";//copy and past contract's address after 0x
        
MyContract = new web3.eth.Contract(contractAbi, contractaAddress);
//console.log(MyContract.events.orderlog);

//测试获取合约的event 相关信息
var myEvent = MyContract.events.EventName({
    filter:{},
    fromBlock: 0
}, function(error, event){
}).on('data', function(event){
    console.log(event); // same results as the optional callback above
    let returnValues = event.returnValues;//event的返回值
    // 模板字符串打印`你好, ${name}, 你今年${age}岁了!`;
    console.log(`触发了 ${event.event} 事件，返回 new_p-${returnValues.new_p}、new_g-${returnValues.new_g}、new_q-${returnValues.new_q}、new_s-${returnValues.new_s}、new_o-${returnValues.new_o}`);
}).on('changed', function(event){
   // remove event from local database
}).on('error', console.error);
```

