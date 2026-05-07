// Функция для получения CSRF-токена из куки
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('orderModal');
    const modalOrderId = document.getElementById('modalOrderId');
    const modalOrderUser = document.getElementById('modalOrderUser');
    const modalOrderStatus = document.getElementById('modalOrderStatus');
    const modalOrderTotal = document.getElementById('modalOrderTotal');
    const modalOrderCreated = document.getElementById('modalOrderCreated');
    const modalOrderProduct = document.getElementById('modalOrderProduct');
    
    // Находим элементы формы
    const statusSelect = modal ? modal.querySelector('.form-select') : null;
    const saveButton = modal ? modal.querySelector('.btn-primary') : null;
    const cancelButton = modal ? modal.querySelector('.btn-ghost') : null;
    
    let currentOrderId = null;
    let currentOrderRow = null;

    if (!modal) return;

    const statusValueByDisplay = {
        'Новый': 'new',
        'В обработке': 'processing',
        'Доставлен': 'delivered',
        'Отменён': 'cancelled',
        'Отменен': 'cancelled',
        'new': 'new',
        'processing': 'processing',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
    };

    const statusDisplayByValue = {
        new: 'Новый',
        processing: 'В обработке',
        delivered: 'Доставлен',
        cancelled: 'Отменён',
    };

    // Функция закрытия модалки
    function closeModal() {
        modal.classList.remove('show');
        currentOrderId = null;
        currentOrderRow = null;
    }

    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по кнопке "Отмена" (без onclick в HTML!)
    if (cancelButton) {
        cancelButton.addEventListener('click', closeModal);
    }

    // Открытие модалки при клике на строку таблицы
    const ordersTableBody = document.querySelector('.latest-orders__table tbody');
    if (!ordersTableBody) return;

    ordersTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('.order-row');
        if (!row) return;

        const orderId = row.dataset.orderId;
        if (!orderId) return;
        
        currentOrderId = orderId;
        currentOrderRow = row;

        try {
            const response = await fetch(`/orders/${orderId}/json/`);
            
            if (!response.ok) {
                throw new Error('Не удалось загрузить данные заказа');
            }
            
            const data = await response.json();

            // Заполняем данные в модалке
            modalOrderId.textContent = data.id;
            modalOrderUser.textContent = data.user;
            modalOrderStatus.textContent = data.status;
            modalOrderTotal.textContent = data.total;
            modalOrderCreated.textContent = data.created_at;
            modalOrderProduct.textContent = data.product || '—';
            
            // Устанавливаем текущий статус в селекте
            if (statusSelect) {
                statusSelect.value = statusValueByDisplay[data.status] || data.status;
            }

            modal.classList.add('show');
        } catch (error) {
            console.error('Ошибка загрузки заказа:', error);
            alert('Не удалось загрузить информацию о заказе');
        }
    });

    // Сохранение изменений
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            if (!currentOrderId) return;
            
            const newStatus = statusSelect.value;
            
            // Показываем что идет сохранение
            saveButton.disabled = true;
            saveButton.textContent = 'Сохранение...';
            
            try {
                // ✅ ДОБАВЛЯЕМ CSRF-ТОКЕН
                const response = await fetch(`/orders/${currentOrderId}/update-status/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'), // ← ВОТ ОНО!
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (!response.ok) {
                    throw new Error('Ошибка сохранения');
                }
                
                const result = await response.json();

                // Обновляем статус в модалке
                if (result.status) {
                    modalOrderStatus.textContent = result.status;
                }

                // ✅ ОБНОВЛЯЕМ СТАТУС В ТАБЛИЦЕ (исправленная версия)
                if (currentOrderRow) {
                    const statusBadge = currentOrderRow.querySelector('.status-badge');
                    if (statusBadge) {
                        // 1. Получаем отображаемое имя статуса
                        const statusDisplay = result.status || statusDisplayByValue[newStatus] || newStatus;
                        
                        // 2. Убираем ВСЕ старые классы статусов
                        statusBadge.className = statusBadge.className
                            .split(' ')
                            .filter(cls => !cls.startsWith('status-'))
                            .join(' ');
                        
                        // 3. Добавляем новый класс статуса
                        statusBadge.classList.add(`status-${newStatus}`);
                        
                        // 4. Обновляем текст, сохраняя цветную точку
                        statusBadge.innerHTML = `<span class="status-dot"></span>${statusDisplay}`;
                        
                        // 5. ОБНОВЛЯЕМ data-атрибут строки для изменения цвета
                        currentOrderRow.setAttribute('data-status', newStatus);
                    }
                }
                
                showToast(
                    'success', 
                    'Заказ обновлён', 
                    `#ORD-${currentOrderId} успешно сохранён`
                );
                
                closeModal();
            } catch (error) {
                console.error('Ошибка сохранения:', error);
                alert('Не удалось сохранить изменения');
            } finally {
                saveButton.disabled = false;
                saveButton.textContent = 'Сохранить';
            }
        });
    }
});

// Функция для показа уведомлений (глобальная, доступна везде)
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#059669' : type === 'info' ? '#2563eb' : type === 'warning' ? '#d97706' : '#dc2626'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
        <div style="font-size: 13px; opacity: 0.9;">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);