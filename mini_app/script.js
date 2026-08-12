const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user || {};
const firstName = user.first_name || 'Kullanıcı';
const userId = user.id || 0;

const API_URL = 'https://turancoin-bot.onrender.com';

const greetingEl = document.getElementById('greeting');
const usernameEl = document.getElementById('username');
const coinBalanceEl = document.getElementById('coinBalance');
const tlBalanceEl = document.getElementById('tlBalance');
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

let coinBalance = 0;
let adsWatched = 0;
let isPremium = false;
const DAILY_LIMIT = 50;
const DAILY_TARGET_TL = 5;

const hour = new Date().getHours();
let greeting = 'Günaydın';
if (hour >= 12 && hour < 18) greeting = 'İyi günler';
if (hour >= 18) greeting = 'İyi akşamlar';
greetingEl.textContent = greeting;
usernameEl.textContent = firstName;

// Rastgele çekimler
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
    
    const count = 3 + Math.floor(Math.random() * 2); // 3-4 kayıt
    
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
        
        setTimeout(() => {
            el.classList.remove('number-animate-in');
        }, 300);
    }, 150);
}

function updateBalance(animate = false) {
    if (animate) {
        animateNumber(coinBalanceEl, coinBalance);
    } else {
        coinBalanceEl.textContent = coinBalance;
    }
    
    const tlValue = isPremium ? (coinBalance * 0.5) : (coinBalance * 0.1);
    tlBalanceEl.textContent = tlValue.toFixed(2);
    
    const earnedToday = isPremium ? (adsWatched * 0.5) : (adsWatched * 0.1);
    const percent = Math.min((earnedToday / DAILY_TARGET_TL) * 100, 100);
    progressFill.style.width = percent + '%';
    progressEarned.textContent = earnedToday.toFixed(2) + ' TL';
    progressTarget.textContent = DAILY_TARGET_TL + ' TL';
    adsWatchedEl.textContent = adsWatched;
    
    if (isPremium) {
        premiumCard.style.display = 'block';
        premiumIcon.style.display = 'inline';
    }
    
    if (!isPremium && adsWatched >= DAILY_LIMIT) {
        watchAdBtn.classList.add('disabled');
        watchAdBtn.innerHTML = '<span>Günlük Limit Doldu</span>';
    }
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
    setTimeout(() => {
        balanceCard.classList.remove('shimmer');
    }, 1000);
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
                    body: JSON.stringify({
                        user_id: userId,
                        coins: 1
                    })
                });
                const data = await response.json();
                if (data.success) {
                    coinBalance = data.new_balance;
                    adsWatched += 1;
                    spawnCoinRain();
                    shimmerBalanceCard();
                    updateBalance(true);
                    tg.HapticFeedback.notificationOccurred('success');
                }
            } catch (e) {
                tg.showPopup({
                    title: 'Hata',
                    message: 'Coin eklenemedi.',
                    buttons: [{type: 'ok'}]
                });
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

document.getElementById('refBtn').addEventListener('click', () => {
    tg.showPopup({
        title: 'Arkadaş Davet Et',
        message: 'Her davet ettiğin arkadaşın için 100 coin kazan!\n\nReferans linkini bot üzerinden alabilirsin.',
        buttons: [{type: 'ok'}]
    });
});

document.getElementById('premiumBtn').addEventListener('click', () => {
    tg.showPopup({
        title: 'Premium',
        message: 'Reklam başına 0.5 TL kazan\nSınırsız reklam izleme\nİstanbulkart yükleme\n\nFiyat: 100 TL\n📩 @turancoinsdestek',
        buttons: [{type: 'ok'}]
    });
});

// Başlangıç
generateRandomWithdrawals();
loadUserData();
tg.ready();
