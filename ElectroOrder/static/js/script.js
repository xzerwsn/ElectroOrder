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