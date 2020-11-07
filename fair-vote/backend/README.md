# 公平投票协议 后端

## 构建步骤

### 1.初始化后端

~~~bash
truffle init # 初始化后端
~~~

### 2.修改配置

修改truffle-config.js 文件的 区块链rpc地址

### 3.编写合约

> 在 contracts 文件夹下新建 vote.sol



~~~sol
pragma solidity ^0.6.4;

contract Vote {
    //ElGamal算法参数
    struct ElGamalValue {
        uint64 p;
        uint64 g;
    }
    //时间参数
    struct TimeValue {
        uint64 registerEndTime;
        uint64 encryptEndTime;
        uint64 assistEndTime;
        uint64 decryptEndTime;
        uint64 recoverEndTime;
    }
    ElGamalValue _ElGamalValue = ElGamalValue(150001, 7);
    TimeValue _timeValue;
    uint8 q = 1;
    uint8 s = 13;
    uint8 o = 0;
    
    //初始化事件
    event NewInit(uint64 new_p, uint64 new_g, uint8 new_q, uint8 new_s, uint8 new_o);
    //初始化函数，为各个参数赋初值
    function Init(uint8 option, uint8 max, uint64 t1, uint64 t2, uint64 t3, uint64 t4, uint64 t5) public {
        //计算q的值
        while(2^q <= max){
            q = q + 1;
        }

        o = option;
        _timeValue = TimeValue(t1, t2, t3, t4, t5);

        emit NewInit(_ElGamalValue.p, _ElGamalValue.g, q, s, o);
        
    }
}
~~~

### 4.编译合约(检查是否有错误)

~~~bash
truffle compile
~~~

### 5.部署合约

在` migrations` 文件夹下创建一个自己的部署脚本 `2_deploy_contracts.js`

```
var Adoption = artifacts.require("Adoption");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
};
```

接下来执行部署命令(需要在项目的根目录)：

```bash
truffle  migrate   # 不指定network默认是启用 development

truffle migrate --network ropsten  # 此命令用于选择网络运行，  ropsten需事先在  truffle.js 的networks字段里配置
```

在打开的 Ganache 里可以看到区块链状态的变化，产生了 区块即代表部署成功。

### 6.测试合约

现在我们来测试一下智能合约，测试用例可以用 JavaScript 或 Solidity 来编写，这里使用 Solidity。

#### 使用测试用例

在 `test` 目录下新建一个 `TestVote.sol`，[编写测试合约](https://learnblockchain.cn/docs/truffle/testing/writing-tests-in-solidity.html)

```js
import "truffle/Assert.sol";   // 引入的断言
import "truffle/DeployedAddresses.sol";  // 用来获取被测试合约的地址
import "../contracts/Vote.sol";      // 被测试合约

contract TestAdoption {
  Vote vote = Vote(DeployedAddresses.Vote());

  // 投票初始化测试用例
  function testInit() public {
    vote.Init(123,78,112,118,119,124,129);

    uint expected = 12;
    Assert.equal(0, expected, "result whitespace of Vote Init() should be recorded.");
  }

}
```

>  提示：Assert.sol 及 DeployedAddresses.sol 是 [Truffle 框架](https://learnblockchain.cn/docs/truffle/)提供，在 test 目录下并不提供 truffle 目录。TestVote 合约中添加 Vote 的测试用例。

在终端中，执行 `truffle test` 即可看到测试结果

#### 在truffle console进行手动测试

> 测试之前需要 启动 **ganache-cli** 和 **truffle migrate** 进行部署
>
> ```js
> truffle console
> truffle(development)> var contract
> undefined
> truffle(development)> Vote.deployed().then(function(instance){contract= instance;});
> undefined
> truffle(development)> contract.Init(123,78,112,118,119,124,129)
> //测试初始化投票
> ```

>   以下是结果  可以看到合约函数确实被触发了  并记录了  NewInit 事件
>
> {
>   tx: '0xa72cf4e945ce1f6e6c766694916fdbede649044b4bd07a1a365877fb44dcfc26',
>   receipt: {
>     transactionHash: '0xa72cf4e945ce1f6e6c766694916fdbede649044b4bd07a1a365877fb44dcfc26',
>     transactionIndex: 0,
>     blockHash: '0x033f9fccc736b16dbbcc5a47d1d2ae9dcb567ee82aaf0a2dfbc83ee19e3ec78d',
>     blockNumber: 13,
>     from: '0xb7f4e8b4a7f031d9e9a8e781023b537f051447ad',
>     to: '0x5d00253923cd91ffb3822bba2fd369d35bbdd93b',
>     gasUsed: 341128,
>     cumulativeGasUsed: 341128,
>     contractAddress: null,
>     logs: [ [Object] ],
>     status: true,
>     logsBloom: '0x00000000000000008000000000000000000010000080000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000',
>     rawLogs: [ [Object] ]
>   },
>   logs: [
>     {
>       logIndex: 0,
>       transactionIndex: 0,
>       transactionHash: '0xa72cf4e945ce1f6e6c766694916fdbede649044b4bd07a1a365877fb44dcfc26',
>       blockHash: '0x033f9fccc736b16dbbcc5a47d1d2ae9dcb567ee82aaf0a2dfbc83ee19e3ec78d',
>       blockNumber: 13,
>       address: '0x5D00253923cD91FFb3822Bba2FD369D35BbDD93B',
>       type: 'mined',
>       id: 'log_d33082b4',
>       event: 'NewInit',
>       args: [Result]
>     }
>   ]
> }

## 运行步骤

~~~bash
truffle --network development 	 # 进入truffle控制台
truffle(development)> migrate --reset --compile-all  # 将合约部署到区块链
truffle(development)> Vote.abi  # 查看 Adoption.sol合约的abi 不准确，推荐使用引用里的方法

truffle(development)> Vote.address  # 查看 Adoption.sol合约的地址
# '0x541b3E9AE6A3A1E51A956649d3A8E47a286bB07e'
~~~

> 如何查看 合约的abi   前提条件： 已将合约部署到区块链 
>
> 执行 `truffle migrate` 后，会生成 `build/contracts/Vote.json` ,在该json文件里可以看到 `abi`字段



## 常见错误

### 1. 编译器版本不符合

**Q:** Error: Truffle is currently using solc 0.5.16, but one or more of your contracts specify "pragma solidity ^0.6.4".

**A:** 在 truffle-config.js 里指定solc编译器的版本

~~~solc
module.exports = {
  networks: {

    development: {
     host: "192.168.1.102",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    }, 
  },

  compilers: {
    solc: {
      version: "0.6.6",    // Fetch exact version from solc-bin (default: truffle's 
    },
  },
~~~



