document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle signature button click
    const signButton = document.querySelector('.sign-button');
    if (signButton) {
        signButton.addEventListener('click', function() {
            // Add loading state
            this.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                this.classList.remove('loading');
                // Show success message
                showNotification('Спасибо за подпись!');
            }, 1500);
        });
    }

    // Handle share buttons
    const shareButtons = document.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.textContent.trim();
            shareContent(platform);
        });
    });

    // Mobile navigation handling
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.querySelector('span').textContent;
            handleMobileNavAction(action);
        });
    });

    // Add touch feedback to buttons
    const touchElements = document.querySelectorAll('button, a, .share-button, .sign-button');
    touchElements.forEach(element => {
        element.classList.add('touch-feedback');
    });

    // Handle scroll events for header
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
});

// Helper Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function shareContent(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl;
    
    switch(platform) {
        case 'Facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'Twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'WhatsApp':
            shareUrl = `https://wa.me/?text=${title}%20${url}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function handleMobileNavAction(action) {
    switch(action) {
        case 'Главная':
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
        case 'Поиск':
            // Implement search functionality
            break;
        case 'Уведомления':
            showNotification('Уведомления пока недоступны');
            break;
        case 'Профиль':
            showNotification('Профиль пока недоступен');
            break;
    }
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: transform 0.3s ease-out;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateX(-50%) translateY(0);
    }
`;
document.head.appendChild(style);

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8063508789:AAEnmAAIvyDjGjKziRRoWF48bRZFgcKQb3M';
const TELEGRAM_CHAT_ID = '-1002619073507';

// Function to get visitor IP
async function getVisitorIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return 'Не удалось определить IP';
    }
}

// Function to generate unique user ID
function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `USER_${timestamp}_${randomStr}`;
}

// Function to get or create user ID
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = generateUserId();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Function to get visitor information
async function getVisitorInfo() {
    const userAgent = navigator.userAgent;
    const device = /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop';
    const browser = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)[1];
    const ip = await getVisitorIP();
    const userId = getUserId();

    return {
        device,
        browser,
        ip,
        userId,
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
}

// Function to send notification to Telegram
async function sendTelegramNotification(visitorInfo) {
    try {
        const message = `
�� Новый посетитель!
👤 ID: ${visitorInfo.userId}
🌐 Страница: ${window.location.href}
📱 Устройство: ${visitorInfo.device}
🌍 Браузер: ${visitorInfo.browser}
📡 IP: ${visitorInfo.ip}
⏰ Время: ${new Date().toLocaleString()}
        `;

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Send notification when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const visitorInfo = await getVisitorInfo();
    sendTelegramNotification(visitorInfo);
});

// Track page views
window.addEventListener('load', () => {
    // You can add additional tracking here
    console.log('Page fully loaded');
});

// Function to handle petition download
async function handlePetitionDownload() {
    try {
        const visitorInfo = await getVisitorInfo();
        const message = `
📥 Петиция установлена!
👤 ID: ${visitorInfo.userId}
🌐 Страница: ${window.location.href}
📱 Устройство: ${visitorInfo.device}
🌍 Браузер: ${visitorInfo.browser}
📡 IP: ${visitorInfo.ip}
⏰ Время: ${new Date().toLocaleString()}
        `;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        // Show success notification to user
        showNotification('Петиция успешно установлена!');
    } catch (error) {
        console.error('Error sending download notification:', error);
        showNotification('Произошла ошибка при установке');
    }
}

// Add download button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.download-button');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.getAttribute('data-bs-toggle')) { // Only for direct download buttons
                e.preventDefault();
                handlePetitionDownload();
            }
        });
    });
}); 