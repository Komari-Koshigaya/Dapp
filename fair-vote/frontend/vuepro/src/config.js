var VoteRepository = require('./contracts/VoteRepository')

module.exports = {
    JSONRPC_ENDPOINT: 'http://localhost:8545',
    JSONRPC_WS_ENDPOINT: 'ws://localhost:7545', //'ws://52.59.238.144:8546',

    VOTEREPOSITORY_ADDRESS: '0x5D00253923cD91FFb3822Bba2FD369D35BbDD93B',

    VOTEREPOSITORY_ABI: AuctionRepository.abi,

    GAS_AMOUNT: 500000,

    // //whisper settings
    // WHISPER_SHARED_KEY: '0x8bda3abeb454847b515fa9b404cede50b1cc63cfdeddd4999d074284b4c21e15'

}

// web3.eth.sendTransaction({from: web3.eth.accounts[0], to: "0x6f0023D1CFe5A7A56F96e61E0169B775Ac97f90E" , value: web3.utils.toWei(1, 'ether'), gasLimit: 21000, gasPrice: 20000000000})
