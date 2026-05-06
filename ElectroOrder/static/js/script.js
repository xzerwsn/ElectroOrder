document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    
    // Установить первую кнопку активной по умолчанию
    if (navButtons.length > 0) {
        navButtons[0].classList.add('active');
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем active у всех
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем active на текущую
            this.classList.add('active');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Элементы для мобильного меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navCloseBtn = document.getElementById('navCloseBtn');
    const navOverlay = document.getElementById('navOverlay');
    const mainNav = document.getElementById('mainNav');
    
    // Функция открытия мобильного меню
    function openMobileMenu() {
        if (mainNav) {
            mainNav.classList.add('mobile-open');
        }
        if (navOverlay) {
            navOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    }
    
    // Функция закрытия мобильного меню
    function closeMobileMenu() {
        if (mainNav) {
            mainNav.classList.remove('mobile-open');
        }
        if (navOverlay) {
            navOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    }
    
    // Обработчики событий
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }
    
    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Закрывать меню по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav && mainNav.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });
    
    // Закрывать меню при клике на пункт меню (для мобильных)
    const navLinks = document.querySelectorAll('.button-block a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Автоматически закрывать меню при изменении размера экрана
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && mainNav) {
                closeMobileMenu();
            }
        }, 250);
    });
    
    // Подсветка активного пункта меню (опционально)
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.button-block a');
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.closest('.nav-button').classList.add('active');
        }
    });
});