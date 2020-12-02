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

