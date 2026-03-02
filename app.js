// Category navigation
function showCategory(id, btn) {
    document.querySelectorAll('.category-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('nav button').forEach(button => {
        button.classList.remove('active');
    });
    btn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter flowers
function filterFlowers() {
    console.log('Filtering flowers...');
}

// PWA Install prompt
let deferredPrompt;
let installButton;

function createInstallButton() {
    if (installButton) return; // Already created
    
    installButton = document.createElement('button');
    installButton.id = 'install-app-button';
    installButton.textContent = '📱 Install App';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d4a5d4 0%, #c994c7 100%);
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        box-shadow: 0 8px 20px rgba(212, 165, 212, 0.5);
        z-index: 9999;
        display: block;
        transition: all 0.3s;
        font-family: inherit;
    `;

    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'translateY(-5px)';
        installButton.style.boxShadow = '0 12px 30px rgba(212, 165, 212, 0.6)';
    });

    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'translateY(0)';
        installButton.style.boxShadow = '0 8px 20px rgba(212, 165, 212, 0.5)';
    });

    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('ℹ️ Install prompt not available');
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`✅ User response: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
    });

    document.body.appendChild(installButton);
    console.log('✅ Install button created and visible');
}

// Ensure button is created when DOM is ready
if (document.body) {
    createInstallButton();
} else {
    document.addEventListener('DOMContentLoaded', createInstallButton);
}

// Capture install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎉 beforeinstallprompt event fired!');
    e.preventDefault();
    deferredPrompt = e;
    if (!installButton) createInstallButton();
    installButton.style.display = 'block';
});

// Listen for app install
window.addEventListener('appinstalled', () => {
    console.log('✅ App installed successfully!');
});

// Check if installable
window.addEventListener('load', () => {
    console.log('📋 Checking PWA installability...');
    if ('serviceWorker' in navigator) {
        console.log('✓ Service Worker supported');
    }
    if (navigator.onLine) {
        console.log('✓ Online');
    }
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully!');
    installButton.style.display = 'none';
    showNotification('App installed! 🎉', 'You can now use Petal Couture offline.');
});

// Service Worker Registration with Auto-Update Check
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showNotification('🔄 Update Available', 'A new version is available. Refresh to update.');
                    }
                });
            });
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
}

// Online/Offline status
window.addEventListener('online', () => {
    showNotification('Back Online! 🌐', 'Your connection has been restored.');
});

window.addEventListener('offline', () => {
    showNotification('Offline Mode 📵', 'You are currently offline. Some features may be limited.');
});

// Notification helper
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <h3 style="color: #9c6b9c; margin-bottom: 0.5rem; font-size: 1.1rem;">${title}</h3>
        <p style="color: #666; font-size: 0.9rem; margin: 0;">${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Request notification permission with user context
if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
        Notification.requestPermission().then(permission => {
            console.log('📬 Notification permission:', permission);
        });
    }, 8000);
}

// Performance monitoring for PWA
window.addEventListener('load', () => {
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`⚡ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
                }
            });
            observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
        } catch (e) {
            console.log('Performance monitoring not available');
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {

    const cartButtons = document.querySelectorAll('.add-to-cart');

    cartButtons.forEach(button => {
        button.addEventListener('click', function (e) {

            // Prevent card click effect if any
            e.stopPropagation();

            // Get product name
            const productName = this.closest('.flower-card')
                                   .querySelector('h3')
                                   .innerText;

            // Use your existing notification system
            showNotification(
                '🛒 Added to Cart',
                `${productName} has been added successfully!`
            );
        });
    });

});
