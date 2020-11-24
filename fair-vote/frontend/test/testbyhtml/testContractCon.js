// migrate --reset --compile-all ==============> 配置信息
class Config{
    static JSONRPC_WS_ENDPOINT = 'ws://192.168.1.103:8545';
    static VOTEFACTORY_ADDRESS = VoteFactoryRepository.networks['5777'].address;
    static VOTEFACTORY_ABI = VoteFactoryRepository.abi;

    static VOTE_ABI = VoteRepository.abi;

}
class Util{

    //高效指数取模运算（蒙哥马利算法）
    static montgomery(g, k, p){//求 g^k mod p
        let res = 1;
        while( k > 0){
            if(k % 2 === 1)    res = (res*g) % p;//odd
            k >>= 1;
            g = ( BigInt(g) * BigInt(g) ) % BigInt(p);//此处必须使用bigint类型 否则会溢出  Number的最大数 2**53-1
            g = Number(g);
        }
        return res;
    }

    static getRandom(max, min){
        return Math.floor( Math.random() *( max - min + 1 ) + min );
    }

    static getMultiReverseByExEuclidean(x, p){
        let m=[1,0,p], n=[0,1,x], temp=new Array(3), q=0, flag=true;
        while(flag) {
            q= Math.floor( m[2]/n[2] );
            for(let i=0;i<3;i++) {
                temp[i]=m[i]-q*n[i];
                m[i]=n[i];
                n[i]=temp[i];
            }
            if(n[2]==1) {
                if(n[1]<0) {
                    n[1]=n[1]+p;
                }
                return n[1]
            }
            if(n[2]==0) {
                flag=false;
            }
        }
        return 0;
    }

    static getMultiReverseByFM(x, p){
        let res=1,d=p-2;
        while(d){
            if( d % 2 === 1){
                res *= x;
                res %= p;
            }
            x *= x;
            x %= p;
            d = Math.floor(d/2) ;
        }
        return res;
    }
}



//==============> web3初始化
class Connect{
    //下述两行 不加static其实是实例属性无法通过clss.pro访问 此处仅仅是提醒有哪些变量
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

    static getVoteFactoryInstance(){
        if(typeof this.voteFactoryInstance === 'undefined'){
            let web3 = Connect.web3;
            this.voteFactoryInstance = new web3.eth.Contract(
                Config.VOTEFACTORY_ABI,Config.VOTEFACTORY_ADDRESS)
        }
        return this.voteFactoryInstance;
    }

    static createVote(){
        let voteFactoryInstance = this.getVoteFactoryInstance();
      //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
        voteFactoryInstance.methods.CreateVote('总统选举',2,8,1617255905,1617355905,
            1617455905,1617515905,1617555905)
        .send({
            from: Connect.defaultAccount,
            gas: 2721975
        })
        .on('receipt', function(receipt){
            console.log("创建新投票成功！\n")
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

    static getVoteInfo(voteInstance){
        return new Promise(resolve=>{
            //读取该投票实例的参数
            voteInstance.methods.GetVoteInfo()
            .call({from: Connect.defaultAccount})
            .then( result =>{
                resolve(result);
            });
        });
    }
    //获取指定投票的投票人信息
    static getVoterInfo(voteInstance){
        return new Promise(resolve=>{
            voteInstance.methods.GetVoterInfo()
            .call({from: Connect.defaultAccount})
            .then( result =>{
                resolve(result);
            });
        });
    }

    //1.向某个合约注册
    static async registerToVote(voteAddress,xi){
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);
        //获取投票参数
        let voteInfo = await this.getVoteInfo(voteInstance);
        let p = voteInfo[1].p, g= voteInfo[1].g;

        //构造 ZK
        let yi = Util.montgomery(g, xi, p),ppow=p*p;//(1-p)
        let w = Math.floor(Math.random()*( p +1)+ppow), a = Util.montgomery(g, w, p);//(1-p) 
        let c = Connect.web3.utils.keccak256(''+g+yi+a);
        console.log(`c: ${c} , ${Number(c)} `)
        c = Number(c) % p;
        let r= BigInt(w-xi*c);
        console.log(`p: ${p}, g: ${g}, xi: ${xi}, yi: ${yi}, w: ${w}, r: ${r}, a: ${a}, c: ${c}`)

        //向该投票合约注册公钥
        voteInstance.methods.Register(r, a, c, yi)
        // voteInstance.methods.Register(1, 1, 1, 1)
        .send({ from: Connect.defaultAccount,gas: 2721975 })
        .on('receipt', function(receipt){

            //通过合约事件来判断 合约的验证是否通过
            console.log(receipt)
            let result = receipt.events.NewResult.returnValues;//event的返回值
            if(result.status)   {//合约验证通过
                layer.alert(`${result.status}  向 ${voteInstance._address} 投票注册成功！`, {
                  skin: 'layui-layer-molv' //样式类名
                  ,closeBtn: 0
                });
            }else   //合约验证失败
                console.warn(`${result.status}  向 ${voteInstance._address} 投票注册失败, ${result.msg}`);
        })
        .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            alert('不在投票注册时间内! 请稍后重试！')
            console.error(error)
        });
    }


    //2.加密投票
    static async calculateYi(voteInstance, currVoterYi){
        let voterList = await this.getVoterInfo(voteInstance), yiList=[];
        voterList.forEach( item => yiList.push(item.y) );
        //计算加密投票
        let Yi = ( yiList.reduce((x,y)=>x*y) / currVoterYi );  //去除i自己公钥的连乘
        return new Promise(resolve=>resolve(Yi));
    }

    static async encryptToVote(voteAddress,voteNum,xi){
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);
        //获取投票参数
        let voteInfo = await this.getVoteInfo(voteInstance);

        let p = voteInfo[1].p, g=voteInfo[1].g, q=voteInfo[3], o = Number( voteInfo[4] );
        let currVoterYi=Util.montgomery(g, xi, p);
        //计算加密投票
        let Yi = await this.calculateYi(voteInstance, currVoterYi);  //去除i自己公钥的连乘
        let vencVi = g **( 2**(voteNum*q) ) * Util.montgomery(Yi, xi, p) ;

        console.log(`Successful get the vote info when encrypting the voteing!
            voteAddress: '${voteAddress}', voteNum: ${voteNum}, xi: ${xi}, p: ${p}, 
            g: ${g}, q: ${q}, o: ${o}, currVoterYi: ${currVoterYi}, Yi: ${Yi}, vencVi: ${vencVi}`);


        // 构造 ZK
        let ppow=p*p, w = Util.getRandom(ppow + p, ppow);//(p^2+p - p^2)        
        let rjList = new Array(o).fill(0), djList = new Array(o).fill(0);

        rjList.forEach((index)=>rjList[index] = Util.getRandom(p, 1) );
        djList.forEach((index)=>djList[index] = Util.getRandom(p, 1) );
        let ajList = new Array(o).fill(0), bjList = new Array(o).fill(0);

        for(let j=0;j<o;j++){
            if(j === voteNum ) continue; 

            let tmp = Util.montgomery(g, rjList[j], p)  * Util.montgomery(currVoterYi, djList[j], p) 
            ajList[j] = tmp % p ;

            let vj = 2**(j*q), base = vencVi / ( g**vj);
            tmp = Util.montgomery(Yi, rjList[j], p) * Util.montgomery( Math.floor(base), djList[j], p);
            bjList[j] = tmp % p ;
        }

        ajList[voteNum] = Util.montgomery(g, w, p);
        bjList[voteNum] = Util.montgomery(Yi, w, p) ;

        let c = Connect.web3.utils.keccak256('' + g + currVoterYi + vencVi);
        // c = Number(c) % p;
        djList[voteNum] = ( Number(c) - djList.reduce((x,y)=>x+y) ) % p;
        rjList[voteNum] = w - xi*djList[voteNum];

        console.log(`Successful calculate the ZK when encrypting the voteing!
            ajList: [${ajList}], bjList: [${bjList}], rjList: [${rjList}], djList: [${djList}], 
            c: ${c}, vencVi ${vencVi}, Yi ${Yi}, currVoterYi ${currVoterYi}`)


        //向该投票合约注册公钥
        voteInstance.methods.Encrypt(ajList, bjList, rjList, djList, c, vencVi, Yi, currVoterYi)
        .send({
            from: Connect.defaultAccount,
            gas: 2721975
        })
        .on('receipt', function(receipt){
            //通过合约事件来判断 合约的验证是否通过
            console.log(receipt)
            let result = receipt.events.NewResult.returnValues;//event的返回值
            if(result.status)   {//合约验证通过
                layer.alert(`${result.status}  向 ${voteInstance._address} 加密投票 ${voteNum} 号成功！`, {
                  skin: 'layui-layer-molv' //样式类名
                  ,closeBtn: 0
                });
            }else   //合约验证失败
                console.warn(`${result.status}  向 ${voteInstance._address} 加密投票 ${voteNum} 号失败, ${result.msg}`);
        })
        .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            alert('不在加密投票时间内! 请稍后重试！')
            console.error(error)
        });
    }


    //3.解密   带有时间锁 t3时上链
    static async decryptToVote(voteAddress, xi){
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);
        //获取投票参数
        let voteInfo = await this.getVoteInfo(voteInstance);

        let p = voteInfo[1].p, g=voteInfo[1].g, currVoterYi=Util.montgomery(g, xi, p);;
        //计算解密vi
        let Yi = await this.calculateYi(voteInstance, currVoterYi);  //去除i自己公钥的连乘
        let vdecVi = Util.montgomery(Yi, xi, p) ;


        // 构造 ZK
        let ppow=p*p, w = Util.getRandom(ppow + p, ppow);//(p^2+p - p^2)
        let a1 = Util.montgomery(Yi, w, p), a2 = Util.montgomery(g, w, p);
        let c = Connect.web3.utils.keccak256('' + a1 + a2);
        c = Number(c) % p;
        let r = w - xi * c;

        console.log(`Successful calculate the ZK when decrypting the voteing!
            p: ${p}, g: ${g}, currVoterYi: ${currVoterYi}, Yi: ${Yi}, 
            vdecVi: ${vdecVi}, r: ${r}, a1: ${a1}, a2: ${a2}, c: ${c}`)


        //向该投票合约注册公钥
        voteInstance.methods.Decrypt(r, a1, a2, c, vdecVi, Yi, currVoterYi)
        .send({
            from: Connect.defaultAccount,
            gas: 2721975
        })
        .on('receipt', function(receipt){
            //通过合约事件来判断 合约的验证是否通过
            console.log(receipt)
            let result = receipt.events.NewResult.returnValues;//event的返回值
            if(result.status)   {//合约验证通过
                let msg = `${result.status}  向 ${voteInstance._address} 解密投票 成功！`;
                layer.msg( msg, {time: 2000, icon:1});
            }else {   //合约验证失败
                let msg = `${result.status}  向 ${voteInstance._address} 解密投票 失败, ${result.msg}`;
                layer.msg( msg, {time: 2000, icon:2});
            }
        })
        .on('error', function(error) { 
            alert('不在解密投票时间内! 请稍后重试！')
            console.error(error)
        });
    }

    //4.构造投票 和decrypt相同的nonce 但付出更高的手续费 从而比decrypt具有更高的优先级
    static async constructVote(voteAddress, xi){
        let voteInstance = this.getVoteInstance(voteAddress);        //获取投票实例
        /* let voteInfo = await this.getVoteInfo(voteInstance);        //获取投票参数
        // let currGasPrice = await Connect.web3.eth.getGasPrice();        //获取当前网络的gasprice*/
        //同时获取当前网络的gasprice 、 投票参数、投票人信息
        let [currGasPrice, voteInfo, voterList] = await Promise.all([Connect.web3.eth.getGasPrice(), 
            this.getVoteInfo(voteInstance), this.getVoterInfo(voteInstance)]);

        let p = voteInfo[1].p, g=voteInfo[1].g, currVoterYi=Util.montgomery(g, xi, p);
        console.log(voterList)
        let temp = 1;
        voterList.forEach(item=>temp*=item.y);
        let hi= temp / currVoterYi, vassVi = Util.montgomery(hi, xi, p);


        // 构造 ZK
        let ppow=p*p, w = Util.getRandom(ppow + p, ppow);//(p^2+p - p^2)
        let a1 = Util.montgomery(hi, w, p), a2 = Util.montgomery(g, w, p);
        let c = Connect.web3.utils.keccak256('' + a1 + a2);
        c = Number(c) % p;
        let r = w - xi * c;

        console.log(`Successful calculate the ZK when assisting the voteing!
            p: ${p}, g: ${g}, currVoterYi: ${currVoterYi}, hi: ${hi}, 
            vassVi: ${vassVi}, r: ${r}, a1: ${a1}, a2: ${a2}, c: ${c}`)


        //向该投票正式投票
        voteInstance.methods.Assist(r, a1, a2, c, vassVi, hi, currVoterYi)
        .send({
            from: Connect.defaultAccount,
            gas: 2721975,
            gasPrice: currGasPrice * 4
        })
        .on('receipt', function(receipt){
            //通过合约事件来判断 合约的验证是否通过
            console.log(receipt)
            let result = receipt.events.NewResult.returnValues;//event的返回值
            if(result.status)   {//合约验证通过
                let msg = `${result.status}  向 ${voteInstance._address} 构造投票 成功！`;
                layer.msg( msg, {time: 2000, icon:1});
            }else {   //合约验证失败
                let msg = `${result.status}  向 ${voteInstance._address} 构造投票 失败, ${result.msg}`;
                layer.msg( msg, {time: 2000, icon:2});
            }
        })
        .on('error', function(error) { 
            alert('不在解密投票时间内! 请稍后重试！')
            console.error(error)
        });
    }

    //5. 若4未上链 3上链 则可执行恢复投票来得到4失败的投票vi
    static async recoverVote(voteAddress, xi){
        let voteInstance = this.getVoteInstance(voteAddress);        //获取投票实例
        let [voteInfo, voterList] = await Promise.all([ 
            this.getVoteInfo(voteInstance), this.getVoterInfo(voteInstance)]);

        let p = voteInfo[1].p, g=voteInfo[1].g, currVoterYi=Util.montgomery(g, xi, p);
        console.log(voterList)

        let yiIndex = 0, yiBeforeMulti = 1, yiAfterMulti = 1;
        for(let i=0;i<voterList.length;i++){
            if(voterList[i].y === currVoterYi){
                yiIndex = i;
            }
        }
        voterList.forEach((item,index)=>{
            if( index < yiIndex && ( item.notFailer === false || item.isHonest === false ) ) 
                yiBeforeMulti *= item.y
            else if (index > yiIndex  && ( item.notFailer === false || item.isHonest === false ) )  
                yiAfterMulti *= item.y;
        });
        let hj= yiAfterMulti * Util.getMultiReverseByExEuclidean(yiBeforeMulti, p);
        let vrecVi = Util.montgomery(hj, xi, p);


        // 构造 ZK
        let ppow=p*p, w = Util.getRandom(ppow + p, ppow);//(p^2+p - p^2)
        let a1 = Util.montgomery(hj, w, p), a2 = Util.montgomery(g, w, p);
        let c = Connect.web3.utils.keccak256('' + a1 + a2);
        c = Number(c) % p;
        let r = w - xi * c;

        console.log(`Successful calculate the ZK when recovering the voteing!
            p: ${p}, g: ${g}, yiIndex: ${yiIndex}, yiBeforeMulti: ${yiBeforeMulti}, yiAfterMulti: ${yiAfterMulti}, voterList: [${voterList}],
            currVoterYi: ${currVoterYi}, hj: ${hj}, vrecVi: ${vrecVi}, r: ${r}, a1: ${a1}, a2: ${a2}, c: ${c}`)


        voteInstance.methods.Recover(r, a1, a2, c, vrecVi, hj, currVoterYi)
        .send({
            from: Connect.defaultAccount,
            gas: 2721975,
        })
        .on('receipt', function(receipt){
            //通过合约事件来判断 合约的验证是否通过
            console.log(receipt)
            let result = receipt.events.NewResult.returnValues;//event的返回值
            if(result.status)   {//合约验证通过
                let msg = `${result.status}  向 ${voteInstance._address} 构造投票 成功！`;
                layer.msg( msg, {time: 2000, icon:1});
            }else {   //合约验证失败
                let msg = `${result.status}  向 ${voteInstance._address} 构造投票 失败, ${result.msg}`;
                layer.msg( msg, {time: 2000, icon:2});
            }
        })
        .on('error', function(error) { 
            alert('不在解密投票时间内! 请稍后重试！')
            console.error(error)
        });
    }
}



// //计算特定投票的投票结果
// let getVoteResult = async vote_addr=>{
//     let voteInstance = await Vote.getVoteInfo(vote_addr);
// };



//==================================================> 按钮事件
//====================>按钮事件 创建投票界面
function handleCreateVote(){
    VoteFactory.createVote();
}
function handleShowVote(){
    VoteFactory.searchVoteByName();
}


//====================>按钮事件    投票界面
let test_address = '0x1B3820fdF39E25046ee187cE8609a2393d169500', test_xi = 61;
function handleRegisterVote(vote_addr, xi){
    Vote.registerToVote(test_address, 61);

    // Vote.registerToVote(vote_addr, xi);
}
function handleEncryptVote(vote_addr){
    //例子2
    let result=prompt("请输入私钥和候选人编号(','分隔;编号从0开始)","61, 1"); 
    result = result.split(",");
    let xi = result[0] , voteNum = Number( result[1] );
    Vote.encryptToVote(test_address, voteNum, xi);
}
function handleDecryptVote(vote_addr, xi){
    Vote.decryptToVote(test_address, test_xi);
}
function handleConstructVote(vote_addr, xi){
    Vote.constructVote(test_address, test_xi);
}
function handleRecoverVote(vote_addr, xi){
    Vote.recoverVote(test_address, test_xi);
}


