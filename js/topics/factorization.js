// js/topics/factorization.js

// ==========================================
// 專屬錯誤提示訊息
// ==========================================
const msgFact1 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 未完全提出公因式</div>`;
const msgFact2 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 恆等式運用錯誤</div>`;
const msgFact3 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 十字相乘組合錯誤</div>`;
const msgFact4 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 正負號錯誤</div>`;

// ==========================================
// 題目生成器：因式分解 (Factorization)
// ==========================================
function generateFactorizationQuestions(num, levelPref) {
    const bank = [];
    const singleVars = ['x', 'y', 'a', 'b', 'm', 'n']; 
    const varPairs = [['x', 'y'], ['a', 'b'], ['m', 'n'], ['p', 'q']];
    
    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2', '3'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref).toLowerCase();
        }
        
        let subType = Math.random() > 0.5 ? 'a' : 'b'; 

        // 為了相容可能從舊 URL 或暫存傳來的舊設定
        if (levelType === '2a' || levelType === '2b') {
            subType = levelType.charAt(1);
            levelType = '2';
        } else if (levelType === '3a' || levelType === '3b') {
            subType = levelType.charAt(1);
            levelType = '3';
        }
        
        let qObj = { id: i + 1, topic: "因式分解 (Factorization)" };
        let questionMathStr = "";

        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            const v = singleVars[getRandomInt(0, singleVars.length)];
            let c = getRandomInt(2, 6);
            let k = getRandomInt(2, 7);
            if(c === k) k += 1; 
            let sign = Math.random() > 0.5 ? 1 : -1;
            let signStr = sign > 0 ? '+' : '-';
            let ckAbs = c * k; 

            questionMathStr = `${c}${v}^2 ${signStr} ${ckAbs}${v}`;
            
            let correctStr = `${c}${v}(${v} ${signStr} ${k})`;
            let wrong1 = `${v}(${c}${v} ${signStr} ${ckAbs})`; // 漏數字
            let wrong2 = `${c}(${v}^2 ${signStr} ${k}${v})`; // 漏變數
            let wrong3 = `${c}${v}(${v} ${sign > 0 ? '-' : '+'} ${k})`; // 符號錯

            let eqCorrect = buildEq([
                { text: `${c}${v}^2 ${signStr} ${ckAbs}${v}`, hide: false },
                { text: `${c}${v}(${v}) ${signStr} ${c}${v}(${k})`, hide: true },
                { text: correctStr, hide: false }
            ]);

            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrect) },
                { text: `\\( \\displaystyle ${wrong1} \\)`, isCorrect: false, hint: wrapHint(msgFact1 + "<div class='text-sm text-slate-500 mb-2'>(提示：數字部份也可以抽出公因式喔！)</div>", buildEq([{text: `${c}${v}^2 ${signStr} ${ckAbs}${v}`, hide: false}, {text: `${c}${v}(${v}) ${signStr} ${c}${v}(${k})`, hide: true}, {text: correctStr, hide: false}])) },
                { text: `\\( \\displaystyle ${wrong2} \\)`, isCorrect: false, hint: wrapHint(msgFact1 + "<div class='text-sm text-slate-500 mb-2'>(提示：變數也可以抽出公因式喔！)</div>", buildEq([{text: `${c}${v}^2 ${signStr} ${ckAbs}${v}`, hide: false}, {text: `${c}${v}(${v}) ${signStr} ${c}${v}(${k})`, hide: true}, {text: correctStr, hide: false}])) },
                { text: `\\( \\displaystyle ${wrong3} \\)`, isCorrect: false, hint: wrapHint(msgFact4, buildEq([{text: `${c}${v}^2 ${signStr} ${ckAbs}${v}`, hide: false}, {text: `${c}${v}(${v}) ${signStr} ${c}${v}(${k})`, hide: true}, {text: correctStr, hide: false}])) }
            ];
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        } else if (levelType === '2' && subType === 'a') {
            qObj.level = "⭐⭐ 程度 2";
            let type = getRandomInt(0, 2); 
            const v = singleVars[getRandomInt(0, singleVars.length)];
            let options = [];
            
            if (type === 0) {
                let k = getRandomInt(2, 10);
                let k2 = k * k;
                questionMathStr = `${v}^2 - ${k2}`;
                let correctStr = `(${v} - ${k})(${v} + ${k})`;
                
                let eqCorrect = buildEq([
                    { text: `${v}^2 - ${k2}`, hide: false },
                    { text: `${v}^2 - ${k}^2`, hide: true },
                    { text: correctStr, hide: false }
                ]);

                let wrong1 = `(${v} - ${k})^2`;
                let wrong2 = `(${v} + ${k})^2`;
                let wrong3 = `(${v} - ${k2})^2`;

                options.push({ text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrect) });
                [wrong1, wrong2, wrong3].forEach((w, idx) => {
                    options.push({ text: `\\( \\displaystyle ${w} \\)`, isCorrect: false, hint: wrapHint(msgFact2 + "<div class='text-sm text-slate-500 mb-2'>(提示：留意平方差公式 \\( a^2 - b^2 = (a-b)(a+b) \\) )</div>", buildEq([{text: `${v}^2 - ${k2}`, hide: false}, {text: `${v}^2 - ${k}^2`, hide: true}, {text: correctStr, hide: false}])) });
                });
            } else {
                let k = getRandomInt(2, 9);
                let sign = Math.random() > 0.5 ? 1 : -1;
                let signStr = sign > 0 ? '+' : '-';
                let k2 = k * k;
                let midCoef = 2 * k;
                
                questionMathStr = `${v}^2 ${signStr} ${midCoef}${v} + ${k2}`;
                let correctStr = `(${v} ${signStr} ${k})^2`;
                
                let eqCorrect = buildEq([
                    { text: `${v}^2 ${signStr} ${midCoef}${v} + ${k2}`, hide: false },
                    { text: `${v}^2 ${signStr} 2(${v})(${k}) + ${k}^2`, hide: true },
                    { text: correctStr, hide: false }
                ]);

                let wrong1 = `(${v} ${sign > 0 ? '-' : '+'} ${k})^2`;
                let wrong2 = `(${v} - ${k})(${v} + ${k})`;
                let wrong3 = `(${v} ${signStr} ${k2})^2`;

                options.push({ text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrect) });
                [wrong1, wrong2, wrong3].forEach((w, idx) => {
                    options.push({ text: `\\( \\displaystyle ${w} \\)`, isCorrect: false, hint: wrapHint(msgFact2 + "<div class='text-sm text-slate-500 mb-2'>(提示：留意完全平方公式 \\( a^2 \\pm 2ab + b^2 = (a \\pm b)^2 \\) )</div>", buildEq([{text: `${v}^2 ${signStr} ${midCoef}${v} + ${k2}`, hide: false}, {text: `${v}^2 ${signStr} 2(${v})(${k}) + ${k}^2`, hide: true}, {text: correctStr, hide: false}])) });
                });
            }
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        } else if (levelType === '2' && subType === 'b') {
            qObj.level = "⭐⭐ 程度 2";
            let type = getRandomInt(0, 2); 
            const pair = varPairs[getRandomInt(0, varPairs.length)];
            const v1 = pair[0], v2 = pair[1];
            let options = [];
            
            if (type === 0) {
                let k = getRandomInt(2, 10);
                let k2 = k * k;
                questionMathStr = `${v1}^2 - ${k2}${v2}^2`;
                let correctStr = `(${v1} - ${k}${v2})(${v1} + ${k}${v2})`;
                
                let eqCorrect = buildEq([
                    { text: `${v1}^2 - ${k2}${v2}^2`, hide: false },
                    { text: `${v1}^2 - (${k}${v2})^2`, hide: true },
                    { text: correctStr, hide: false }
                ]);

                let wrong1 = `(${v1} - ${k}${v2})^2`;
                let wrong2 = `(${v1} + ${k}${v2})^2`;
                let wrong3 = `(${v1} - ${k}${v2})(${v1} - ${k}${v2})`;

                options.push({ text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrect) });
                [wrong1, wrong2, wrong3].forEach((w, idx) => {
                    options.push({ text: `\\( \\displaystyle ${w} \\)`, isCorrect: false, hint: wrapHint(msgFact2 + "<div class='text-sm text-slate-500 mb-2'>(提示：留意平方差公式 \\( a^2 - b^2 = (a-b)(a+b) \\) )</div>", buildEq([{text: `${v1}^2 - ${k2}${v2}^2`, hide: false}, {text: `${v1}^2 - (${k}${v2})^2`, hide: true}, {text: correctStr, hide: false}])) });
                });
            } else {
                let k = getRandomInt(2, 9);
                let sign = Math.random() > 0.5 ? 1 : -1;
                let signStr = sign > 0 ? '+' : '-';
                let k2 = k * k;
                let midCoef = 2 * k;
                
                questionMathStr = `${v1}^2 ${signStr} ${midCoef}${v1}${v2} + ${k2}${v2}^2`;
                let correctStr = `(${v1} ${signStr} ${k}${v2})^2`;
                
                let eqCorrect = buildEq([
                    { text: `${v1}^2 ${signStr} ${midCoef}${v1}${v2} + ${k2}${v2}^2`, hide: false },
                    { text: `${v1}^2 ${signStr} 2(${v1})(${k}${v2}) + (${k}${v2})^2`, hide: true },
                    { text: correctStr, hide: false }
                ]);

                let wrong1 = `(${v1} ${sign > 0 ? '-' : '+'} ${k}${v2})^2`;
                let wrong2 = `(${v1} - ${k}${v2})(${v1} + ${k}${v2})`;
                let wrong3 = `(${v1} ${signStr} ${k2}${v2})^2`;

                options.push({ text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrect) });
                [wrong1, wrong2, wrong3].forEach((w, idx) => {
                    options.push({ text: `\\( \\displaystyle ${w} \\)`, isCorrect: false, hint: wrapHint(msgFact2 + "<div class='text-sm text-slate-500 mb-2'>(提示：留意完全平方公式 \\( a^2 \\pm 2ab + b^2 = (a \\pm b)^2 \\) )</div>", buildEq([{text: `${v1}^2 ${signStr} ${midCoef}${v1}${v2} + ${k2}${v2}^2`, hide: false}, {text: `${v1}^2 ${signStr} 2(${v1})(${k}${v2}) + (${k}${v2})^2`, hide: true}, {text: correctStr, hide: false}])) });
                });
            }
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        } else if (levelType === '3' && subType === 'a') {
            qObj.level = "⭐⭐⭐ 程度 3";
            const v = singleVars[getRandomInt(0, singleVars.length)];
            let a, b;
            do {
                a = getRandomInt(-5, 6);
                b = getRandomInt(-5, 6);
            } while (a === 0 || b === 0 || a === -b || a === b);
            let B = a + b;
            let C = a * b;

            let term2 = fmtB(B, v);
            let term3 = fmtC(C);

            questionMathStr = `${v}^2 ${term2} ${term3}`;
            
            let correctStr = `(${v} ${fmtC(a)})(${v} ${fmtC(b)})`;
            let wrong1 = `(${v} ${fmtC(-a)})(${v} ${fmtC(-b)})`; 
            let wrong2 = `(${v} ${fmtC(-a)})(${v} ${fmtC(b)})`;  
            
            let fakeA = a + 1;
            let fakeB = b - 1;
            if (fakeA === 0) fakeA = 2;
            if (fakeB === 0) fakeB = -2;
            let wrong3 = `(${v} ${fmtC(fakeA)})(${v} ${fmtC(fakeB)})`;

            let crossDiagram = `\\begin{matrix} ${v} & & ${a} \\\\ & \\times & \\\\ ${v} & & ${b} \\end{matrix}`;
            let crossEval = `(${v})(${b}) + (${v})(${a}) = ${fmtB(B, v).replace('+', '').trim()}`;

            let eqCorrectHtml = `
            <div class="text-left w-full">
                <div class="my-2">\\( \\displaystyle ${v}^2 ${term2} ${term3} \\)</div>
                <details class="group my-2">
                    <summary class="cursor-pointer text-indigo-500 hover:text-indigo-700 font-bold text-sm select-none flex items-center gap-1 outline-none ml-1">
                        <svg class="w-5 h-5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        查看十字相乘法步驟
                    </summary>
                    <div class="mt-4 pl-4 flex flex-col w-full overflow-x-auto math-scroll items-center bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                        <div class="mb-3 text-xl">\\( \\displaystyle ${crossDiagram} \\)</div>
                        <div class="text-sm text-slate-600 border-t border-indigo-200 pt-3 mt-1 w-full text-center">
                            檢驗中間項：\\( \\displaystyle ${crossEval} \\)
                        </div>
                    </div>
                </details>
                <div class="my-2">\\( \\displaystyle = ${correctStr} \\)</div>
            </div>
            `;

            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrectHtml) },
                { text: `\\( \\displaystyle ${wrong1} \\)`, isCorrect: false, hint: wrapHint(msgFact4 + "<div class='text-sm text-slate-500 mb-2'>(請看正確拆解步驟)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${wrong2} \\)`, isCorrect: false, hint: wrapHint(msgFact4 + "<div class='text-sm text-slate-500 mb-2'>(請看正確拆解步驟)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${wrong3} \\)`, isCorrect: false, hint: wrapHint(msgFact3 + "<div class='text-sm text-slate-500 mb-2'>(提示：要尋找相乘等於常數項，相加等於中間項的組合)</div>", eqCorrectHtml) }
            ];
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        } else {
            qObj.level = "⭐⭐⭐ 程度 3";
            const pair = varPairs[getRandomInt(0, varPairs.length)];
            const v1 = pair[0], v2 = pair[1];
            let a, b;
            do {
                a = getRandomInt(-5, 6);
                b = getRandomInt(-5, 6);
            } while (a === 0 || b === 0 || a === -b || a === b);
            let B = a + b;
            let C = a * b;

            let term2 = fmtB(B, v1 + v2);
            let term3 = fmtB(C, v2 + '^2');

            questionMathStr = `${v1}^2 ${term2} ${term3}`;
            
            let correctStr = `(${v1} ${fmtVarCoef(a, v2)})(${v1} ${fmtVarCoef(b, v2)})`;
            let wrong1 = `(${v1} ${fmtVarCoef(-a, v2)})(${v1} ${fmtVarCoef(-b, v2)})`; 
            let wrong2 = `(${v1} ${fmtVarCoef(-a, v2)})(${v1} ${fmtVarCoef(b, v2)})`;  
            
            let fakeA = a + 1;
            let fakeB = b - 1;
            if (fakeA === 0) fakeA = 2;
            if (fakeB === 0) fakeB = -2;
            let wrong3 = `(${v1} ${fmtVarCoef(fakeA, v2)})(${v1} ${fmtVarCoef(fakeB, v2)})`;

            let crossDiagram = `\\begin{matrix} ${v1} & & ${fmtVarCoef(a, v2)} \\\\ & \\times & \\\\ ${v1} & & ${fmtVarCoef(b, v2)} \\end{matrix}`;
            let crossEval = `(${v1})(${fmtVarCoef(b, v2)}) + (${v1})(${fmtVarCoef(a, v2)}) = ${fmtB(B, v1+v2).replace('+', '').trim()}`;

            let eqCorrectHtml = `
            <div class="text-left w-full">
                <div class="my-2">\\( \\displaystyle ${v1}^2 ${term2} ${term3} \\)</div>
                <details class="group my-2">
                    <summary class="cursor-pointer text-indigo-500 hover:text-indigo-700 font-bold text-sm select-none flex items-center gap-1 outline-none ml-1">
                        <svg class="w-5 h-5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                        查看十字相乘法步驟
                    </summary>
                    <div class="mt-4 pl-4 flex flex-col w-full overflow-x-auto math-scroll items-center bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                        <div class="mb-3 text-xl">\\( \\displaystyle ${crossDiagram} \\)</div>
                        <div class="text-sm text-slate-600 border-t border-indigo-200 pt-3 mt-1 w-full text-center">
                            檢驗中間項：\\( \\displaystyle ${crossEval} \\)
                        </div>
                    </div>
                </details>
                <div class="my-2">\\( \\displaystyle = ${correctStr} \\)</div>
            </div>
            `;

            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrectHtml) },
                { text: `\\( \\displaystyle ${wrong1} \\)`, isCorrect: false, hint: wrapHint(msgFact4 + "<div class='text-sm text-slate-500 mb-2'>(請看正確拆解步驟)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${wrong2} \\)`, isCorrect: false, hint: wrapHint(msgFact4 + "<div class='text-sm text-slate-500 mb-2'>(請看正確拆解步驟)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${wrong3} \\)`, isCorrect: false, hint: wrapHint(msgFact3 + "<div class='text-sm text-slate-500 mb-2'>(提示：要尋找相乘等於常數項，相加等於中間項的組合)</div>", eqCorrectHtml) }
            ];
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        }

        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">對以下數式進行因式分解：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
            \\( \\displaystyle ${questionMathStr} \\)
        </div>`;

        bank.push(qObj);
    }
    return bank;
}
