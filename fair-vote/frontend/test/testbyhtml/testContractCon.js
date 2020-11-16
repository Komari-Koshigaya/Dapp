//==============> 配置信息
class Config{
    static JSONRPC_WS_ENDPOINT = 'ws://192.168.1.102:8545';
    static VOTEFACTORY_ADDRESS = VoteFactoryRepository.networks['5777'].address;
    static VOTEFACTORY_ABI = VoteFactoryRepository.abi;

    static VOTE_ABI = VoteRepository.abi;
}



//==============> web3初始化
class Connect{
    //下述两行 不加static其实完全会被忽略 此处仅仅是提醒有哪些变量
    web3 = null;
    defaultAccount = null;

    static getWeb3(){
        console.log(Config.JSONRPC_WS_ENDPOINT + " " + Config.VOTEFACTORY_ADDRESS)
        //初始化Web3  连接本地私有链
       if (typeof this.web3 !== 'undefined') {
            // this.web3 = new Web3(this.web3.currentProvider);
        } else {
            // web3 = new Web3(new Web3.providers.HttpProvider(JSONRPC_ENDPOINT));
            this.web3 = new Web3(new Web3.providers.WebsocketProvider(Config.JSONRPC_WS_ENDPOINT));
        }

        return this.web3;
    }

    //获取默认账户地址
    static setDefaultAccount(){
        return new Promise(resolve=>{
            this.web3.eth.getAccounts().then((accounts) => {
                // console.log(accounts[0]);
                resolve(accounts[0]);
            });
        });
    }

    static async getDefaultAccount(){
        this.defaultAccount = await this.setDefaultAccount()
        return this.defaultAccount;
    }

    //初始化操作 调用上面的函数 初始化 web3和默认账户
    static init(){
        this.getWeb3();
        this.getDefaultAccount();
    }
}

//初始化连接
Connect.init();




//=========================> 投票工厂类
class VoteFactory{
    voteFactoryInstance = null;

    static init(){
        let web3 = Connect.web3;
        this.voteFactoryInstance = new web3.eth.Contract(Config.VOTEFACTORY_ABI,Config.VOTEFACTORY_ADDRESS)
        // console.log(this.voteFactoryInstance.methods)
    }

    static getVoteFactoryInstance(){
        if(typeof this.voteFactoryInstance === 'undefined')
            this.init()
          
        return this.voteFactoryInstance;
    }

//==============> 创建投票界面
    static createVote(){
        let voteFactoryInstance = this.getVoteFactoryInstance();
      //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
        voteFactoryInstance.methods.CreateVote('总统选举',2,8,1617255905,1617355905,1617455905,1617515905,1617555905)
        .send({
            from: Connect.defaultAccount,
            gas: 2721975
        })
        .on('receipt', function(receipt){
            console.log("创建新投票成功！\n")
            console.log(receipt);

            //交易发送成功后，获取 votelist
            voteFactoryInstance.methods.GetVoteList()
            .call({from: Connect.defaultAccount})
            .then(function(result){
                console.log(`共有 ${result.length} 个投票`)
                console.log( result )
            });
        })
        .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.error(error)
        });
    }

    //搜索已有的投票合约
    static searchVoteByName( voteName ){
        let voteFactoryInstance = this.getVoteFactoryInstance();
        let votelist =[],voteObj={};
          //获取 votelist
        voteFactoryInstance.methods.GetVoteList()
        .call({from: Connect.defaultAccount})
        .then(function(result){
            votelist = result;
            console.log(`共有 ${result.length} 个投票` + votelist)
        });
    }

}




//=========================> 投票类
class Vote{
    // //voteFactory创建vote实例后会到一个地址  根据该地址获取对应的vote实例
    static getVoteInstance(voteAddress){
        let web3 = Connect.web3;
        // 获取 合约对象
        // let voteInstance = new web3.eth.Contract(Config.VOTE_ABI,voteAddress);
        return new web3.eth.Contract(Config.VOTE_ABI,voteAddress);
    }


    //1.向某个合约注册
    static registerToVote(voteAddress,xi){
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);

        //读取该投票实例的参数
        voteInstance.methods.GetVoteInfo()
        .call({from: Connect.defaultAccount})
        .then(function(result){
            // console.log(result)

            let p = result[1].p, g= result[1].g;
            //生成 min-max之间的最大值  Math.floor(Math.random()*(max-min+1)+min);
            let yi = g ** xi % p;//(1-p)
            let w = Math.floor(Math.random()*(30-3+1)+3), a = g ** w % p;//(1-p) 
            let c = Connect.web3.utils.keccak256(''+g+yi+a);
            c = Number(c) % p;
            let r= BigInt(w+xi*c);
            console.log("r太大了:"+ r+ ",c:"+ c + ",a-" +a+",yi:"+yi)

            //向该投票合约注册公钥
            voteInstance.methods.Register(r, a, c, yi)
            .send({
                from: Connect.defaultAccount,
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
    }

}






//==================================================> 按钮事件
//====================>按钮事件 创建投票界面
function createVote(){
    VoteFactory.createVote();
}
function showVote(){
    VoteFactory.searchVoteByName();
}


//====================>按钮事件    投票界面
function registerToVote(vote_addr, xi){
    Vote.registerToVote(vote_addr, xi);
}
// registerToVote('0xaede2B9C55E0771A4497aF2157e43e8D918899fb', Math.floor(Math.random()*(4-2+1)+2))