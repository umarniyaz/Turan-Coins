const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user || {};
const firstName = user.first_name || 'Kullanıcı';
const lastName = user.last_name || '';
const userId = user.id || 0;

const API_URL = 'https://turancoin-bot.onrender.com';

const greetingEl = document.getElementById('greeting');
const usernameEl = document.getElementById('username');
const coinBalanceEl = document.getElementById('coinBalance');
const walletCoinBalanceEl = document.getElementById('walletCoinBalance');
const tlBalanceEl = document.getElementById('tlBalance');
const walletTlBalanceEl = document.getElementById('walletTlBalance');
const progressFill = document.getElementById('progressFill');
const progressEarned = document.getElementById('progressEarned');
const progressTarget = document.getElementById('progressTarget');
const progressTimer = document.getElementById('progressTimer');
const watchAdBtn = document.getElementById('watchAdBtn');
const adsWatchedEl = document.getElementById('adsWatched');
const premiumCard = document.getElementById('premiumCard');
const premiumIcon = document.getElementById('premiumIcon');
const coinRain = document.getElementById('coinRain');
const balanceCard = document.getElementById('balanceCard');
const withdrawalsList = document.getElementById('withdrawalsList');
const toast = document.getElementById('toast');
const ligName = document.getElementById('ligName');
const ligMedal = document.getElementById('ligMedal');
const ligDetail = document.getElementById('ligDetail');
const ligProgressFill = document.getElementById('ligProgressFill');
const referralLink = document.getElementById('referralLink');
const bottomNav = document.querySelector('.bottom-nav');

let coinBalance = 0;
let adsWatched = 0;
let isPremium = false;
let totalEarned = 0;
let currentLigRate = 0.03;
const DAILY_LIMIT = 50;

const ligIcons = {
    'Bronz': { letter: 'B', cssClass: 'bronz' },
    'Gümüş': { letter: 'G', cssClass: 'gumus' },
    'Altın': { letter: 'A', cssClass: 'altin' },
    'Platin': { letter: 'P', cssClass: 'platin' },
    'Elit': { letter: 'E', cssClass: 'elit' },
    'Efsane': { letter: 'EF', cssClass: 'efsane' }
};

function getLig(totalAds) {
    if (totalAds >= 3001) return { name: 'Efsane', rate: 0.25, next: null };
    if (totalAds >= 1501) return { name: 'Elit', rate: 0.18, next: 3001 };
    if (totalAds >= 701) return { name: 'Platin', rate: 0.12, next: 1501 };
    if (totalAds >= 301) return { name: 'Altın', rate: 0.08, next: 701 };
    if (totalAds >= 101) return { name: 'Gümüş', rate: 0.05, next: 301 };
    return { name: 'Bronz', rate: 0.03, next: 101 };
}

function updateLigCard() {
    const lig = getLig(totalEarned);
    currentLigRate = isPremium ? lig.rate * 2 : lig.rate;
    
    ligName.textContent = lig.name;
    const iconData = ligIcons[lig.name];
    ligMedal.className = 'lig-medal ' + iconData.cssClass;
    ligMedal.querySelector('.lig-medal-inner').textContent = iconData.letter;
    ligDetail.textContent = currentLigRate.toFixed(2) + ' TL / reklam';
    
    if (lig.next) {
        const progress = ((totalEarned % 100) / 100) * 100;
        ligProgressFill.style.width = Math.min(progress, 100) + '%';
    } else {
        ligProgressFill.style.width = '100%';
    }
}

function updateTimer() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    progressTimer.textContent = `Sıfırlanmasına: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
updateTimer();
setInterval(updateTimer, 1000);

function animateNumber(el, newValue) {
    const oldValue = parseInt(el.textContent) || 0;
    if (oldValue === newValue) return;
    
    el.classList.add('number-animate-out');
    setTimeout(() => {
        el.textContent = newValue;
        el.classList.remove('number-animate-out');
        el.classList.add('number-animate-in');
        setTimeout(() => el.classList.remove('number-animate-in'), 300);
    }, 150);
}

function updateBalance(animate = false) {
    if (animate) {
        animateNumber(coinBalanceEl, coinBalance);
        animateNumber(walletCoinBalanceEl, coinBalance);
    } else {
        coinBalanceEl.textContent = coinBalance;
        walletCoinBalanceEl.textContent = coinBalance;
    }
    
    const tlValue = coinBalance * currentLigRate;
    tlBalanceEl.textContent = tlValue.toFixed(2);
    walletTlBalanceEl.textContent = tlValue.toFixed(2);
    
    const earnedToday = adsWatched * currentLigRate;
    const percent = Math.min((earnedToday / 5) * 100, 100);
    progressFill.style.width = percent + '%';
    progressEarned.textContent = earnedToday.toFixed(2) + ' TL';
    adsWatchedEl.textContent = adsWatched;
    
    if (isPremium) {
        premiumCard.style.display = 'block';
        premiumIcon.style.display = 'inline';
    }
    
    if (!isPremium && adsWatched >= DAILY_LIMIT) {
        watchAdBtn.classList.add('disabled');
        watchAdBtn.innerHTML = '<span>Günlük Limit Doldu</span>';
    }
    
    updateLigCard();
}

async function loadUserData() {
    try {
        const response = await fetch(API_URL + '/api/get_user', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userId,
                username: user.username || '',
                first_name: firstName
            })
        });
        const data = await response.json();
        if (data.success) {
            coinBalance = data.balance || 0;
            adsWatched = data.ads_watched_today || 0;
            isPremium = data.is_premium || false;
            totalEarned = data.total_earned || 0;
            currentLigRate = data.lig_rate || 0.03;
            updateBalance(false);
        }
    } catch (e) {
        console.log('API bağlantı hatası');
    }
}

function spawnCoinRain() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin-fall';
            const inner = document.createElement('div');
            inner.className = 'coin-fall-inner';
            coin.appendChild(inner);
            coin.style.left = Math.random() * 90 + 5 + '%';
            coin.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
            coin.style.animationDelay = Math.random() * 0.5 + 's';
            const size = Math.random() * 16 + 12;
            coin.style.width = size + 'px';
            coin.style.height = size + 'px';
            coinRain.appendChild(coin);
            setTimeout(() => coin.remove(), 3000);
        }, i * 60);
    }
}

function shimmerBalanceCard() {
    balanceCard.classList.add('shimmer');
    setTimeout(() => balanceCard.classList.remove('shimmer'), 1000);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hide');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
    }, 2000);
}

const randomNames = [
    'mehmet_47', 'ayse_kar', 'can_34', 'elif_99', 'john_doe',
    'maria_silva', 'ahmed_77', 'elena_volk', 'yusuf_ali', 'zeynep_01',
    'dmitriy_k', 'fatima_nur', 'sara_m', 'ali_can', 'emma_w',
    'lucas_f', 'nina_p', 'omar_h', 'selin_a', 'tom_b',
    'ada_l', 'kerem_08', 'luna_x', 'mert_23', 'nora_k'
];

const randomTimes = [
    'Az önce', '1 dk önce', '2 dk önce', '5 dk önce',
    '10 dk önce', '15 dk önce', '30 dk önce', '45 dk önce',
    '1 saat önce', '2 saat önce', '3 saat önce', 'Bugün',
    'Bugün', 'Dün', 'Dün'
];

function generateRandomWithdrawals() {
    withdrawalsList.innerHTML = '';
    const count = 3 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < count; i++) {
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        const randomTime = randomTimes[Math.floor(Math.random() * randomTimes.length)];
        const randomAmount = (50 + Math.random() * 4950).toFixed(2);
        
        const item = document.createElement('div');
        item.className = 'withdrawal-item';
        item.innerHTML = `
            <div>
                <div class="withdrawal-user">***${randomName}</div>
                <div class="withdrawal-time">${randomTime}</div>
            </div>
            <div class="withdrawal-amount">+${randomAmount} TL</div>
        `;
        withdrawalsList.appendChild(item);
    }
}

watchAdBtn.addEventListener('click', async () => {
    if (watchAdBtn.classList.contains('disabled')) return;
    
    watchAdBtn.innerHTML = '<span>⏳ Reklam yükleniyor...</span>';
    watchAdBtn.style.pointerEvents = 'none';
    
    try {
        show_11561450().then(async () => {
            try {
                const response = await fetch(API_URL + '/api/add_coins', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ user_id: userId, coins: 1 })
                });
                const data = await response.json();
                if (data.success) {
                    coinBalance = data.new_balance;
                    totalEarned = data.total_earned;
                    adsWatched += 1;
                    
                    const oldLig = getLig(totalEarned - 1).name;
                    const newLig = getLig(totalEarned).name;
                    
                    spawnCoinRain();
                    shimmerBalanceCard();
                    showToast('+1 Coin Eklendi!');
                    updateBalance(true);
                    
                    if (oldLig !== newLig) {
                        tg.showPopup({
                            title: '🎉 Lig Atladınız!',
                            message: `${oldLig} liginden ${newLig} ligine yükseldiniz!`,
                            buttons: [{type: 'ok'}]
                        });
                    }
                    
                    tg.HapticFeedback.notificationOccurred('success');
                }
            } catch (e) {
                tg.showPopup({ title: 'Hata', message: 'Coin eklenemedi.', buttons: [{type: 'ok'}] });
            }
            
            watchAdBtn.innerHTML = '<span class="btn-icon">▶</span><span>Reklam İzle</span>';
            watchAdBtn.style.pointerEvents = 'auto';
            
        }).catch(() => {
            watchAdBtn.innerHTML = '<span class="btn-icon">▶</span><span>Reklam İzle</span>';
            watchAdBtn.style.pointerEvents = 'auto';
            tg.showPopup({
                title: 'Reklam Bulunamadı',
                message: 'Şu anda reklam yok. Lütfen sonra tekrar deneyin.',
                buttons: [{type: 'ok'}]
            });
        });
    } catch (e) {
        watchAdBtn.innerHTML = '<span class="btn-icon">▶</span><span>Reklam İzle</span>';
        watchAdBtn.style.pointerEvents = 'auto';
    }
});

const navItems = document.querySelectorAll('.nav-item');
const pages = {
    'page-home': document.getElementById('page-home'),
    'page-tasks': document.getElementById('page-tasks'),
    'page-leaderboard': document.getElementById('page-leaderboard'),
    'page-referral': document.getElementById('page-referral'),
    'page-wallet': document.getElementById('page-wallet'),
    'page-miner': document.getElementById('page-miner')
};

function showPage(pageId) {
    bottomNav.style.display = 'flex';
    navItems.forEach(nav => nav.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    Object.keys(pages).forEach(key => pages[key].classList.remove('active'));
    pages[pageId].classList.add('active');
    
    if (pageId === 'page-leaderboard') {
        loadLeaderboard();
    }
}

function showMinerPage() {
    bottomNav.style.display = 'none';
    navItems.forEach(nav => nav.classList.remove('active'));
    Object.keys(pages).forEach(key => pages[key].classList.remove('active'));
    pages['page-miner'].classList.add('active');
    loadMinerStatus();
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        showPage(item.dataset.page);
        tg.HapticFeedback.impactOccurred('light');
    });
});

referralLink.textContent = `https://t.me/turancoinsbot?start=${userId}`;

document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(referralLink.textContent);
    showToast('Link kopyalandı!');
});

document.getElementById('refBtn').addEventListener('click', () => {
    showPage('page-referral');
});

document.getElementById('premiumBtn').addEventListener('click', () => {
    const text = `Premium üyelik satın almak istiyorum. ID: ${userId}`;
    window.open(`https://t.me/turancoinsdestek?text=${encodeURIComponent(text)}`, '_blank');
});

document.getElementById('withdrawOption').addEventListener('click', () => {
    const tlValue = coinBalance * currentLigRate;
    
    if (tlValue < 50) {
        tg.showPopup({
            title: 'Yetersiz Bakiye',
            message: `Minimum çekim tutarı 50 TL.\nMevcut bakiyen: ${tlValue.toFixed(2)} TL\n\nDaha fazla reklam izleyin!`,
            buttons: [{type: 'ok'}]
        });
        return;
    }
    
    const text = `Para çekmek istiyorum. ID: ${userId}. Bakiye: ${tlValue.toFixed(2)} TL`;
    window.open(`https://t.me/turancoinsdestek?text=${encodeURIComponent(text)}`, '_blank');
});

document.getElementById('kartOption').addEventListener('click', () => {
    if (!isPremium) {
        tg.showPopup({
            title: 'Premium Gerekli',
            message: 'İstanbulkart yükleme sadece premium kullanıcılara özeldir.',
            buttons: [{type: 'ok'}]
        });
        return;
    }
    const text = `İstanbulkart yükleme istiyorum. ID: ${userId}`;
    window.open(`https://t.me/turancoinsdestek?text=${encodeURIComponent(text)}`, '_blank');
});

document.getElementById('ucOption').addEventListener('click', () => {
    const ucPackages = document.getElementById('ucPackages');
    if (ucPackages.style.display === 'none') {
        ucPackages.style.display = 'block';
        ucPackages.style.animation = 'pageIn 0.4s ease';
    } else {
        ucPackages.style.display = 'none';
    }
});

document.querySelectorAll('.uc-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const ucAmount = btn.dataset.uc;
        const coinCost = btn.closest('.uc-package').dataset.coin;
        
        if (coinBalance < parseInt(coinCost)) {
            tg.showPopup({
                title: 'Yetersiz Bakiye',
                message: `Bu paket için ${coinCost} coin gerekiyor.\nMevcut bakiyen: ${coinBalance} coin`,
                buttons: [{type: 'ok'}]
            });
            return;
        }
        
        const text = `PUBG Mobile UC almak istiyorum. ID: ${userId}. Paket: ${ucAmount} UC. Maliyet: ${coinCost} coin`;
        window.open(`https://t.me/turancoinsdestek?text=${encodeURIComponent(text)}`, '_blank');
    });
});

const taskLinks = {
    'telegram': 'https://t.me/turancoinkanal',
    'instagram': 'https://instagram.com/turancoin'
};

document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const taskId = btn.dataset.task;
        const taskCard = btn.closest('.task-card');
        const link = taskLinks[taskId];
        
        window.open(link, '_blank');
        
        btn.textContent = 'Bekle...';
        btn.disabled = true;
        
        setTimeout(async () => {
            try {
                const reward = taskId === 'telegram' ? 20 : 15;
                const response = await fetch(API_URL + '/api/add_coins', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ user_id: userId, coins: reward })
                });
                const data = await response.json();
                
                if (data.success) {
                    coinBalance = data.new_balance;
                    totalEarned = data.total_earned;
                    updateBalance(true);
                    showToast(`+${reward} Coin Eklendi!`);
                    
                    taskCard.classList.add('completed');
                    btn.textContent = 'Tamamlandı ✓';
                }
            } catch (e) {
                btn.textContent = 'Git';
                btn.disabled = false;
                tg.showPopup({
                    title: 'Hata',
                    message: 'Görev tamamlanamadı. Lütfen tekrar deneyin.',
                    buttons: [{type: 'ok'}]
                });
            }
        }, 10000);
    });
});

const fakeNames = ['Mehmet', 'Aziz', 'Gülnara', 'Timur', 'Ayşe', 'Rustam', 'Dilnoza', 'Batu', 'Zeynep', 'Marat'];
const fakeAds = [850, 720, 650, 580, 490, 420, 380, 310, 250, 180];

function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item' + (i === 0 ? ' top1' : '');
        item.innerHTML = `
            <div class="leaderboard-rank">${i + 1}</div>
            <div class="leaderboard-avatar">${fakeNames[i].charAt(0)}</div>
            <div class="leaderboard-name">${fakeNames[i]}</div>
            <div class="leaderboard-ads">${fakeAds[i]} reklam</div>
        `;
        list.appendChild(item);
    }
    
    document.getElementById('myRank').textContent = '#' + (Math.floor(Math.random() * 20) + 11);
}

function updateCountdown() {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalDays = Math.ceil((endOfMonth - startOfMonth) / (1000 * 60 * 60 * 24));
    const passedDays = Math.floor((now - startOfMonth) / (1000 * 60 * 60 * 24));
    const percent = (passedDays / totalDays) * 100;
    
    document.getElementById('monthProgressFill').style.width = percent + '%';
    
    const diff = endOfMonth - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdownTimer').textContent = `${days}g ${hours}s ${minutes}d ${seconds}sn`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ============ MINER SİSTEMİ ============
let minerActive = false;
let minerPlan = 'temel';
let minerStartTime = null;
let minerEndTime = null;
let minerTotalCoins = 0;
let minerTimerInterval = null;

const minerPlans = {
    'temel': { name: 'Temel', rate: 1, durationText: '3 saat' },
    'pro': { name: 'Pro', rate: 3, durationText: '24 saat' },
    'apex': { name: 'Apex', rate: 10, durationText: '30 gün' }
};

const minerCoinRate = 8 / (3 * 60 * 60);

function updateMinerUI() {
    const statusBadge = document.getElementById('minerStatusBadge');
    const startBtn = document.getElementById('minerStartBtn');
    const timerEl = document.getElementById('minerTimer');
    const coinAmountEl = document.getElementById('minerCoinAmount');
    const progressFill = document.getElementById('minerProgressFill');
    const planName = document.getElementById('currentMinerPlan');
    const planRate = document.getElementById('currentMinerRate');
    const planDuration = document.getElementById('currentMinerDuration');
    const btnDesc = document.getElementById('minerBtnDesc');
    
    const plan = minerPlans[minerPlan];
    planName.textContent = plan.name;
    planRate.textContent = plan.rate + 'x';
    planDuration.textContent = plan.durationText;
    
    if (minerActive) {
        statusBadge.textContent = 'Aktif';
        statusBadge.classList.add('active');
        startBtn.textContent = '⚒️ Kazıyor...';
        startBtn.classList.remove('stopped');
        startBtn.classList.add('running');
        btnDesc.textContent = 'Madencilik sürüyor...';
        
        const now = Date.now() / 1000;
        const remaining = minerEndTime - now;
        const total = minerEndTime - minerStartTime;
        const passed = total - remaining;
        const percent = (passed / total) * 100;
        
        progressFill.style.width = percent + '%';
        
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = Math.floor(remaining % 60);
        timerEl.textContent = `Kalan: ${String(h).padStart(2,'0')}s ${String(m).padStart(2,'0')}d ${String(s).padStart(2,'0')}sn`;
        
        const sessionEarned = passed * minerCoinRate * plan.rate;
        const totalDisplay = minerTotalCoins + sessionEarned;
        coinAmountEl.textContent = totalDisplay.toFixed(5);
        
        if (remaining <= 0) {
            stopMinerFromAPI();
        }
    } else {
        statusBadge.textContent = 'Pasif';
        statusBadge.classList.remove('active');
        startBtn.textContent = '▶ Başlat';
        startBtn.classList.remove('running');
        startBtn.classList.add('stopped');
        btnDesc.textContent = 'Başlatmak için tıkla';
        timerEl.textContent = 'Beklemede...';
        progressFill.style.width = '0%';
        coinAmountEl.textContent = minerTotalCoins.toFixed(5);
    }
}

async function loadMinerStatus() {
    try {
        const response = await fetch(API_URL + '/api/miner_status', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId })
        });
        const data = await response.json();
        
        if (data.success) {
            minerPlan = data.plan || 'temel';
            minerTotalCoins = data.total_coins || 0;
            
            if (data.is_active) {
                minerActive = true;
                minerStartTime = data.start_time;
                minerEndTime = data.end_time;
                
                if (minerTimerInterval) clearInterval(minerTimerInterval);
                minerTimerInterval = setInterval(updateMinerUI, 1000);
            } else {
                minerActive = false;
            }
            
            updateMinerUI();
        }
    } catch (e) {
        console.log('Miner durum yüklenemedi');
    }
}

async function startMinerAPI() {
    try {
        const response = await fetch(API_URL + '/api/miner_start', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId, plan: minerPlan })
        });
        const data = await response.json();
        
        if (data.success) {
            minerActive = true;
            minerStartTime = Date.now() / 1000;
            minerEndTime = data.end_time;
            
            if (minerTimerInterval) clearInterval(minerTimerInterval);
            minerTimerInterval = setInterval(updateMinerUI, 1000);
            
            updateMinerUI();
            showToast('⚡ Madencilik Başladı!');
            tg.HapticFeedback.notificationOccurred('success');
        }
    } catch (e) {
        showToast('Başlatma hatası');
    }
}

async function stopMinerFromAPI() {
    try {
        const response = await fetch(API_URL + '/api/miner_stop', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId })
        });
        const data = await response.json();
        
        if (data.success) {
            minerTotalCoins = data.total_coins || minerTotalCoins;
            loadUserData();
        }
    } catch (e) {
        console.log('Miner durdurma hatası');
    }
    
    minerActive = false;
    if (minerTimerInterval) {
        clearInterval(minerTimerInterval);
        minerTimerInterval = null;
    }
    updateMinerUI();
    showToast('⏹️ Madencilik Durduruldu');
}

document.getElementById('minerBtn').addEventListener('click', () => {
    showMinerPage();
});

document.getElementById('minerHomeBtn').addEventListener('click', () => {
    showPage('page-home');
});

document.getElementById('minerStartBtn').addEventListener('click', () => {
    if (minerActive) {
        return;
    } else {
        startMinerAPI();
    }
});

document.getElementById('minerUpgradeBtn').addEventListener('click', () => {
    const packages = document.getElementById('upgradePackages');
    if (packages.style.display === 'none') {
        packages.style.display = 'block';
        packages.style.animation = 'pageIn 0.3s ease';
    } else {
        packages.style.display = 'none';
    }
});

document.querySelectorAll('.miner-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const packageType = btn.dataset.package;
        const text = packageType === 'pro' 
            ? `Pro Madenci satın almak istiyorum. ID: ${userId}. Paket: Pro (100 TL/ay)`
            : `Apex Madenci satın almak istiyorum. ID: ${userId}. Paket: Apex (300 TL/ay)`;
        window.open(`https://t.me/turancoinsdestek?text=${encodeURIComponent(text)}`, '_blank');
    });
});

// ============ BAŞLANGIÇ ============
const hour = new Date().getHours();
let greetingText = 'Günaydın';
if (hour >= 12 && hour < 18) greetingText = 'İyi günler';
if (hour >= 18) greetingText = 'İyi akşamlar';
greetingEl.textContent = greetingText;
usernameEl.textContent = firstName + (lastName ? ' ' + lastName : '');

generateRandomWithdrawals();
loadUserData();
loadMinerStatus();
tg.ready();
