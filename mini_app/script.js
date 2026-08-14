const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user || {};
const firstName = user.first_name || 'Kullanıcı';
const lastName = user.last_name || '';
const userId = user.id || 0;

const API_URL = 'https://turancoin-bot.onrender.com';

// Elementler
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

let coinBalance = 0;
let adsWatched = 0;
let isPremium = false;
let totalEarned = 0;
let currentLigRate = 0.03;
const DAILY_LIMIT = 50;

// Lig sistemi
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

// Zamanlayıcı
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

// Sayı animasyonu
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

// Bakiye güncelle
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

// Kullanıcı verisi
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

// Coin yağmuru
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

// Reklam izleme
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

// Alt navigasyon
const navItems = document.querySelectorAll('.nav-item');
const pages = {
    'page-home': document.getElementById('page-home'),
    'page-tasks': document.getElementById('page-tasks'),
    'page-referral': document.getElementById('page-referral'),
    'page-wallet': document.getElementById('page-wallet')
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageId = item.dataset.page;
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        Object.keys(pages).forEach(key => {
            pages[key].classList.remove('active');
        });
        pages[pageId].classList.add('active');
        
        tg.HapticFeedback.impactOccurred('light');
    });
});

// Referans linki
referralLink.textContent = `https://t.me/turancoinsbot?start=${userId}`;

document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(referralLink.textContent);
    showToast('Link kopyalandı!');
});

// Butonlar
document.getElementById('refBtn').addEventListener('click', () => {
    navItems.forEach(nav => nav.classList.remove('active'));
    navItems[2].classList.add('active');
    Object.keys(pages).forEach(key => pages[key].classList.remove('active'));
    pages['page-referral'].classList.add('active');
});

document.getElementById('premiumBtn').addEventListener('click', () => {
    window.open('https://t.me/turancoinsdestek', '_blank');
});

// Cüzdan seçenekleri
document.getElementById('withdrawOption').addEventListener('click', () => {
    tg.showPopup({
        title: 'TL Çekim',
        message: `Mevcut bakiye: ${(coinBalance * currentLigRate).toFixed(2)} TL\nMin: 50 TL\n\n📩 @turancoinsdestek`,
        buttons: [{type: 'ok'}]
    });
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
    tg.showPopup({
        title: 'İstanbulkart Yükleme',
        message: `Mevcut bakiye: ${(coinBalance * currentLigRate).toFixed(2)} TL\nYüklenecek: 50 TL\n\n📩 @turancoinsdestek`,
        buttons: [{type: 'ok'}]
    });
});

document.getElementById('ucOption').addEventListener('click', () => {
    tg.showPopup({
        title: 'PUBG Mobile UC',
        message: 'Yakında aktif olacak!\n\nCoin\'lerinizi UC\'ye çevirebileceksiniz.',
        buttons: [{type: 'ok'}]
    });
});

// Başlangıç
const hour = new Date().getHours();
let greetingText = 'Günaydın';
if (hour >= 12 && hour < 18) greetingText = 'İyi günler';
if (hour >= 18) greetingText = 'İyi akşamlar';
greetingEl.textContent = greetingText;
usernameEl.textContent = firstName + (lastName ? ' ' + lastName : '');

generateRandomWithdrawals();
loadUserData();
tg.ready();
