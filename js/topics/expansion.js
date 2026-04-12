// js/topics/expansion.js

// ==========================================
// 恆等式展開專用錯誤提示訊息
// ==========================================
const msgExp1 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 忘記了中間項 2ab</div>`;
const msgExp2 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 展開符號發生錯誤</div>`;
const msgExp3 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 係數平方計算錯誤</div>`;

// ==========================================
// 題目生成器：恆等式的展開 (Expansion of Identities)
// ==========================================
function generateExpansionQuestions(num, levelPref) {
    const bank = [];
    const singleVars = ['x', 'y', 'a', 'b', 'm', 'n']; 
    const varPairs = [['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']];

    // 輔助函數：從 Google Sheet 動態設定中取得難度標題與說明
    function getLevelInfo(levelId, defaultTitle) {
        let title = defaultTitle;
        let desc = "";
        
        // 1. 先從系統預設備用設定中讀取
        if (typeof fallbackConfigs !== 'undefined' && fallbackConfigs['expansion']) {
            let lvl = fallbackConfigs['expansion'].levels.find(l => l.id === levelId);
            if (lvl) {
                if (lvl.title) title = lvl.title;
                if (lvl.desc) desc = lvl.desc;
            }
        }
        
        // 2. 若 Google Sheet 有成功載入資料，則覆寫為最新設定
        if (typeof dynamicTopicConfig !== 'undefined' && dynamicTopicConfig.length > 0) {
            let custom = dynamicTopicConfig.find(c => c.topic === 'expansion' && c.levelId === levelId);
            if (custom) {
                if (custom.title) title = custom.title;
                if (custom.desc) desc = custom.desc;
            }
        }
        return { title, desc };
    }

    // 輔助函數：格式化 (c1 v1 + c2 v2)
    function fmtBinomial(c1, v1, c2, v2) {
        let r = "";
        if (c1 === 1) r += v1;
        else if (c1 === -1) r += "-" + v1;
        else r += c1 + v1;
        
        let absC2 = Math.abs(c2);
        let term2 = "";
        if (absC2 === 1 && v2 !== "") term2 = v2;
        else term2 = absC2 + v2;

        if (c2 > 0) r += " + " + term2;
        else if (c2 < 0) r += " - " + term2;
        
        return r;
    }

    // 輔助函數：格式化 A v1^2 + B v1 v2 + C v2^2
    function fmtPoly2_2var(A, B, C, v1, v2) {
        let r = "";
        let v1_sq = v1 ? v1 + "^2" : "";
        if (A === 1) r += v1_sq || "1";
        else if (A === -1) r += "-" + (v1_sq || "1");
        else if (A !== 0) r += A + v1_sq;
        
        let v1v2 = v1 + v2;
        if (B === 1) r += r ? ` + ${v1v2}` : `${v1v2}`;
        else if (B === -1) r += r ? ` - ${v1v2}` : `-${v1v2}`;
        else if (B > 0) r += r ? ` + ${B}${v1v2}` : `${B}${v1v2}`;
        else if (B < 0) r += r ? ` - ${Math.abs(B)}${v1v2}` : `${B}${v1v2}`;
        
        let v2_sq = v2 ? v2 + "^2" : "";
        if (C === 1) r += r ? ` + ${v2_sq || "1"}` : `${v2_sq || "1"}`;
        else if (C === -1) r += r ? ` - ${v2_sq || "1"}` : `-${v2_sq || "1"}`;
        else if (C > 0) r += r ? ` + ${C}${v2_sq}` : `${C}${v2_sq}`;
        else if (C < 0) r += r ? ` - ${Math.abs(C)}${v2_sq}` : `${C}${v2_sq}`;
        
        return r || "0";
    }

    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2', '3'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref);
        }
        
        let qObj = { id: i + 1, topic: "恆等式的展開 (Expansion)" };
        let questionMathStr = "";
        
        let type = getRandomInt(0, 2); // 0: 完全平方, 1: 平方差
        let c1 = 1, c2 = 1, v1 = 'x', v2 = '';

        // 產生隨機數 A (作為常數項或第二變數係數)：1至10，正負隨機
        let randA = getRandomInt(1, 11) * (Math.random() > 0.5 ? 1 : -1);

        if (levelType === '1') {
            let info = getLevelInfo('L1', "⭐ 程度 1");
            qObj.level = info.title;
            qObj.desc = info.desc;
            c1 = 1;
            c2 = randA;
            v1 = singleVars[getRandomInt(0, singleVars.length)];
        } else if (levelType === '2') {
            let info = getLevelInfo('L2', "⭐⭐ 程度 2");
            qObj.level = info.title;
            qObj.desc = info.desc;
            // 確保 X 的係數 (c1) 絕對為 1-5 的正整數，杜絕出現負數
            c1 = getRandomInt(1, 6); 
            c2 = randA;              
            v1 = singleVars[getRandomInt(0, singleVars.length)];
        } else {
            let info = getLevelInfo('L3', "⭐⭐⭐ 程度 3");
            qObj.level = info.title;
            qObj.desc = info.desc;
            // 確保第一變數的係數 (c1) 絕對為 1-5 的正整數
            c1 = getRandomInt(1, 6); 
            c2 = randA;              
            let pair = varPairs[getRandomInt(0, varPairs.length)];
            v1 = pair[0];
            v2 = pair[1];            // 啟動雙變數模式
        }

        let correctStr = "";
        let steps = [];
        let options = [];
        let wSet = new Set();
        
        let term1Str = c1 === 1 ? v1 : c1 + v1;
        let B_str = (Math.abs(c2) === 1 && v2 !== "") ? v2 : Math.abs(c2) + v2;

        if (type === 0) {
            // 完全平方: (c1 v1 + c2 v2)^2
            questionMathStr = `(${fmtBinomial(c1, v1, c2, v2)})^2`;
            correctStr = fmtPoly2_2var(c1*c1, 2*c1*c2, c2*c2, v1, v2);
            
            steps = [
                { text: `(${fmtBinomial(c1, v1, c2, v2)})^2`, hide: false },
                { text: `(${term1Str})^2 ${c2 > 0 ? '+' : '-'} 2(${term1Str})(${B_str}) + (${B_str})^2`, hide: true },
                { text: correctStr, hide: false }
            ];
            
            options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, buildEq(steps))});
            wSet.add(correctStr);

            // 錯誤 1：忘記中間項 2ab
            let w1 = fmtPoly2_2var(c1*c1, 0, c2*c2, v1, v2);
            if (!wSet.has(w1)) { options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgExp1, buildEq(steps))}); wSet.add(w1); }

            // 錯誤 2：中間項正負號錯誤
            let w2 = fmtPoly2_2var(c1*c1, -2*c1*c2, c2*c2, v1, v2);
            if (!wSet.has(w2)) { options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgExp2, buildEq(steps))}); wSet.add(w2); }

            // 錯誤 3：係數忘記平方或漏乘2
            let w3 = fmtPoly2_2var(c1, 2*c1*c2, c2, v1, v2);
            if ((c1 === 1 && Math.abs(c2) === 1) || wSet.has(w3)) w3 = fmtPoly2_2var(c1*c1, c1*c2, c2*c2, v1, v2); 
            if (!wSet.has(w3)) { options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgExp3, buildEq(steps))}); wSet.add(w3); }
            
        } else {
            // 平方差: (c1 v1 + c2 v2)(c1 v1 - c2 v2)
            questionMathStr = `(${fmtBinomial(c1, v1, Math.abs(c2), v2)})(${fmtBinomial(c1, v1, -Math.abs(c2), v2)})`;
            correctStr = fmtPoly2_2var(c1*c1, 0, -c2*c2, v1, v2);
            
            steps = [
                { text: `(${fmtBinomial(c1, v1, Math.abs(c2), v2)})(${fmtBinomial(c1, v1, -Math.abs(c2), v2)})`, hide: false },
                { text: `(${term1Str})^2 - (${B_str})^2`, hide: true },
                { text: correctStr, hide: false }
            ];
            
            options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, buildEq(steps))});
            wSet.add(correctStr);

            // 錯誤 1：符號錯誤 (減號寫成加號)
            let w1 = fmtPoly2_2var(c1*c1, 0, c2*c2, v1, v2);
            if (!wSet.has(w1)) { options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgExp2, buildEq(steps))}); wSet.add(w1); }

            // 錯誤 2：係數忘記平方
            let w2 = fmtPoly2_2var(c1, 0, -Math.abs(c2), v1, v2);
            if ((c1 === 1 && Math.abs(c2) === 1) || wSet.has(w2)) w2 = fmtPoly2_2var(c1*c1, -2*c1*Math.abs(c2), -c2*c2, v1, v2);
            if (!wSet.has(w2)) { options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgExp3, buildEq(steps))}); wSet.add(w2); }

            // 錯誤 3：與完全平方混淆
            let w3 = fmtPoly2_2var(c1*c1, -2*c1*Math.abs(c2), c2*c2, v1, v2);
            if (!wSet.has(w3)) { options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgExp1, buildEq(steps))}); wSet.add(w3); }
        }

        // 確保選項滿 4 個，生成動態干擾項
        while (options.length < 4) {
            let fakeC = c2*c2 + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
            if (fakeC <= 0) fakeC = Math.abs(c2*c2) + 1; // 避免 0 或負數導致格式異常
            let wFake = type === 0 ? fmtPoly2_2var(c1*c1, 2*c1*c2, fakeC, v1, v2) : fmtPoly2_2var(c1*c1, 0, -fakeC, v1, v2);
            
            let optText = `\\( \\displaystyle ${wFake} \\)`;
            if (!options.some(o => o.text === optText)) {
                options.push({text: optText, isCorrect: false, hint: wrapHint(msgExp2, buildEq(steps))});
            }
        }

        qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">展開以下數式：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
            \\( \\displaystyle ${questionMathStr} \\)
        </div>`;
        
        bank.push(qObj);
    }
    return bank;
}
