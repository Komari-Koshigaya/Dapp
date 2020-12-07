class Vote {

    // //voteFactory创建vote实例后会到一个地址  根据该地址获取对应的vote实例
    static getVoteInstance(voteAddress) {
        // let web3 = parent.web3;
        let web3 = parent.web3;
        // 获取 合约对象
        // let voteInstance = new web3.eth.Contract(Config.VOTE_ABI,voteAddress);
        return new web3.eth.Contract(Config.VOTE_ABI, voteAddress);
    }

    static getVoteInfo(voteInstance) {
        return new Promise(resolve => {
            //读取该投票实例的参数
            voteInstance.methods.GetVoteInfo()
                .call({ from: parent.currAccount })
                .then(result => {
                    resolve(result);
                });
        });
    }
    //获取指定投票的投票人信息
    static getVoterInfo(voteInstance) {
        return new Promise(resolve => {
            voteInstance.methods.GetVoterInfo()
                .call({ from: parent.currAccount })
                .then(result => {
                    resolve(result);
                });
        });
    }

    //1.向某个合约注册
    static async geneRegProof(voteAddress, xi) { //生成注册的证明
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);
        //获取投票参数
        let voteInfo = await this.getVoteInfo(voteInstance);
        let p = voteInfo[1].p,
            g = voteInfo[1].g;

        //构造 ZK
        let yi = Util.montgomery(g, xi, p),
            ppow = p * p; //(1-p)
        let w = Math.floor(Math.random() * (p + 1) + ppow),
            a = Util.montgomery(g, w, p); //(1-p) 
        let c = parent.web3.utils.keccak256('' + g + yi + a);
        // console.log(`c: ${c} , ${Number(c)} `)
        c = Number(c) % p;
        // let r = BigInt(w - xi * c);
        let r = w - xi * c;
        console.log(`p: ${p}, g: ${g}, xi: ${xi}, yi: ${yi}, w: ${w}, r: ${r}, a: ${a}, c: ${c}`)

        let zeroProof = { r, a, c, yi };
        // console.log(zeroProof)
        return zeroProof;
    }
    static async registerToVote(voteAddress, r, a, c, yi) {
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);

        //向该投票合约注册公钥
        voteInstance.methods.Register(r, a, c, yi)
            // voteInstance.methods.Register(1, 1, 1, 1)
            .send({ from: parent.currAccount, gas: 2721975 })
            .on('receipt', function(receipt) {

                //通过合约事件来判断 合约的验证是否通过
                console.log(receipt)
                let result = receipt.events.NewResult.returnValues; //event的返回值
                if (result.status) { //合约验证通过
                    layer.alert(`${result.status}  向 ${voteInstance._address} 投票注册成功！`, {
                        skin: 'layui-layer-molv' //样式类名
                            ,
                        closeBtn: 0
                    });
                } else //合约验证失败
                    console.warn(`${result.status}  向 ${voteInstance._address} 投票注册失败, ${result.msg}`);
            })
            .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                alert('不在投票注册时间内! 请稍后重试！')
                console.error(error)
            });
    }


    //2.加密投票
    static async calculateYi(voteInstance, currVoterYi) {
        let voterList = await this.getVoterInfo(voteInstance);

        //计算加密投票  序号在投票人之前的投票
        let Yi = 1;
        for (let i = 0; i < voterList.length; i++) {
            if (Number(voterList[i].y) === currVoterYi) break;
            Yi *= voterList[i].y;
        }

        console.log(voterList)
        return new Promise(resolve => resolve(Yi));
    }
    static async geneEncProof(voteAddress, xi, voteNum) { //生成注册的证明
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);
        //获取投票参数
        let voteInfo = await this.getVoteInfo(voteInstance);

        let p = voteInfo[1].p,
            g = voteInfo[1].g,
            q = voteInfo[3],
            o = Number(voteInfo[4]);
        let currVoterYi = Util.montgomery(g, xi, p);
        //计算加密投票
        let Yi = await this.calculateYi(voteInstance, currVoterYi); //去除i自己公钥的连乘

        let vencVi = g ** (2 ** (voteNum * q)) * Util.montgomery(Yi, xi, p);

        console.log(`Successful get the vote info when encrypting the voteing!
            voteAddress: '${voteAddress}', voteNum: ${voteNum}, xi: ${xi}, p: ${p}, 
            g: ${g}, q: ${q}, o: ${o}, currVoterYi: ${currVoterYi}, Yi: ${Yi}, vencVi: ${vencVi}`);


        // 构造 ZK
        let ppow = p * p,
            w = Util.getRandom(ppow + p, ppow); //(p^2+p - p^2)        
        let rjList = new Array(o).fill(0),
            djList = new Array(o).fill(0);

        rjList.forEach((index) => rjList[index] = Util.getRandom(p, 1));
        djList.forEach((index) => djList[index] = Util.getRandom(p, 1));
        let ajList = new Array(o).fill(0),
            bjList = new Array(o).fill(0);

        for (let j = 0; j < o; j++) {
            if (j === voteNum) continue;

            let tmp = Util.montgomery(g, rjList[j], p) * Util.montgomery(currVoterYi, djList[j], p)
            ajList[j] = tmp % p;

            let vj = 2 ** (j * q),
                base = vencVi / (g ** vj);
            tmp = Util.montgomery(Yi, rjList[j], p) * Util.montgomery(Math.floor(base), djList[j], p);
            bjList[j] = tmp % p;
        }

        ajList[voteNum] = Util.montgomery(g, w, p);
        bjList[voteNum] = Util.montgomery(Yi, w, p);

        let c = parent.web3.utils.keccak256('' + g + currVoterYi + vencVi);
        // c = Number(c) % p;
        djList[voteNum] = (Number(c) - djList.reduce((x, y) => x + y)) % p;
        rjList[voteNum] = w - xi * djList[voteNum];

        console.log(`Successful calculate the ZK when encrypting the voteing!
            ajList: [${ajList}], bjList: [${bjList}], rjList: [${rjList}], djList: [${djList}], 
            c: ${c}, vencVi ${vencVi}, Yi ${Yi}, currVoterYi ${currVoterYi}`)

        let zeroProof = { ajList, bjList, rjList, djList, c, vencVi, Yi, currVoterYi };
        return zeroProof;
    }
    static async encryptToVote(voteAddress, ajList, bjList, rjList, djList, c, vencVi, Yi, currVoterYi) {
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);

        //向该投票合约注册公钥
        voteInstance.methods.Encrypt(ajList, bjList, rjList, djList, c, vencVi, Yi, currVoterYi)
            .send({
                from: parent.currAccount,
                gas: 2721975
            })
            .on('receipt', function(receipt) {
                //通过合约事件来判断 合约的验证是否通过
                console.log(receipt)
                let result = receipt.events.NewResult.returnValues; //event的返回值
                if (result.status) { //合约验证通过
                    confirm("加密投票成功!")
                } else //合约验证失败
                    console.warn(`${result.status}  向 ${voteInstance._address} 加密投票失败, ${result.msg}`);
            })
            .on('error', function(error) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                alert('不在加密投票时间内! 请稍后重试！')
                console.error(error)
            });
    }


    //3.解密   带有时间锁 t3时上链
    static async geneDecProof(voteAddress, xi) {
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);
        //获取投票参数
        let voteInfo = await this.getVoteInfo(voteInstance);

        let p = voteInfo[1].p,
            g = voteInfo[1].g,
            currVoterYi = Util.montgomery(g, xi, p);;
        //计算解密vi
        let Yi = await this.calculateYi(voteInstance, currVoterYi); //去除i自己公钥的连乘
        let vdecVi = Util.montgomery(Yi, xi, p);


        // 构造 ZK
        let ppow = p * p,
            w = Util.getRandom(ppow + p, ppow); //(p^2+p - p^2)
        let a1 = Util.montgomery(Yi, w, p),
            a2 = Util.montgomery(g, w, p);
        let c = parent.web3.utils.keccak256('' + a1 + a2);
        c = Number(c) % p;
        let r = w - xi * c;

        console.log(`Successful calculate the ZK when decrypting the voteing!
            p: ${p}, g: ${g}, currVoterYi: ${currVoterYi}, Yi: ${Yi}, 
            vdecVi: ${vdecVi}, r: ${r}, a1: ${a1}, a2: ${a2}, c: ${c}`);

        let zeroProof = { r, a1, a2, c, vdecVi, Yi, currVoterYi };
        return zeroProof;
    }
    static async decryptToVote(voteAddress, r, a1, a2, c, vdecVi, Yi, currVoterYi) {
        //获取投票实例
        let voteInstance = this.getVoteInstance(voteAddress);

        //向该投票合约注册公钥
        voteInstance.methods.Decrypt(r, a1, a2, c, vdecVi, Yi, currVoterYi)
            .send({
                from: parent.currAccount,
                gas: 2721975
            })
            .on('receipt', function(receipt) {
                //通过合约事件来判断 合约的验证是否通过
                console.log(receipt)
                let result = receipt.events.NewResult.returnValues; //event的返回值
                if (result.status) { //合约验证通过
                    let msg = `${result.status}  向 ${voteInstance._address} 解密投票 成功！`;
                    confirm( msg )
                } else { //合约验证失败
                    let msg = `${result.status}  向 ${voteInstance._address} 解密投票 失败, ${result.msg}`;
                    alert(msg)
                }
            })
            .on('error', function(error) {
                alert('不在解密投票时间内! 请稍后重试！')
                console.error(error)
            });
    }


    //4.构造投票 和decrypt相同的nonce 但付出更高的手续费 从而比decrypt具有更高的优先级
    static async geneConProof(voteAddress, xi) {
        let voteInstance = this.getVoteInstance(voteAddress); //获取投票实例
        /* let voteInfo = await this.getVoteInfo(voteInstance);        //获取投票参数
        // let currGasPrice = await parent.web3.eth.getGasPrice();        //获取当前网络的gasprice*/
        //同时获取当前网络的gasprice 、 投票参数、投票人信息
        let [currGasPrice, voteInfo, voterList] = await Promise.all([parent.web3.eth.getGasPrice(),
            this.getVoteInfo(voteInstance), this.getVoterInfo(voteInstance)
        ]);

        let p = voteInfo[1].p,
            g = voteInfo[1].g,
            currVoterYi = Util.montgomery(g, xi, p),
            hi = 1;
        console.log(voterList)


        for (let i = voterList.length - 1; i >= 0; i--) {
            if (Number(voterList[i].y) === currVoterYi) break;
            hi *= voterList[i].y
        }
        let vassVi = Util.montgomery(hi, xi, p);


        // 构造 ZK
        let ppow = p * p,
            w = Util.getRandom(ppow + p, ppow); //(p^2+p - p^2)
        let a1 = Util.montgomery(hi, w, p),
            a2 = Util.montgomery(g, w, p);
        let c = parent.web3.utils.keccak256('' + a1 + a2);
        c = Number(c) % p;
        let r = w - xi * c;

        console.log(`Successful calculate the ZK when assisting the voteing!
            p: ${p}, g: ${g}, currVoterYi: ${currVoterYi}, hi: ${hi}, 
            vassVi: ${vassVi}, r: ${r}, a1: ${a1}, a2: ${a2}, c: ${c}`)

        let zeroProof = { r, a1, a2, c, vassVi, hi, currVoterYi };
        return zeroProof;
    }
    static async constructVote(voteAddress, r, a1, a2, c, vassVi, hi, currVoterYi) {
        let voteInstance = this.getVoteInstance(voteAddress); //获取投票实例
        let currGasPrice = await parent.web3.eth.getGasPrice(); //获取当前网络的gasprice

        //向该投票正式投票
        voteInstance.methods.Assist(r, a1, a2, c, vassVi, hi, currVoterYi)
            .send({
                from: parent.currAccount,
                gas: 2721975,
                gasPrice: currGasPrice * 4
            })
            .on('receipt', function(receipt) {
                //通过合约事件来判断 合约的验证是否通过
                console.log(receipt)
                let result = receipt.events.NewResult.returnValues; //event的返回值
                if (result.status) { //合约验证通过
                    let msg = `${result.status}  向 ${voteInstance._address} 构造投票 成功！`;
                    confirm(msg)
                } else { //合约验证失败
                    let msg = `${result.status}  向 ${voteInstance._address} 构造投票 失败, ${result.msg}`;
                    alert(msg)
                }
            })
            .on('error', function(error) {
                alert('不在解密投票时间内! 请稍后重试！')
                console.error(error)
            });
    }

    //5. 若4未上链 3上链 则可执行恢复投票来得到4失败的投票vi
    static async geneRecProof(voteAddress, xi) {
        let voteInstance = this.getVoteInstance(voteAddress); //获取投票实例
        let [voteInfo, voterList] = await Promise.all([
            this.getVoteInfo(voteInstance), this.getVoterInfo(voteInstance)
        ]);

        let p = voteInfo[1].p,
            g = voteInfo[1].g,
            currVoterYi = Util.montgomery(g, xi, p);
        console.log(voterList)

        let yiIndex = 0,
            yiBeforeMulti = 1,
            yiAfterMulti = 1;
        for (let i = 0; i < voterList.length; i++) {
            if (voterList[i].y === currVoterYi) {
                yiIndex = i;
            }
        }
        voterList.forEach((item, index) => {
            if (index < yiIndex && (item.notFailer === false || item.isHonest === false))
                yiBeforeMulti *= item.y
            else if (index > yiIndex && (item.notFailer === false || item.isHonest === false))
                yiAfterMulti *= item.y;
        });
        let hj = yiAfterMulti * Util.getMultiReverseByExEuclidean(yiBeforeMulti, p);
        let vrecVi = Util.montgomery(hj, xi, p);


        // 构造 ZK
        let ppow = p * p,
            w = Util.getRandom(ppow + p, ppow); //(p^2+p - p^2)
        let a1 = Util.montgomery(hj, w, p),
            a2 = Util.montgomery(g, w, p);
        let c = parent.web3.utils.keccak256('' + a1 + a2);
        c = Number(c) % p;
        let r = w - xi * c;

        console.log(`Successful calculate the ZK when recovering the voteing!
            p: ${p}, g: ${g}, yiIndex: ${yiIndex}, yiBeforeMulti: ${yiBeforeMulti}, yiAfterMulti: ${yiAfterMulti}, voterList: [${voterList}],
            currVoterYi: ${currVoterYi}, hj: ${hj}, vrecVi: ${vrecVi}, r: ${r}, a1: ${a1}, a2: ${a2}, c: ${c}`)

        let zeroProof = { r, a1, a2, c, vrecVi, hj, currVoterYi };
        return zeroProof;
    }
    static async recoverVote(voteAddress, r, a1, a2, c, vrecVi, hj, currVoterYi) {
        let voteInstance = this.getVoteInstance(voteAddress); //获取投票实例

        voteInstance.methods.Recover(r, a1, a2, c, vrecVi, hj, currVoterYi)
            .send({
                from: parent.currAccount,
                gas: 2721975,
            })
            .on('receipt', function(receipt) {
                //通过合约事件来判断 合约的验证是否通过
                console.log(receipt)
                let result = receipt.events.NewResult.returnValues; //event的返回值
                if (result.status) { //合约验证通过
                    let msg = `${result.status}  向 ${voteInstance._address} 构造投票 成功！`;
                    layer.msg(msg, { time: 2000, icon: 1 });
                } else { //合约验证失败
                    let msg = `${result.status}  向 ${voteInstance._address} 构造投票 失败, ${result.msg}`;
                    layer.msg(msg, { time: 2000, icon: 2 });
                }
            })
            .on('error', function(error) {
                alert('不在解密投票时间内! 请稍后重试！')
                console.error(error)
            });
    }

    //6.  计算特定投票的投票结果
    static async tallyVote(voteAddress) {
        let voteInstance = this.getVoteInstance(voteAddress); //获取投票实例
        let [voteInfo, voterList] = await Promise.all([
            this.getVoteInfo(voteInstance), this.getVoterInfo(voteInstance)
        ]);
        console.log(voteInfo);

        let failerList = [],
            honestList = [];
        voterList.forEach((item, index) => {
            if (item.notFailer === false || item.isHonest === false) { //投票失败者集合
                failerList.push(item);
            } else honestList.push(item); //投票成功者集合
        });

        console.log(honestList)
        console.log('failer:')
        console.log(failerList)
        let tallyGvi = 1;
        if (failerList.length === 0) { //所有人均诚实投票
            let allVenc = 1, allVass = 1;
            for (let item of honestList) {
                allVenc *= item.venc;
                allVass *= item.vass;
                // tallyGvi *= (item.venc / item.vass);
            }
            tallyGvi = allVenc / allVass;
            console.log('cal vi when there are not failers: ' + tallyGvi)
        } else {
            let honestTallyGvi = 1,
                failerTallyGvi = 1;
            //计算 i不属于 failers
            for (let item of honestList) {
                honestTallyGvi *= item.vrec * (item.venc / item.vass);
            }
            //计算i属于failers
            for (let item of failerList) {
                failerTallyGvi *= item.venc * item.vdec;
            }
            tallyGvi = honestTallyGvi * failerTallyGvi;
            console.log('cal vi when there are failers: ' + tallyGvi)
        }

        let o = Number(voteInfo[3]), q= Number(voteInfo[4]),maxLen = o * (2 ** ( (o -1) * q ) ) , g = Number(voteInfo[1].g), vi = 0;
        for(let i=0;i<=maxLen;i++){
            if( g**i === tallyGvi )  vi = i;
        }

        let candidate = new Array(o), winner = 0;
        candidate[0]= vi % (2 ** q), 
        candidate[1]=((vi-candidate[0]) % (2**(2*q))) / (2 ** q), 
        candidate[2]=(vi-candidate[0]-candidate[1]*(2 ** q)) / (2**(2*q*q));

        for(let i=0;i<o;i++){
            if(candidate[i] > candidate[winner]) winner = i;
        }

        console.log(`Successful talling the vote!
            failerList: [${failerList}], honestList: [${honestList}], tallyGvi: ${tallyGvi}, 
            vi: ${vi}, maxLen: ${maxLen}, candidate: [${candidate}], winner: ${winner} `)
        return winner;
    }
}