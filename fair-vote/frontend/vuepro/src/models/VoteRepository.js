import Config from '../config'

export class VoteRepository {

    web3 = null
    account = ''
    contractInstance = null
    gas = 4476768

    constructor(){
        this.gas = Config.GAS_AMOUNT
    }

    setWeb3(web3) {
        this.web3 = web3
        this.contractInstance = this.web3.eth.contract(Config.VOTEREPOSITORY_ABI).at(Config.VOTEREPOSITORY_ADDRESS)
    }

    getWeb3() {
       return this.web3 
    }   

    setAccount(account){
        this.account = account
    }


    getCurrentBlock() {
        return new Promise((resolve, reject ) => {
            this.web3.eth.getBlockNumber((err, blocknumber) => {
                if(!err) resolve(blocknumber)
                reject(err)
            })
        })
    }

    async watchIfCreated(cb) {
        const currentBlock = await this.getCurrentBlock()
        const eventWatcher = this.contractInstance.AuctionCreated({}, {fromBlock: currentBlock - 1, toBlock: 'latest'})
        eventWatcher.watch(cb)
    }
 
}