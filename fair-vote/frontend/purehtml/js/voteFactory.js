class VoteFactory {
    voteFactoryInstance = null;

    static getVoteFactoryInstance() {
        if (typeof this.voteFactoryInstance === 'undefined') {
            let web3 = parent.web3;
            this.voteFactoryInstance = new web3.eth.Contract(
                Config.VOTEFACTORY_ABI, Config.VOTEFACTORY_ADDRESS)
        }
        return this.voteFactoryInstance;
    }

    static createVote(voteName, candNum, maxVoterNum, regTime, encTime, assTime, decTime, recTime) {
        let voteFactoryInstance = this.getVoteFactoryInstance();
        //使用 send调用合约 会发起一笔交易并签名 因此该账户必须已解锁
        voteFactoryInstance.methods.CreateVote(voteName, candNum, maxVoterNum, regTime, encTime, assTime, decTime, recTime)
            .send({
                from: parent.currAccount,
                gas: 2721975
            })
            .on('receipt', function(receipt) {
                console.log("创建新投票成功！\n")
            })
            .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                console.error(error)
            });
    }

    //搜索已有的投票合约
    static searchVoteByName(voteName) {

        let voteFactoryInstance = this.getVoteFactoryInstance();
        let votelist = [],
            voteObj = {};
        //获取 votelist
        voteFactoryInstance.methods.GetVoteList()
            .call({ from: parent.currAccount })
            .then(function(result) {
                votelist = result;
                console.log(`共有 ${result.length} 个投票` + votelist)
            });
    }

}