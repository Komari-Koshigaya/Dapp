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

    //扩展欧几里得 模逆运算
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

    static isEmpty(str){
        if( typeof str === 'undefined' || str === null || str === '' )  return true;
        return false;
    }
}

class Connect{

    static getWeb3(wsAddr){

        //初始化Web3  连接本地私有链
       if ( Util.isEmpty(this.web3) || this.web3.currentProvider.url != wsAddr) {
            this.web3 = new Web3(new Web3.providers.WebsocketProvider(wsAddr));
        }

        //web3连接状态的改变好像有延迟  因此判断连接失败后设为null 需要等待几秒
        setTimeout(()=>{
            if( !this.web3.currentProvider.connected ){
                this.web3 = null;
            }
        }, 2000);

        // web3连接状态的改变好像有延迟  因此判断连接失败后设为null 移动到了  main.js
        // if( !this.web3.currentProvider.connected ){
        //     this.web3 = null;
        // }

        return this.web3;
    }

    //获取默认账户地址
    static setDefaultAccount(){
        // let account = $("#account").val();
        // if( Util.isEmpty(account) ){

        // }
        this.defaultAccount = $("#account").val();
    }




    //初始化操作 调用上面的函数 初始化 web3和默认账户
    static init(){
        //错误处理有问题 待完善
        try{
            this.getWeb3(Config.JSONRPC_WS_ENDPOINT);
        } catch (error) {
            console.log('连接区块链失败，请查看是否开放 ws 接口！')
        }
    }

    //解锁账号 存储密钥留于签名  待完善
    static unlockAccount(accountAddr, accountPwd){
        return new Promise(resolve=>{
            this.web3.eth.personal.unlockAccount('0xa22BcD941c53791Cc4C6eCD84cd149Bc4556896f','0x',
                                                    Config.ACCOUNT_UNLOCK_DURATION)
            .then(_=>resolve(true))
            .catch(error=>{
                console.log(error);
                resolve(false);
            });

        });
        
    }
}
//初始化连接
// Connect.init();