var path = [
    "HTML/AddVote.html",
    "HTML/AttendVote.html",
    "HTML/ResultVote.html",
]

var currAccount = undefined;
var currPwd = undefined;
var isUnlock = false;
var currPage = -1;

function jump(index) {
    document.getElementById("iframe").src = path[index];
    currPage = index;
}

function handleConnect(){
    var button = document.getElementById("btnConnect");
    var addr = document.getElementById("address").value;
    var statusImg = document.getElementById("status");

    if ( Util.isEmpty(addr) )   addr = Config.JSONRPC_WS_ENDPOINT;
    
    let web3 = Connect.getWeb3(addr);
    button.innerText = "连接中...";
    statusImg.src = "./images/loading.png";
    console.log(addr)

    setTimeout(()=>{
        if ( !Util.isEmpty(web3) && web3.currentProvider.connected ) {
            button.innerText = "连接";
            statusImg.src = "./images/right.png";
            document.getElementById("address").value = addr;
        } else {
            button.innerText = "连接";
            statusImg.src = "./images/wrong.png";
            alert('连接区块链失败，请查看是否开放 ws 接口！')
        }
    }, 2000);
}

//解锁账号（未检查）
function handleUnlockAccount() {
    if (!isConnected) return false;

    account = document.getElementById("account").value
    password = document.getElementById("password").value;
    img = document.getElementById("account-status");

    img.src = "./images/loading.png";
    web3.eth.personal.unlockAccount(account, password, (error, result) => {
        if (error) {
            img.src = "./images/wrong.png";
            return false;
        } else if (result) {
            currPwd = password;
            img.src = "./images/right.png";
            return true;
        }
    })
}

//设置右下角相应投票信息
function SetVoteInfo(voteAddr) {

}

$(document).ready(function() {
    console.log(Config.JSONRPC_WS_ENDPOINT + " " + Config.VOTEFACTORY_ADDRESS)  
    // $("#iframe").attr("src", "HTML/AddVote.html");
    jump(0);
    handleConnect();
});