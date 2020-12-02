let attendVote = null; //默认投票地址

function handleSearchVote() {
    setVoteName('请先搜索您想参加的投票!');
    attendVote = null;//每次点击搜索都重置默认的投票地址
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

        if(Util.isEmpty(attendVote)){
            alert(`未找到 ${index===0?'地址':'名称'}为 ${searchText} 的投票信息!`)
        }

        //设置获取到的投票相关信息
        setVoteName(`您正在参加的投票： ${attendVote.name}`);
        if(leftOption == 1)setVoteCandidate();
        parent.SetVoteInfo(attendVote.vote);
        return voteList;
    }

    getAllVote();
    console.log("搜索投票结束!");
}

function handleRegisterVote() {
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

function Register(index) {
    if (voteAddress == undefined) return;

    var web3 = parent.web3;
    var abi = parent.voteAbi;
    var account = parent.currAccount;
    if (account == undefined) return;

    var name = parent.web3.utils.utf8ToHex(document.getElementById("voterName").value);
    var id = document.getElementById("voterID").value;

    var voteContract = new web3.eth.Contract(abi, voteAddress);

    voteContract.methods.GetVoteInfo().call(function(error, info) {
        if (info[2] * 1000 < new Date().getTime()) {
            alert(`投票注册已结束\n\n结束时间：${ParseTimeFormat(info[2] * 1000, " - ")}`)
            return;
        }
        if (!info[5]) {
            alert('公开投票无需申请投票资格!')
            return
        }
        if (parent.currPwd == undefined || !parent.currAccount) {
            alert("账号未解锁或账号不存在!");
            return;
        }

        if (parent.isManager) {
            var addr = document.getElementById("voterAccount").value;
            if (!web3.utils.isAddress(addr)) {
                alert("非法地址");
                return;
            }
            web3.eth.personal.unlockAccount(parent.currAccount, parent.currPwd, (error, result) => {
                if (error) {
                    alert("账号出错");
                } else {
                    voteContract.methods.Register(index, addr, name, id).send({ from: account, password: parent.currPwd })
                        .on('receipt', function(receipt) {
                            if (receipt.events.Success.returnValues)
                                alert("申请成功");
                        })
                        .on('error', function(error) {
                            alert('申请出错')
                        })
                }
            })

        } else {
            web3.eth.personal.unlockAccount(parent.currAccount, parent.currPwd, (error, result) => {
                if (error) {
                    alert("账号出错");
                } else {
                    voteContract.methods.RegisterSelf(index, name, id).send({ from: account, password: parent.currPwd })
                        .on('receipt', function(receipt) {
                            if (receipt.events.Success.returnValues)
                                alert("申请成功");
                        })
                        .on('error', function(error) {
                            alert('申请出错')
                        })
                }
            })

        }
    })



}

function Vote() {
    if (voteAddress == undefined || radioOption == -1) return;

    var web3 = parent.web3;
    var abi = parent.voteAbi;
    var account = parent.currAccount;
    if (account == undefined) return;

    var voteContract = new web3.eth.Contract(abi, voteAddress);
    voteContract.methods.GetVoteInfo().call(function(error, info) {
        if (error) {
            console.log(error);
        }

        if (info[3] * 1000 > new Date().getTime()) {
            alert(`投票尚未开始，请稍等！\n开始时间：${ParseTimeFormat(info[3] * 1000," - ")}\n结束时间：${ParseTimeFormat(info[4] * 1000, " - ")}`)
            return;
        }
        if (info[4] * 1000 < new Date().getTime()) {
            alert(`投票已经结束！\n开始时间：${ParseTimeFormat(info[3] * 1000," - ")}\n结束时间：${ParseTimeFormat(info[4] * 1000, " - ")}`)
            return;
        }
        if (parent.currPwd == undefined || !parent.currAccount) {
            alert("账号未解锁或账号不存在!");
            return;
        }
        web3.eth.personal.unlockAccount(parent.currAccount, parent.currPwd, (error, result) => {
            if (error) {
                alert("账号出错");
            } else {
                voteContract.methods.ToVote(radioOption).send({ from: account, password: parent.currPwd })
                    .on('receipt', function(receipt) {
                        if (receipt.events.Success.returnValues[0])
                            alert("投票成功");
                    })
                    .on('error', function(error) {
                        alert('投票出错')
                    })
            }
        })
    })

}

function SearchBaseChange(index) {
    var text = index == 0 ? "请输入投票地址..." : "请输入投票名称...";
    document.getElementById("SearchText").setAttribute("placeholder", text);
}