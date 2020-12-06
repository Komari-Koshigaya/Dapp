var attendVote = null; //默认投票地址
var zeroProof = null; //证明


//search vote before voting
function handleSearchVote() {
    setVoteName('请先搜索您想参加的投票!');
    attendVote = null; //每次点击搜索都重置默认的投票地址
    let searchText = document.getElementById("SearchText").value;
    let index = document.getElementById("searchSelect").selectedIndex;
    if (Util.isEmpty(searchText)) {
        alert('请输入搜索内容！')
        return false;
    }
    if (index === 0 && !parent.web3.utils.isAddress(searchText)) { //0表示按地址搜索
        alert('请输入正确的投票地址！')
        return false;
    }

    //搜索投票
    let getAllVote = async () => {
        let voteList = await VoteFactory.getAllVote();

        if (Util.isEmpty(voteList) || voteList.length === 0) {
            alert('暂无任何投票信息，请先创建投票！')
        }


        for (let i = 0; i < voteList.length; i++) {
            if (index === 0 && voteList[i].vote === searchText) { //根据地址搜索
                attendVote = voteList[i];
                break;
            }
            if (index === 1 && voteList[i].name === searchText) { //根据名称搜索
                attendVote = voteList[i];
                break;
            }
        }

        if (Util.isEmpty(attendVote)) {
            alert(`未找到 ${index===0?'地址':'名称'}为 ${searchText} 的投票信息!`)
        }

        //设置获取到的投票相关信息
        setVoteName(`您正在参加的投票： ${attendVote.name}`);
        // if (leftOption == 1) setVoteCandidate();
        parent.setVoteInfo(attendVote.vote);
        return voteList;
    }

    getAllVote();
    console.log("搜索投票结束!");
}

//common check param
function checkParaBeforeGeneProof() {
    zeroProof = null;
    if (Util.isEmpty(attendVote)) {
        alert('请先确认一个投票！')
        return -1;
    }

    let xi = prompt('请输入投票的私钥: ');
    if (xi === null) { //用户点击取消
        return -1;
    }
    if (Util.isEmpty(xi) || isNaN(xi)) {
        alert('请输入整数！')
        return -1;
    }
    xi = Number(xi);
    return xi;
}

function checkParaBeforeSendChain() {
    if (Util.isEmpty(attendVote)) {
        alert('请先确认一个投票！')
        return false;
    }
    if (Util.isEmpty(zeroProof)) {
        alert('请先生成证明！')
        return false;
    }
    if (Util.isEmpty(parent.currAccount)) {
        alert('请先解锁账户');
        return false;
    }
    return true;
}


//step1 register
function handleGeneRegProof() {
    let xi = checkParaBeforeGeneProof();
    if (xi === -1) return false;

    let main = async () => {
        zeroProof = await Vote.geneRegProof(attendVote.vote, xi);

        if (Util.isEmpty(zeroProof)) {
            alert('自动生成出错！')
            return;
        }
        console.log(zeroProof);
        document.getElementById('PublicKey').value = zeroProof.yi;
        document.getElementById('RegisterProof').value = parent.web3.utils.toHex(zeroProof).slice(2); //解密证明 的十六进制数
        // document.getElementById('RegisterProof').value = `r: ${zeroProof.r}, a: ${zeroProof.a}, c: ${zeroProof.c}`;
    }

    main();

}

function handleRegVote() {
    if (checkParaBeforeSendChain() === false) return;

    Vote.registerToVote(attendVote.vote, zeroProof.r, zeroProof.a, zeroProof.c, zeroProof.yi)
        .then()
        .catch(console.log);
}

//step2 encrypt
function handleGeneEncProof() {
    zeroProof = null;
    if (Util.isEmpty(attendVote)) {
        alert('请先确认一个投票！')
        return -1;
    }

    let result = prompt("请输入私钥和候选人编号,如: 61,1");
    result = result.split(",");
    let xi = Number(result[0]),
        voteNum = Number(result[1]);
    console.log(xi + ' ' + voteNum)

    let main = async () => {
        zeroProof = await Vote.geneEncProof(attendVote.vote, xi, voteNum);

        if (Util.isEmpty(zeroProof)) {
            alert('自动生成出错！')
            return;
        }
        console.log(zeroProof);
        document.getElementById('EncryptVote').value = zeroProof.vencVi;
        document.getElementById('EncryptProof').value = parent.web3.utils.toHex(zeroProof).slice(2); //解密证明 的十六进制数
    }

    main();
}

function handleEncVote(vote_addr) {
    if (checkParaBeforeSendChain() === false) return;

    Vote.encryptToVote(attendVote.vote, zeroProof.ajList, zeroProof.bjList, zeroProof.rjList, zeroProof.djList, zeroProof.c, zeroProof.vencVi, zeroProof.Yi, zeroProof.currVoterYi)
        .then(() => confirm("加密投票成功!"))
        .catch(console.log);
}

/////////////////////////////////////////////////step3 decrypt
function handleGeneDecProof() {
    let xi = checkParaBeforeGeneProof();
    if (xi === -1) return false;

    let main = async () => {
        zeroProof = await Vote.geneDecProof(attendVote.vote, xi);

        if (Util.isEmpty(zeroProof)) {
            alert('自动生成出错！')
            return;
        }
        console.log(zeroProof);
        document.getElementById('DecryptVote').value = zeroProof.vdecVi;
        document.getElementById('DecryptProof').value = parent.web3.utils.toHex(zeroProof).slice(2); //解密证明 的十六进制数
    }

    main();
}

function handleDecVote(vote_addr, xi) {

    if (checkParaBeforeSendChain() === false) return;

    Vote.decryptToVote(attendVote.vote, zeroProof.r, zeroProof.a1, zeroProof.a2, zeroProof.c, zeroProof.vdecVi, zeroProof.Yi, zeroProof.currVoterYi)
        .then(() => confirm("解密投票成功!"))
        .catch(console.log);
}

///////////////////////////////////////////////////step4 assist
function handleGeneConProof() {
    let xi = checkParaBeforeGeneProof();
    if (xi === -1) return false;

    let main = async () => {
        zeroProof = await Vote.geneConProof(attendVote.vote, xi);

        if (Util.isEmpty(zeroProof)) {
            alert('自动生成出错！')
            return;
        }
        console.log(zeroProof);
        document.getElementById('AssistVote').value = zeroProof.vassVi;
        document.getElementById('AssistProof').value = parent.web3.utils.toHex(zeroProof).slice(2); //解密证明 的十六进制数
    }

    main();
}

function handleConVote(vote_addr, xi) {
    if (checkParaBeforeSendChain() === false) return;

    Vote.constructVote(attendVote.vote, zeroProof.r, zeroProof.a1, zeroProof.a2, zeroProof.c, zeroProof.vassVi, zeroProof.hi, zeroProof.currVoterYi)
        .then(() => confirm("构造投票成功!"))
        .catch(console.log);

}

///////////////////////////////////////////////////step5 recover
function handleGeneRecProof() {
    let xi = checkParaBeforeGeneProof();
    if (xi === -1) return false;

    let main = async () => {
        zeroProof = await Vote.geneRecProof(attendVote.vote, xi);

        if (Util.isEmpty(zeroProof)) {
            alert('自动生成出错！')
            return;
        }
        console.log(zeroProof);
        document.getElementById('RecoverVote').value = zeroProof.vrecVi;
        document.getElementById('RecoverProof').value = parent.web3.utils.toHex(zeroProof).slice(2); //解密证明 的十六进制数
    }

    main();
}

function handleRecVote(vote_addr, xi) {
    if (checkParaBeforeSendChain() === false) return;

    Vote.recoverVote(attendVote.vote, zeroProof.r, zeroProof.a1, zeroProof.a2, zeroProof.c, zeroProof.vrecVi, zeroProof.hj, zeroProof.currVoterYi)
        .then(() => confirm("恢复投票成功!"))
        .catch(console.log);

}

///////////////////////////////////////////////////tally vote result phrase
function handleSerAndTallyVote(vote_addr) {

    handleSearchVote();

    setTimeout(handleTallyVote, 1000);

    // handleTallyVote();
}

function handleTallyVote(vote_addr) {
    confirm('正在计算投票结果！请稍等...' + attendVote.name);
    
    Vote.tallyVote(attendVote.vote)
        .then((tallyGvi) => {
            document.getElementById('CandidateName').value = tallyGvi;
        })
        .catch(() => confirm('计算投票结果出错！投票还未结束!'));
}











/**
 *  
 */
var leftOption = 0;
//根据左侧按钮切换界面
function LeftOption(index) {
    leftOption = index;

    var register = document.getElementById("RegisterPage");
    var encrypt = document.getElementById("EncryptPage");
    var decrypt = document.getElementById("DecryptPage");
    var assist = document.getElementById("AssistPage");
    var recover = document.getElementById("RecoverPage");
    if (index == 0) {
        register.setAttribute("style", "dispaly:'';");
        encrypt.setAttribute("style", "display:none;");
        decrypt.setAttribute("style", "display:none;");
        assist.setAttribute("style", "display:none;");
        recover.setAttribute("style", "display:none;");
    } else if (index == 1) {
        register.setAttribute("style", "display:none;");
        encrypt.setAttribute("style", "dispaly:'';");
        decrypt.setAttribute("style", "display:none;");
        assist.setAttribute("style", "display:none;");
        recover.setAttribute("style", "display:none;");
    } else if (index == 2) {
        register.setAttribute("style", "display:none;");
        encrypt.setAttribute("style", "display:none;");
        decrypt.setAttribute("style", "dispaly:'';");
        assist.setAttribute("style", "display:none;");
        recover.setAttribute("style", "display:none;");
    } else if (index == 3) {
        register.setAttribute("style", "display:none;");
        encrypt.setAttribute("style", "display:none;");
        decrypt.setAttribute("style", "display:none;");
        assist.setAttribute("style", "dispaly:'';");
        recover.setAttribute("style", "display:none;");
    } else if (index == 4) {
        register.setAttribute("style", "display:none;");
        encrypt.setAttribute("style", "display:none;");
        decrypt.setAttribute("style", "display:none;");
        assist.setAttribute("style", "display:none;");
        recover.setAttribute("style", "dispaly:'';");
    }
}
/*点击弹出窗口*/
function popBox() {
    var popBox = document.getElementById("popBox");
    var popLayer = document.getElementById("popLayer");
    popBox.style.display = "block";
    popLayer.style.display = "block";
};
/*点击关闭窗口*/
function closeBox() {
    var popBox = document.getElementById("popBox");
    var popLayer = document.getElementById("popLayer");
    popBox.style.display = "none";
    popLayer.style.display = "none";
}
var radioOption = -1;

function radio(index) {
    radioOption = index;
    var radios = document.getElementsByName("radio");
    radios.forEach(btnRadio => {
        btnRadio.setAttribute("class", "btnRadio");
    });
    radios[index].setAttribute("class", "btnRadioClick");
}

function setVoteName(name) {
    var names = document.getElementsByName("voteName");
    names.forEach(n => {
        n.innerText = name;
    });
}


var candidateRadioAddress = undefined;

function setVoteCandidate() {
    if (voteAddress == undefined) return;

    var account = parent.currAccount;
    var web3 = parent.web3;

    var voteContract = new web3.eth.Contract(parent.voteAbi, voteAddress);
    voteContract.methods.GetCandidateList().call({ from: account }, function(error, result) {
        if (error) {
            console.log(error);
            alert("获取候选人列表出错,投票尚未开始！");
        } else {
            var address = result[0];
            var nameList = ParseNames(result[1], result[2], web3);
            candidateRadioAddress = address;
            SetRadioOption(nameList);

            voteContract.methods.GetMyCandidate().call({ from: account }, function(error, result) {
                if (error) {
                    console.log(error)
                } else {
                    if (result[0] != 0) {
                        radio(result[0] - 1)
                    }
                }
            })
        }
    })

    radioOption = -1;
}

function SetRadioOption(nameList) {
    var div = document.getElementById("radioDiv");
    div.innerHTML = "";
    for (var i = 0; i < nameList.length; i++) {
        var option = `<button class="btnRadio" name="radio" onclick="radio(${i})">${nameList[i]}</button>`
        div.innerHTML += option;
    };
}

function SearchBaseChange(index) {
    var text = index == 0 ? "请输入投票地址..." : "请输入投票名称...";
    document.getElementById("SearchText").setAttribute("placeholder", text);
}