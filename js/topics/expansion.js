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
    
    // 輔助函數：格式化 (Ax + B)
    function fmtTerm(coef, c, v='x') {
        let r = "";
        if (coef === 1) r += v;
        else if (coef === -1) r += "-" + v;
        else r += coef + v;
        
        if (c > 0) r += " + " + c;
        else if (c < 0) r += " - " + Math.abs(c);
        return r;
    }

    // 輔助函數：格式化一元二次式 Ax^2 + Bx + C
    function fmtPoly2(A, B, C, v='x') {
        let r = "";
        if (A === 1) r += `${v}^2`; 
        else if (A === -1) r += `-${v}^2`; 
        else if (A !== 0) r += `${A}${v}^2`;
        
        if (B === 1) r += r ? ` + ${v}` : `${v}`; 
        else if (B === -1) r += r ? ` - ${v}` : `-${v}`; 
        else if (B > 0) r += r ? ` + ${B}${v}` : `${B}${v}`; 
        else if (B < 0) r += r ? ` - ${Math.abs(B)}${v}` : `${B}${v}`;
        
        if (C > 0) r += r ? ` + ${C}` : `${C}`; 
        else if (C < 0) r += r ? ` - ${Math.abs(C)}` : `${C}`;
        
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
        
        let a = 0, b = 0;
        let type = getRandomInt(0, 2); // 0: (bx+a)^2, 1: (bx+a)(bx-a)

        // 隨機產生 A (-20 至 20，不等於 0)
        do { a = getRandomInt(-20, 21); } while (a === 0);

        // 根據程度產生 B
        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            b = 1;
        } else if (levelType === '2') {
            qObj.level = "⭐⭐ 程度 2";
            b = getRandomInt(1, 21); // B 為 1-20 正整數
        } else {
            qObj.level = "⭐⭐⭐ 程度 3";
            do { b = getRandomInt(-20, 21); } while (b === 0); // B 為 -20至20，不為0
        }

        let correctStr = "";
        let steps = [];
        let options = [];
        let wSet = new Set();
        let bStr = (b === 1) ? 'x' : (b === -1 ? '-x' : b + 'x');

        if (type === 0) {
            // 題型：(bx+a)^2
            questionMathStr = `(${fmtTerm(b, a)})^2`;
            correctStr = fmtPoly2(b*b, 2*a*b, a*a);
            
            steps = [
                { text: `(${fmtTerm(b, a)})^2`, hide: false },
                { text: `(${bStr})^2 + 2(${bStr})(${a}) + (${a})^2`, hide: true },
                { text: correctStr, hide: false }
            ];
            
            options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, buildEq(steps))});
            wSet.add(correctStr);

            // 錯誤 1：忘記中間項 2ab
            let w1 = fmtPoly2(b*b, 0, a*a);
            if (!wSet.has(w1)) { options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgExp1, buildEq(steps))}); wSet.add(w1); }

            // 錯誤 2：中間項正負號錯誤
            let w2 = fmtPoly2(b*b, -2*a*b, a*a);
            if (!wSet.has(w2)) { options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgExp2, buildEq(steps))}); wSet.add(w2); }

            // 錯誤 3：係數忘記平方或忘記乘 2
            let w3 = fmtPoly2(b, 2*a*b, a*a);
            if (b === 1 || b === -1 || wSet.has(w3)) w3 = fmtPoly2(b*b, a*b, a*a); 
            if (!wSet.has(w3)) { options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgExp3, buildEq(steps))}); wSet.add(w3); }
            
        } else {
            // 題型：(bx+a)(bx-a)
            questionMathStr = `(${fmtTerm(b, a)})(${fmtTerm(b, -a)})`;
            correctStr = fmtPoly2(b*b, 0, -a*a);
            
            steps = [
                { text: `(${fmtTerm(b, a)})(${fmtTerm(b, -a)})`, hide: false },
                { text: `(${bStr})^2 - (${Math.abs(a)})^2`, hide: true },
                { text: correctStr, hide: false }
            ];
            
            options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, buildEq(steps))});
            wSet.add(correctStr);

            // 錯誤 1：符號錯誤
            let w1 = fmtPoly2(b*b, 0, a*a);
            if (!wSet.has(w1)) { options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgExp2, buildEq(steps))}); wSet.add(w1); }

            // 錯誤 2：係數忘記平方
            let w2 = fmtPoly2(b, 0, -a*a);
            if (b === 1 || b === -1 || wSet.has(w2)) w2 = fmtPoly2(b*b, -2*a*b, -a*a);
            if (!wSet.has(w2)) { options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgExp3, buildEq(steps))}); wSet.add(w2); }

            // 錯誤 3：與完全平方混淆
            let w3 = fmtPoly2(b*b, -2*Math.abs(a)*b, a*a);
            if (!wSet.has(w3)) { options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgExp1, buildEq(steps))}); wSet.add(w3); }
        }

        // 確保選項滿 4 個
        while (options.length < 4) {
            let fakeC = a*a + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
            let wFake = type === 0 ? fmtPoly2(b*b, 2*a*b, fakeC) : fmtPoly2(b*b, 0, -fakeC);
            if (!wSet.has(wFake)) {
                options.push({text: `\\( \\displaystyle ${wFake} \\)`, isCorrect: false, hint: wrapHint(msgExp2, buildEq(steps))});
                wSet.add(wFake);
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
