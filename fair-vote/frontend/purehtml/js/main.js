var path = [
    "HTML/AddVote.html",
    "HTML/AttendVote.html",
    "HTML/ResultVote.html",
]

var web3;
var currAccount = null;
var currPage = -1;

function jump(index) {
    document.getElementById("iframe").src = path[index];
    currPage = index;
}

function handleConnect() {
    var button = document.getElementById("btnConnect");
    var addr = document.getElementById("address").value;
    var statusImg = document.getElementById("status");

    if (Util.isEmpty(addr)) addr = Config.JSONRPC_WS_ENDPOINT;

    web3 = Connect.getWeb3(addr);
    button.innerText = "连接中...";
    statusImg.src = "./images/loading.png";

    setTimeout(() => {
        if (!Util.isEmpty(web3) && web3.currentProvider.connected) {
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
    currAccount = document.getElementById("account").value
    password = document.getElementById("password").value;
    img = document.getElementById("account-status");

    if (Util.isEmpty(web3) || web3.currentProvider.connected === false) return false;

    img.src = "./images/loading.png";
    Connect.unlockAccount(currAccount, password)
    .then(()=>{
        currPwd = password;
        img.src = "./images/right.png";
        return true;
    })
    .catch(error=>{
        img.src = "./images/wrong.png";
            return false;
    });
}

//设置右下角相应投票信息
function setVoteInfo(voteAddr) {

}

$(document).ready(function() {
    console.log(Config.JSONRPC_WS_ENDPOINT + " " + Config.VOTEFACTORY_ADDRESS)
    // $("#iframe").attr("src", "HTML/AddVote.html");
    jump(0);
    handleConnect();
    $('#btnConnect').bind('click', handleConnect);
    $('#btnUnlock').bind('click', handleUnlockAccount);
});