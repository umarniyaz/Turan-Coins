// Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.expand();

// Kullanıcı bilgileri
const user = tg.initDataUnsafe?.user || {};
document.getElementById('username').textContent = user.first_name || 'Kullanıcı';

// Değişkenler
let coinBalance = 0;
let adsWatched = 0;
let isPremium = false;
let premiumEarned = 0;
const DAILY_LIMIT = 50;
const PREMIUM_MAX = 30;

// Elementler
const watchAdBtn = document.getElementById('watchAdBtn');
const coinBalanceEl = document.getElementById('coinBalance');
const tlBalanceEl = document.getElementById('tlBalance');
const adsWatchedEl = document.getElementById('adsWatched');
const premiumBadge = document.getElementById('premiumBadge');
const premiumCard = document.getElementById('premiumCard');
const premiumProgress = document.getElementById('premiumProgress');
const premiumEarnedEl = document.getElementById('premiumEarned');
const premiumUnlimited = document.getElementById('premiumUnlimited');
const coinRain = document.getElementById('coinRain');

// Bakiyeyi güncelle
function updateBalance() {
    coinBalanceEl.textContent = coinBalance;
    const tlValue = isPremium ? (coinBalance * 0.5) : (coinBalance * 0.1);
    tlBalanceEl.textContent = tlValue.toFixed(2) + ' TL';
    adsWatchedEl.textContent = adsWatched;
    
    if (isPremium) {
        premiumBadge.style.display = 'inline';
        premiumCard.style.display = 'block';
        premiumUnlimited.style.display = 'inline';
        const progressPercent = (premiumEarned / PREMIUM_MAX) * 100;
        premiumProgress.style.width = progressPercent + '%';
        premiumEarnedEl.textContent = premiumEarned.toFixed(2);
        document.querySelector('.ad-info span:first-child').style.display = 'none';
    } else {
        premiumBadge.style.display = 'none';
        premiumCard.style.display = 'none';
        premiumUnlimited.style.display = 'none';
        document.querySelector('.ad-info span:first-child').style.display = 'inline';
    }
    
    if (!isPremium && adsWatched >= DAILY_LIMIT) {
        watchAdBtn.classList.add('disabled');
        watchAdBtn.querySelector('span:nth-child(2)').textContent = 'Limit Doldu';
    }
}

// Coin yağmuru efekti
function spawnCoinRain() {
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin-fall';
            coin.textContent = '🪙';
            coin.style.left = Math.random() * 100 + '%';
            coin.style.animationDelay = Math.random() * 0.5 + 's';
            coinRain.appendChild(coin);
            
            setTimeout(() => coin.remove(), 2000);
        }, i * 100);
    }
}

// Buton titreşim efekti
function vibrateButton() {
    watchAdBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        watchAdBtn.style.transform = 'scale(1)';
    }, 100);
}

// Reklam izleme simülasyonu
watchAdBtn.addEventListener('click', () => {
    if (watchAdBtn.classList.contains('disabled')) return;
    
    vibrateButton();
    
    // Reklam izleme simülasyonu (gerçekte Adsgram burada devreye girecek)
    watchAdBtn.querySelector('span:nth-child(2)').textContent = 'Reklam İzleniyor...';
    watchAdBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        coinBalance += 1;
        adsWatched += 1;
        
        if (isPremium) {
            premiumEarned += 0.5;
            if (premiumEarned >= PREMIUM_MAX) {
                isPremium = false;
                premiumEarned = 0;
                tg.showPopup({
                    title: 'Premium Bitti',
                    message: '30 TL kazanç limitine ulaştınız. Premium üyeliğiniz sona erdi.',
                    buttons: [{type: 'ok'}]
                });
            }
        }
        
        spawnCoinRain();
        updateBalance();
        
        watchAdBtn.querySelector('span:nth-child(2)').textContent = 'Reklam İzle';
        watchAdBtn.style.pointerEvents = 'auto';
        
        tg.HapticFeedback.notificationOccurred('success');
    }, 3000); // 3 saniye reklam süresi
});

// Menü butonları
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const text = item.querySelector('span:last-child').textContent;
        tg.HapticFeedback.impactOccurred('light');
        tg.showPopup({
            title: text,
            message: 'Bu özellik yakında eklenecek.',
            buttons: [{type: 'ok'}]
        });
    });
});

// Premium test butonu (geliştirme için)
tg.MainButton.setText('👑 Premium Test');
tg.MainButton.show();
tg.MainButton.onClick(() => {
    isPremium = true;
    premiumEarned = 0;
    watchAdBtn.classList.remove('disabled');
    updateBalance();
    tg.HapticFeedback.notificationOccurred('success');
    tg.showPopup({
        title: 'Premium Aktif!',
        message: 'Premium üyeliğiniz başladı. Coin değeriniz 0.5 TL!',
        buttons: [{type: 'ok'}]
    });
});

// Başlangıç
updateBalance();
tg.ready();
