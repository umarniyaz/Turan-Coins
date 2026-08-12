const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user || {};
document.getElementById('userAvatar').textContent = (user.first_name || 'K').charAt(0).toUpperCase();

let coinBalance = 0;
let adsWatched = 0;
let isPremium = false;
const DAILY_LIMIT = 50;

const watchAdBtn = document.getElementById('watchAdBtn');
const coinBalanceEl = document.getElementById('coinBalance');
const tlBalanceEl = document.getElementById('tlBalance');
const adsWatchedEl = document.getElementById('adsWatched');
const premiumBadge = document.getElementById('premiumBadge');
const premiumCard = document.getElementById('premiumCard');
const coinRain = document.getElementById('coinRain');

function updateBalance() {
    coinBalanceEl.textContent = coinBalance;
    const tlValue = isPremium ? (coinBalance * 0.5) : (coinBalance * 0.1);
    tlBalanceEl.textContent = tlValue.toFixed(2) + ' TL';
    adsWatchedEl.textContent = adsWatched;
    
    if (isPremium) {
        premiumBadge.style.display = 'inline';
        premiumCard.style.display = 'block';
    }
    
    if (!isPremium && adsWatched >= DAILY_LIMIT) {
        watchAdBtn.classList.add('disabled');
        watchAdBtn.textContent = 'Limit Doldu';
    }
}

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

watchAdBtn.addEventListener('click', () => {
    if (watchAdBtn.classList.contains('disabled')) return;
    
    watchAdBtn.textContent = 'Reklam İzleniyor...';
    watchAdBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        coinBalance += 1;
        adsWatched += 1;
        
        spawnCoinRain();
        updateBalance();
        
        watchAdBtn.textContent = 'Reklam İzle';
        watchAdBtn.style.pointerEvents = 'auto';
        
        tg.HapticFeedback.notificationOccurred('success');
    }, 3000);
});

document.getElementById('premiumBtn').addEventListener('click', () => {
    tg.showPopup({
        title: 'Premium',
        message: 'Premium satın almak için: @TuranCoinDestek',
        buttons: [{type: 'ok'}]
    });
});

updateBalance();
tg.ready();
