let abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "new_p",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "new_g",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "new_q",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "new_s",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "new_o",
          "type": "uint8"
        }
      ],
      "name": "NewInit",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "option",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "max",
          "type": "uint8"
        },
        {
          "internalType": "uint64",
          "name": "t1",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "t2",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "t3",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "t4",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "t5",
          "type": "uint64"
        }
      ],
      "name": "Init",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];


let VOTE_ADDRESS = "0x5D00253923cD91FFb3822Bba2FD369D35BbDD93B";
let JSONRPC_ENDPOINT = 'http://192.168.1.102:8545';
let JSONRPC_WS_ENDPOINT = 'ws://192.168.1.102:8545';
// let web3 = new Web3(new Web3.providers.HttpProvider(JSONRPC_ENDPOINT));
let web3 = new Web3(new Web3.providers.WebsocketProvider(JSONRPC_WS_ENDPOINT));
let contractInstance = new web3.eth.Contract(abi,VOTE_ADDRESS);
let defaultAccount;

// $(document).ready(function(){
//  if (typeof web3 !== 'undefined') {
//         web3 = new Web3(web3.currentProvider);
//     } else {
//         // set the provider you want from Web3.providers 
//         // 连接本地私有链
//         web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//         // web3 = new Web3(new Web3.providers.HttpProvider(JSONRPC_ENDPOINT));
//         // web3 = new Web3(new Web3.providers.WebsocketProvider(JSONRPC_WS_ENDPOINT));
//  }
//     // 获取 合约对象
//  // 
// });



function getWeb3() {
    return web3
}

function setDefaultAccount() {
  console.log(contractInstance)
    web3.eth.getAccounts().then((accounts) => {
      defaultAccount = accounts[0]
        console.log( "连接区块链成功，设置默认账号：" + defaultAccount );
    });
}
setDefaultAccount();

let testContractInit = ()=>{
  // return new Promise(async (resolve, reject) => {
 //        try {
 //            this.contractInstance.Init(123,78,112,118,119,124,129, { from: defaultAccount }, (err, transaction) => {
 //                if(!err) resolve(transaction)
 //                reject(err)
 //            })
 //        } catch(e) {
 //            reject(e)
 //        }
 //    });


  contractInstance.methods.Init(123,78,112,118,119,124,129)
    .call({from: defaultAccount}, function(error, result) {
        if(!error)
        {
            console.log(result);

        }
        else console.log(error);
    });


  // //HttpProvider
 //    contractInstance.getPastEvents('NewInit',(function(error, result) {
 //        if (!error){
 //            console.log(result);
 //        } 
 //     else console.log(error);
 //    }));

    //ws socket 
  console.log(75);    
  // contractInstance.events.NewInit({
  //   filter: {},
  //   fromBlock: 0
  // }, function(error, event){
  // }).on('data', function(event){
  //   console.log(event); // same results as the optional callback above
  // }).on('changed', function(event){
  // // remove event from local database
  // }).on('error', console.error);

  contractInstance.events.NewInit({
    filter: {},
    fromBlock: 0
  },function(error, event){
  }).on('data', function(event){
    console.log(event); // same results as the optional callback above
    let returnValues = event.returnValues;
    // 模板字符串`你好, ${name}, 你今年${age}岁了!`;
    console.log(`触发了 ${event.event} 事件，返回 new_p-${returnValues.new_p}、new_g-${returnValues.new_g}、new_q-${returnValues.new_q}、new_s-${returnValues.new_s}、new_o-${returnValues.new_o}`);
  }).on('changed', function(event){
  // remove event from local database
  }).on('error', console.error);
};
testContractInit();

        