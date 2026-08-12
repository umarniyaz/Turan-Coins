const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user || {};
const firstName = user.first_name || 'Kullanıcı';

// Elementler
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

// Değişkenler
let coinBalance = 0;
let adsWatched = 0;
let isPremium = false;
const DAILY_LIMIT = 50;
const DAILY_TARGET_TL = 5;

// Selamlama
const hour = new Date().getHours();
let greeting = 'Günaydın';
if (hour >= 12 && hour < 18) greeting = 'İyi günler';
if (hour >= 18) greeting = 'İyi akşamlar';
greetingEl.textContent = greeting;
usernameEl.textContent = firstName;

// Zamanlayıcı - gece yarısına kalan süre
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

// Bakiyeyi güncelle
function updateBalance() {
    coinBalanceEl.textContent = coinBalance;
    const tlValue = isPremium ? (coinBalance * 0.5) : (coinBalance * 0.1);
    tlBalanceEl.textContent = tlValue.toFixed(2);
    
    // İlerleme barı
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

// Coin yağmuru
function spawnCoinRain() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin-fall';
            coin.textContent = '🪙';
            coin.style.left = Math.random() * 100 + '%';
            coin.style.animationDelay = Math.random() * 0.5 + 's';
            coinRain.appendChild(coin);
            setTimeout(() => coin.remove(), 2000);
        }, i * 80);
    }
}

// Reklam izleme
watchAdBtn.addEventListener('click', () => {
    if (watchAdBtn.classList.contains('disabled')) return;
    
    watchAdBtn.innerHTML = '<span>⏳ Reklam İzleniyor...</span>';
    watchAdBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        coinBalance += 1;
        adsWatched += 1;
        
        spawnCoinRain();
        updateBalance();
        
        watchAdBtn.innerHTML = '<span class="btn-icon">▶</span><span>Reklam İzle & Kazan</span>';
        watchAdBtn.style.pointerEvents = 'auto';
        
        const earned = isPremium ? '0.5' : '0.1';
        tg.HapticFeedback.notificationOccurred('success');
    }, 3000);
});

// Referans butonu
document.getElementById('refBtn').addEventListener('click', () => {
    tg.showPopup({
        title: 'Arkadaş Davet Et',
        message: 'Her davet için 100 coin kazan!\n\nLinkini paylaş, kazanmaya başla.',
        buttons: [{type: 'ok'}]
    });
});

// Çekim butonu
document.getElementById('withdrawBtn').addEventListener('click', () => {
    const tlValue = isPremium ? (coinBalance * 0.5) : (coinBalance * 0.1);
    if (tlValue < 50) {
        tg.showPopup({
            title: 'Yetersiz Bakiye',
            message: 'Minimum çekim tutarı 50 TL. Daha fazla reklam izleyin.',
            buttons: [{type: 'ok'}]
        });
    } else {
        tg.showPopup({
            title: 'Para Çek',
            message: 'Çekim talebi için bot üzerinden IBAN\'ınızı gönderin.',
            buttons: [{type: 'ok'}]
        });
    }
});

// Premium test
tg.MainButton.setText('👑 Premium Test');
tg.MainButton.show();
tg.MainButton.onClick(() => {
    isPremium = true;
    updateBalance();
    tg.HapticFeedback.notificationOccurred('success');
    tg.showPopup({
        title: 'Premium Aktif!',
        message: 'Coin değeriniz 0.5 TL oldu!',
        buttons: [{type: 'ok'}]
    });
});

updateBalance();
tg.ready();
