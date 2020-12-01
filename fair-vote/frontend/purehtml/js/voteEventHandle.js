function handleCreateVote() {
    // VoteFactory.createVote('总统选举',2,8,1617255905,1617355905, 1617455905,1617515905,1617555905); 

    var voteName = document.getElementById("voteName").value;
    var candNum = document.getElementById("candNum").value;
    var maxVoterNum = document.getElementById("maxVoterNum").value;
    var regTime = Util.Local2Zero(document.getElementById("regTime").valueAsNumber / 1000);
    var encTime = Util.Local2Zero(document.getElementById("encTime").valueAsNumber / 1000);
    var assTime = Util.Local2Zero(document.getElementById("assTime").valueAsNumber / 1000);
    var decTime = Util.Local2Zero(document.getElementById("decTime").valueAsNumber / 1000);
    var recTime = Util.Local2Zero(document.getElementById("recTime").valueAsNumber / 1000);


    if (Util.isEmpty(voteName) || voteName === "0x") {
        alert("请输入投票名称");
        return;
    }
    if (Util.isEmpty(candNum) || isNaN(candNum)) {
        alert("请输入候选人个数(整数)");
        return;
    }
    if (Util.isEmpty(maxVoterNum) || isNaN(maxVoterNum)) {
        alert("请输入最大参与人数(整数)");
        return;
    }
    if (isNaN(regTime) || isNaN(encTime) || isNaN(assTime) || isNaN(decTime) || isNaN(recTime)) {
        alert("请填写时间信息！");
        return;
    }
    var now = new Date().getTime() / 1000;
    if (regTime < now || encTime < regTime || assTime < encTime || decTime < assTime || recTime < decTime) {
        alert("请正确填写信息，注意时间设置是否合理！")
        return;
    }

    if (Util.isEmpty(parent.currAccount)) {
        alert("账号未解锁或账号不存在!");
        return;
    }

    // voteName = parent.web3.utils.utf8ToHex(voteName);
    candNum = Number(candNum), maxVoterNum = Number(maxVoterNum);
    VoteFactory.createVote(voteName, candNum, maxVoterNum, regTime, encTime, assTime, decTime, recTime);
}

function handleShowVote() {
    VoteFactory.searchVoteByName();
}

function handleRegisterVote(vote_addr, xi) {
    Vote.registerToVote(test_address, 61);

    // Vote.registerToVote(vote_addr, xi);
}

function handleEncryptVote(vote_addr) {
    //例子2
    let result = prompt("请输入私钥和候选人编号(','分隔;编号从0开始)", "61, 1");
    result = result.split(",");
    let xi = result[0],
        voteNum = Number(result[1]);
    Vote.encryptToVote(test_address, voteNum, xi);
}

function handleDecryptVote(vote_addr, xi) {
    Vote.decryptToVote(test_address, test_xi);
}

function handleConstructVote(vote_addr, xi) {
    Vote.constructVote(test_address, test_xi);
}

function handleRecoverVote(vote_addr, xi) {
    Vote.recoverVote(test_address, test_xi);
}

function handleTallyVote(vote_addr) {
    Vote.tallyVote(test_address);
}