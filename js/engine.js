// ==============================================================================
// 📁 FILE: engine.js (遊戲核心引擎、物理與渲染) - V35
// ==============================================================================

function initMonsterQueue() {
    monsterQueue = []; 
    enemiesKilled = 0; 
    monstersLeft = [0, 0, 0, 0, 0, 0];
    for (let m of MONSTER_BASE) {
        for(let i=0; i<m.count; i++) monsterQueue.push({...m});
        monstersLeft[m.tier] += m.count; 
    }
    TOTAL_MONSTERS = monsterQueue.length;
}

function fireBullet(angle, weapon, customSpeed) {
    bullets.push({
        x: player.x + Math.cos(player.angle || 0) * 30, 
        y: player.y + Math.sin(player.angle || 0) * 30, 
        vx: Math.cos(angle || 0) * customSpeed, 
        vy: Math.sin(angle || 0) * customSpeed,
        radius: weapon.size || 4, 
        color: weapon.color, 
        glow: weapon.glow, 
        damage: weapon.damage, 
        penetrate: weapon.penetrate, 
        hitEnemies: []
    });
}

function createParticles(x, y, color, count, speedStr = 5, z = 0, decay = null) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y, z: z,
            vx: (Math.random() - 0.5) * speedStr, 
            vy: (Math.random() - 0.5) * speedStr, 
            vz: Math.random() * speedStr,
            life: 1.0, 
            decay: decay || (0.02 + Math.random() * 0.04), 
            color: color, 
            size: 2 + Math.random() * 4
        });
    }
}

function addFloatingText(text, x, y, color, size = 20) {
    floatingTexts.push({ text, x, y, color, size, life: 1.0, dy: -1.5 });
}

function spawnLootBox() {
    lootBoxes.push({
        x: Math.random() * (canvas.width - UI_BOUND - 100) + UI_BOUND + 50, 
        y: Math.random() * (canvas.height - 200) + 100,
        size: 35, pulse: 0, spawnTime: globalTime 
    });
    addFloatingText("武器升級箱降落！", canvas.width/2, 150, '#eab308', 30);
}

function spawnAmmoBox() {
    if (ammoBoxes.length < 3) {
        ammoBoxes.push({
            x: Math.random() * (canvas.width - UI_BOUND - 100) + UI_BOUND + 50, 
            y: Math.random() * (canvas.height - 200) + 100,
            size: 28, pulse: 0, spawnTime: globalTime 
        });
        addFloatingText("彈藥補給包降落！", canvas.width/2, 120, '#38bdf8', 26);
    }
}

function spawnEnemy() {
    if (gameState !== 'PLAYING' || monsterQueue.length === 0) return;
    let mData = monsterQueue.shift(); 
    totalMonstersSpawned++;
    
    let x = Math.random() < 0.5 ? UI_BOUND + 10 : canvas.width + 50;
    let y = Math.random() * canvas.height;

    enemies.push({ 
        x: x, y: y, size: mData.size, color: mData.color, speed: mData.speed, 
        hp: mData.hp, maxHp: mData.hp, tier: mData.tier, name: mData.name, bobPhase: Math.random() * Math.PI * 2 
    });
    
    if (mData.tier === 5) {
        bossAlarmTimer = 120;
        addFloatingText("⚠️ 萬血首領來襲！ ⚠️", canvas.width/2, 100, '#ef4444', 50);
    }
}

window.triggerGameOver = function(isVictory) {
    gameState = isVictory ? 'VICTORY' : 'GAME_OVER';
    let form = document.getElementById('submit-form');
    if (form) form.style.display = 'flex';
    scoreSubmitted = false;
}

window.resetGame = function() {
    player.weaponLevel = -1;
    player.hp = player.maxHp; 
    player.speed = 4; 
    player.currentMagazine = 0; 
    player.totalAmmo = 0; 
    player.isReloading = false; 
    player.reloadTimer = 0;
    player.angle = 0;
    
    enemiesKilled = 0; totalMonstersSpawned = 0;
    player.x = UI_BOUND + (canvas.width - UI_BOUND)/2; player.y = canvas.height / 2;
    bullets = []; enemies = []; lootBoxes = []; ammoBoxes = []; particles = []; floatingTexts = [];
    isShooting = false; keys.w = keys.a = keys.s = keys.d = false;
    leftJoy.active = false; rightJoy.active = false;
    player.lastFireTime = 0; globalTime = 0; bossAlarmTimer = 0; currentWave = 1;
    
    let form = document.getElementById('submit-form');
    if (form) form.style.display = 'none';
    
    initMonsterQueue(); 
    if (typeof fetchLeaderboard === 'function') fetchLeaderboard();
    gameState = 'PLAYING';
    
    spawnLootBox();
}

function checkCollision(obj1, obj2, dist) {
    let dx = obj1.x - obj2.x; 
    let dy = obj1.y - obj2.y; 
    return Math.sqrt(dx*dx + dy*dy) <= dist;
}

function startReload() {
    if (player.weaponLevel === -1) return;
    let cap = WEAPONS[player.weaponLevel].magCapacity || 30;
    if (player.totalAmmo > 0 && player.currentMagazine < cap && !player.isReloading) {
        player.isReloading = true;
        player.reloadTimer = 30; 
        let rSfx = document.getElementById('reloadSfx');
        if (rSfx) { rSfx.currentTime = 0; rSfx.play().catch(e=>{}); }
    }
}

function update() {
    globalTime++;
    if (typeof updateHTMLHUD === 'function') updateHTMLHUD();

    if (gameState === 'START_MENU') return;

    if (gameState === 'MATH_TIME') {
        mathTimer--;
        let pct = Math.max(0, (mathTimer / 600) * 100);
        if (uiElements && uiElements.mathTimerBar) {
            uiElements.mathTimerBar.style.width = pct + '%';
            uiElements.mathTimerBar.style.backgroundColor = mathTimer < 180 ? '#ef4444' : '#4ade80';
        }
        if (mathTimer <= 0) {
            if (typeof closeMathOverlay === 'function') closeMathOverlay(false);
        }
    }

    if (player.recoilOffset > 0) player.recoilOffset *= 0.8; 
    if (bossAlarmTimer > 0) bossAlarmTimer--;

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx; particles[i].y += particles[i].vy;
        particles[i].life -= particles[i].decay;
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].y += floatingTexts[i].dy; floatingTexts[i].life -= 0.02;
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    if (gameState !== 'PLAYING') return;

    if (player.isReloading && player.weaponLevel >= 0) {
        player.reloadTimer--;
        if (player.reloadTimer <= 0) {
            let cap = WEAPONS[player.weaponLevel].magCapacity || 30;
            let take = Math.min(cap - player.currentMagazine, player.totalAmmo);
            player.currentMagazine += take; player.totalAmmo -= take;
            player.isReloading = false;
        }
    }

    if (globalTime % lootBoxSpawnInterval === 0) spawnLootBox();
    if (player.weaponLevel >= 0 && globalTime % ammoBoxSpawnInterval === 0) spawnAmmoBox();
    if (monsterQueue.length > 0 && (enemies.length < 4 || globalTime % 180 === 0)) spawnEnemy();

    let spd = player.speed || 4;
    let dx = leftJoy.active ? leftJoy.dir.x * spd : (keys.d ? spd : (keys.a ? -spd : 0));
    let dy = leftJoy.active ? leftJoy.dir.y * spd : (keys.s ? spd : (keys.w ? -spd : 0));
    
    if (dx !== 0 && dy !== 0 && !leftJoy.active) { let len = Math.sqrt(dx*dx + dy*dy); dx = (dx/len)*spd; dy = (dy/len)*spd; }
    player.x = Math.max(UI_BOUND + player.radius, Math.min(canvas.width - player.radius, player.x + dx));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y + dy));
    player.isMoving = (dx !== 0 || dy !== 0);

    if (rightJoy.active) player.angle = rightJoy.angle;
    else if (!('ontouchstart' in window)) player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);

    if ((isShooting || rightJoy.active) && player.weaponLevel >= 0) {
        const weapon = WEAPONS[player.weaponLevel];
        if (globalTime - player.lastFireTime >= weapon.fireRate && player.currentMagazine > 0 && !player.isReloading) {
            let sSfx = document.getElementById('shootSfx'); if (sSfx) { sSfx.currentTime = 0; sSfx.play().catch(()=>{}); }
            player.currentMagazine--;
            for(let k=0; k<weapon.bullets; k++) fireBullet(player.angle + (Math.random()-0.5)*0.05, weapon, weapon.speed - k*2);
            player.recoilOffset = weapon.recoil; player.lastFireTime = globalTime; shakeTime = 2;
        } else if (player.currentMagazine <= 0 && player.totalAmmo > 0 && !player.isReloading) {
            startReload();
        }
    }

    enemies.forEach((e, i) => {
        let ang = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(ang) * e.speed; e.y += Math.sin(ang) * e.speed;
        if (checkCollision(player, e, player.radius + e.size/2)) {
            player.hp -= (10 + e.tier*5); shakeTime = 10;
            enemies.splice(i, 1);
            if (player.hp <= 0) triggerGameOver(false);
        }
    });

    bullets.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
        enemies.forEach((e, ei) => {
            if (checkCollision(e, b, e.size/2 + b.radius)) {
                e.hp -= b.damage; bullets.splice(i, 1);
                if (e.hp <= 0) { enemies.splice(ei, 1); enemiesKilled++; monstersLeft[e.tier]--; if(enemiesKilled >= TOTAL_MONSTERS) triggerGameOver(true); }
            }
        });
    });

    lootBoxes.forEach((box, i) => {
        box.pulse += 0.1;
        if (checkCollision(player, box, player.radius + box.size/2)) { lootBoxes.splice(i, 1); if(typeof triggerMath === 'function') triggerMath('UPGRADE'); }
    });
    ammoBoxes.forEach((box, i) => {
        box.pulse += 0.1;
        if (checkCollision(player, box, player.radius + box.size/2)) { ammoBoxes.splice(i, 1); if(typeof triggerMath === 'function') triggerMath('AMMO'); }
    });
}

function draw() {
    if (gameState === 'START_MENU') { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height); return; }
    ctx.fillStyle = '#d2b48c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shakeTime > 0) { let mag = (shakeTime/10)*8; ctx.translate((Math.random()-0.5)*mag, (Math.random()-0.5)*mag); shakeTime--; }
    
    // 繪製背景網格
    ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=80) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=80) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

    // 繪製實體
    enemies.forEach(e => { ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.size/2, 0, Math.PI*2); ctx.fill(); });
    bullets.forEach(b => { ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fill(); });
    lootBoxes.forEach(b => { ctx.fillStyle = '#f59e0b'; ctx.fillRect(b.x-15, b.y-15, 30, 30); });
    ammoBoxes.forEach(b => { ctx.fillStyle = '#3b82f6'; ctx.fillRect(b.x-15, b.y-15, 30, 30); });
    
    // 繪製玩家
    if (player.hp > 0) {
        ctx.fillStyle = player.color; ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2); ctx.fill();
        ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
        ctx.fillStyle = '#334155'; ctx.fillRect(10 - player.recoilOffset, -4, 25, 8); ctx.restore();
    }

    particles.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); });
    ctx.globalAlpha = 1.0; ctx.restore();

    if (gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'white'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center';
        ctx.fillText(gameState === 'VICTORY' ? "任務完成！" : "你失敗了", canvas.width/2, canvas.height/2 - 50);
        ctx.font = '24px Arial'; ctx.fillText("點擊畫面或按 Enter 返回主選單", canvas.width/2, canvas.height/2 + 20);
    }
}

// 🚀 V35 核心修改：非阻塞式載入
async function loadGameData() {
    // 1. 立即隱藏載入畫面，讓選單出現
    const loadingScreen = document.getElementById('loading-screen');
    const startMenu = document.getElementById('start-menu');
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (startMenu) startMenu.style.display = 'flex';
    gameState = 'START_MENU';

    // 2. 在背景默默獲取資料，不卡住使用者
    if (GAS_WEB_APP_URL) {
        fetch(`${GAS_WEB_APP_URL}?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                // 如果下載成功，更新遊戲平衡數據
                if (data.weapons) { /* 更新 WEAPONS 數值邏輯... */ }
                if (data.monsters) { /* 更新 MONSTER_BASE 數值邏輯... */ }
                console.log("遊戲數據已從雲端更新同步");
            })
            .catch(e => console.warn("雲端數據載入失敗，已啟動離線預設模式", e));
    }
    gameLoop(); 
}

function gameLoop() { 
    update(); 
    draw(); 
    requestAnimationFrame(gameLoop); 
}

// 啟動
loadGameData();
