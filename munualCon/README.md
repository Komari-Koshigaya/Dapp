# 手动编译、部署智能合约

> 应用于合约的交互完全依赖于ABI和应用实例部署的以太坊地址

## 1. 编写合约代码

> 以下是一个简单的加法合约 仅用于说明整个过程

~~~solidity
pragma solidity ^0.6.0;

contract TestAdd
{

	function Add(uint256 a, uint256 b) public pure returns(uint256)
	{
		return a+b;
	}

}
~~~

## 2.编译合约代码

### 2.1 使用solidity编译器 solc

~~~shell
# 需要先安装solidity编译器
sudo yum install solc
solc --version  # 查看是否安装成功

solc --optimize --bin add.sol  # 生成和优化合约的二进制代码
solc --abi add.sol  # 获取合约的ABI
~~~

### 2.2 使用truffle命令行

> 前提条件
>
> 1. 安装truffle： `npm install -g truffle`
>
> 2. 新建truffle-config.js填入下列内容
>
>    ~~~js
>    module.exports = {
>      // See <http://truffleframework.com/docs/advanced/configuration>
>      // for more about customizing your Truffle configuration!
>      networks: {
>        development: {
>          host: "222.201.139.45",
>          port: 7545,
>          network_id: "5777" // Match any network id
>        },
>        develop: {
>          port: 8545
>        }
>      }
>    };
>    ~~~

~~~shell
truffle console --network development
~~~

