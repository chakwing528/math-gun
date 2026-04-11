// js/topics/rounding.js

// ==========================================
// 近似值專屬錯誤提示訊息
// ==========================================
const msgRoundOff = `<div class="text-red-600 font-bold text-lg mb-1">❗ 捨入 (Round off) 需看下一位來決定四捨五入</div>`;
const msgRoundUp = `<div class="text-red-600 font-bold text-lg mb-1">❗ 上捨入 (Round up) 不論下一位是多少，都要進一</div>`;
const msgRoundDown = `<div class="text-red-600 font-bold text-lg mb-1">❗ 下捨入 (Round down) 不論下一位是多少，直接捨去</div>`;
const msgSigFig = `<div class="text-red-600 font-bold text-lg mb-1">❗ 留意有效數字 (Sig. Fig.) 的計法</div>`;

// ==========================================
// 專為 DSE 捨入設計的穩定引擎 (解決浮點數精度問題)
// ==========================================
function dseRound(val, target, isSf, mode) {
    if (val === 0) return isSf ? "0" : (0).toFixed(target);

    let dp = target;
    if (isSf) {
        let mag = Math.floor(Math.log10(Math.abs(val)));
        dp = target - 1 - mag;
    }
    
    let preciseVal = Number(val.toPrecision(14)); 
    
    let factor1 = dp >= 0 ? 'e+' + dp : 'e' + dp;
    let factor2 = dp >= 0 ? 'e-' + dp : 'e+' + Math.abs(dp);

    let shifted = Number(preciseVal + factor1);
    
    let res;
    if (mode === 'off') {
        res = Number(Math.round(shifted) + factor2);
    } else if (mode === 'up') {
        res = Number(Math.ceil(shifted) + factor2);
    } else if (mode === 'down') {
        res = Number(Math.floor(shifted) + factor2);
    }
    
    if (dp <= 0) {
        return res.toString();
    } else {
        return res.toFixed(dp);
    }
}

// ==========================================
// 題目生成器：近似值與捨入 (Approximation)
// ==========================================
function generateRoundingQuestions(num, levelPref) {
    const bank = [];
    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2', '3'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref).toLowerCase();
        }
        
        let qObj = { id: i + 1, topic: "近似值與捨入 (Approximation)" };
        
        let val, target, isSf, mode, modeText, typeText;
        
        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            val = getRandomInt(10, 99) + getRandomInt(1001, 9999) / 10000; 
            target = getRandomInt(1, 4); 
            isSf = Math.random() > 0.5;
            mode = 'off';
        } else if (levelType === '2') {
            qObj.level = "⭐⭐ 程度 2";
            val = getRandomInt(10, 99) + getRandomInt(1001, 9999) / 10000;
            target = getRandomInt(1, 4);
            isSf = Math.random() > 0.5;
            mode = Math.random() > 0.5 ? 'up' : 'down';
        } else {
            qObj.level = "⭐⭐⭐ 程度 3";
            isSf = true; // 程度三專攻有效數字
            mode = ['off', 'up', 'down'][getRandomInt(0, 3)];
            target = getRandomInt(2, 4); 
            if (Math.random() > 0.5) {
                let zeros = Math.random() > 0.5 ? "0.00" : "0.0";
                val = parseFloat(zeros + getRandomInt(101, 999)); // 前導零小數
            } else {
                val = getRandomInt(10000, 99999); // 大整數補零
            }
        }

        modeText = mode === 'off' ? '捨入 (Round off)' : (mode === 'up' ? '上捨入 (Round up)' : '下捨入 (Round down)');
        typeText = isSf ? '位有效數字 (sig. fig.)' : '位小數 (d.p.)';
        
        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">將數值：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-2">${val}</div>
        <div class="mt-4 text-base sm:text-lg text-slate-600 whitespace-normal leading-relaxed">
            ${modeText} 至 <span class="font-bold text-slate-800">${target}</span> ${typeText}
        </div>`;
        
        let correctStr = dseRound(val, target, isSf, mode);
        let wrong1, wrong2, wrong3;
        
        if (mode === 'off') {
            wrong1 = dseRound(val, target, isSf, 'up'); 
            if (wrong1 === correctStr) wrong1 = dseRound(val, target, isSf, 'down');
            wrong2 = dseRound(val, target + 1, isSf, 'off'); 
            wrong3 = dseRound(val, target - 1 > 0 ? target - 1 : 1, isSf, 'off'); 
        } else if (mode === 'up') {
            wrong1 = dseRound(val, target, isSf, 'down');
            wrong2 = dseRound(val, target, isSf, 'off');
            if (wrong1 === correctStr || wrong2 === correctStr || wrong1 === wrong2) {
               wrong2 = dseRound(val, target + 1, isSf, 'up'); 
            }
            wrong3 = dseRound(val, target - 1 > 0 ? target - 1 : 1, isSf, 'up');
        } else {
            wrong1 = dseRound(val, target, isSf, 'up');
            wrong2 = dseRound(val, target, isSf, 'off');
            if (wrong1 === correctStr || wrong2 === correctStr || wrong1 === wrong2) {
               wrong2 = dseRound(val, target + 1, isSf, 'down'); 
            }
            wrong3 = dseRound(val, target - 1 > 0 ? target - 1 : 1, isSf, 'down');
        }

        // 確保錯誤選項不重複
        let wSet = new Set([correctStr]);
        let makeUnique = (w) => {
            let cw = w;
            while (wSet.has(cw)) { cw = cw + "0"; } 
            wSet.add(cw);
            return cw;
        };

        wrong1 = makeUnique(wrong1);
        wrong2 = makeUnique(wrong2);
        wrong3 = makeUnique(wrong3);

        let eqCorrectHtml = `<div class="my-2">正確答案：<span class="font-bold">${correctStr}</span></div>`;
        if (isSf) {
            eqCorrectHtml += `<div class="text-sm text-slate-500 mt-2">💡 有效數字從左邊第一個<b>非零數字</b>開始計算。</div>`;
        } else {
            eqCorrectHtml += `<div class="text-sm text-slate-500 mt-2">💡 小數位從<b>小數點後</b>開始計算。</div>`;
        }
        if (mode === 'up') eqCorrectHtml += `<div class="text-sm text-slate-500 mt-1">💡 上捨入：保留位數後的數字無論多少，強制進一。</div>`;
        if (mode === 'down') eqCorrectHtml += `<div class="text-sm text-slate-500 mt-1">💡 下捨入：保留位數後的數字無論多少，直接捨去。</div>`;

        let hintToUse = mode === 'off' ? msgRoundOff : (mode === 'up' ? msgRoundUp : msgRoundDown);
        if (isSf && levelType === '3') hintToUse = msgSigFig;

        let options = [
            { text: `<span class="text-xl font-medium">${correctStr}</span>`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrectHtml) },
            { text: `<span class="text-xl font-medium">${wrong1}</span>`, isCorrect: false, hint: wrapHint(hintToUse, eqCorrectHtml) },
            { text: `<span class="text-xl font-medium">${wrong2}</span>`, isCorrect: false, hint: wrapHint(msgSigFig, eqCorrectHtml) },
            { text: `<span class="text-xl font-medium">${wrong3}</span>`, isCorrect: false, hint: wrapHint(hintToUse, eqCorrectHtml) }
        ];

        qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        bank.push(qObj);
    }
    return bank;
}
