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











# 密码学js库

## hash算法 (以下需求完全可用 web3.js 推荐)

[ethers.js](https://github.com/ethers-io/ethers.js) 以太坊官方实现的 javascript 库 包括以下hash算法

> [hash算法使用文档](https://docs.ethers.io/v5/api/utils/hashing/#utils-keccak256)
>
> *ethers*.*utils*.**id**( *text* ) ⇒ *string< [DataHexString](https://docs.ethers.io/v5/api/utils/bytes/#DataHexString)< 32 > >*
>
> The Ethereum Identity function computes the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) hash of the *text* bytes.
>
> 
>
> *ethers*.*utils*.**keccak256**( *aBytesLike* ) ⇒ *string< [DataHexString](https://docs.ethers.io/v5/api/utils/bytes/#DataHexString)< 32 > >*
>
> Returns the [KECCAK256](https://en.wikipedia.org/wiki/SHA-3) digest *aBytesLike*.
>
> 
>
> *ethers*.*utils*.**ripemd160**( *aBytesLike* ) ⇒ *string< [DataHexString](https://docs.ethers.io/v5/api/utils/bytes/#DataHexString)< 20 > >
>
> Returns the [RIPEMD-160](https://en.m.wikipedia.org/wiki/RIPEMD) digest of *aBytesLike*.
>
> 
>
> *ethers*.*utils*.**sha256**( *aBytesLike* ) ⇒ *string< [DataHexString](https://docs.ethers.io/v5/api/utils/bytes/#DataHexString)< 32 > >*
>
> Returns the [SHA2-256](https://en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.
>
> 
>
> *ethers*.*utils*.**sha512**( *aBytesLike* ) ⇒ *string< [DataHexString](https://docs.ethers.io/v5/api/utils/bytes/#DataHexString)< 64 > >*
>
> Returns the [SHA2-512](https://en.wikipedia.org/wiki/SHA-2) digest of *aBytesLike*.

### Installing

**node.js**

```
/home/ricmoo/some_project> npm install --save ethers
```

**browser (UMD)**

```
<script src="https://cdn.ethers.io/lib/ethers-5.0.umd.min.js" type="text/javascript">
</script>
```

**browser (ESM)**

```
<script type="module">
    import { ethers } from "https://cdn.ethers.io/lib/ethers-5.0.umd.min.js";
</script>
```





# 常见报错

1. **Error: No "from" address specified in neither the given options, nor the default options.**

> 该错误是由于未指定发送交易的发起方地址，或是该地址未解锁



2. **Error: Returned error: VM Exception while processing transaction: revert**

> 该错误是由于 发起交易的汽油费超过默认gas，从而被撤回，可在发送交易的同时指定汽油费的上限
>
> 如：
>
> ~~~js
> voteFactoryInstance.methods.CreateVote('总统选举',2,8,1617255905,1617355905,1617455905,1617515905,1617555905)
> .send({
>     from: defaultAccount,
>     gas: 2721975
> }) 
>     .on('error', function(error) {
>     console.error(error)
> });
> ~~~
>
> 

