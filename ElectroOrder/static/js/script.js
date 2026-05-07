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

/* ============================================ */
/* DASHBOARD: реальные графики и действия       */
/* ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    initDashboardBarChart('week');
    initDashboardDonutChart();
    animateDashboardCharts();
    initDashboardActions();
    initDashboardRangeTabs();
    initCreateOrderModal();
});

function readJsonScript(id, fallback) {
    const el = document.getElementById(id);
    if (!el) return fallback;

    try {
        return JSON.parse(el.textContent || '');
    } catch (error) {
        console.warn(`Не удалось прочитать JSON из #${id}`, error);
        return fallback;
    }
}

function getOrdersChartData() {
    return readJsonScript('orders-chart-data', {
        week: [],
        month: [],
        year: [],
    });
}

function getStatusChartData() {
    return readJsonScript('status-chart-data', []);
}

function initDashboardBarChart(period) {
    const container = document.getElementById('barChart');
    if (!container) return;

    container.querySelectorAll('.chart-bar-wrap, .chart-empty').forEach((item) => item.remove());

    const chartData = getOrdersChartData();
    const data = chartData[period] || [];
    const maxCount = Math.max(...data.map((item) => Number(item.count || item.val || 0)), 0);

    if (!data.length || maxCount === 0) {
        const empty = document.createElement('div');
        empty.className = 'chart-empty';
        empty.textContent = 'За выбранный период заказов нет';
        container.appendChild(empty);
        return;
    }

    data.forEach((item, index) => {
        const count = Number(item.count || item.val || 0);
        const percent = Math.max(8, Math.round((count / maxCount) * 100));

        const wrap = document.createElement('div');
        wrap.className = 'chart-bar-wrap';

        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${percent}%`;
        bar.style.animationDelay = `${index * 80}ms`;
        bar.title = `${item.label}: ${count} заказов`;

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = item.label;

        const value = document.createElement('span');
        value.className = 'chart-value';
        value.textContent = count;

        wrap.appendChild(value);
        wrap.appendChild(bar);
        wrap.appendChild(label);
        container.appendChild(wrap);
    });
}

function initDashboardDonutChart() {
    const svg = document.getElementById('donutSvg');
    const legend = document.getElementById('donutLegend');
    if (!svg) return;

    svg.innerHTML = '';
    if (legend) legend.innerHTML = '';

    const data = getStatusChartData().filter((item) => Number(item.count || 0) > 0);
    const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

    if (!data.length || total === 0) {
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', '60');
        centerText.setAttribute('y', '60');
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('dominant-baseline', 'middle');
        centerText.classList.add('donut-center-sub');
        centerText.textContent = 'нет заказов';
        svg.appendChild(centerText);
        if (legend) legend.innerHTML = '<div class="donut-empty">Нет данных по статусам</div>';
        return;
    }

    const cx = 60;
    const cy = 60;
    const r = 40;
    const stroke = 14;
    const circumference = 2 * Math.PI * r;
    let offsetPercent = 0;

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    background.setAttribute('cx', cx);
    background.setAttribute('cy', cy);
    background.setAttribute('r', r);
    background.setAttribute('fill', 'none');
    background.setAttribute('stroke', 'var(--bg-overlay)');
    background.setAttribute('stroke-width', stroke);
    svg.appendChild(background);

    data.forEach((item, index) => {
        const count = Number(item.count || 0);
        const percent = count / total;
        const dashLength = percent * circumference;
        const startOffset = circumference - offsetPercent * circumference;
        const targetOffset = startOffset - dashLength;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', item.color || '#4da6ff');
        circle.setAttribute('stroke-width', stroke);
        circle.setAttribute('stroke-dasharray', `${dashLength} ${circumference - dashLength}`);
        circle.setAttribute('stroke-dashoffset', startOffset);
        circle.setAttribute('stroke-linecap', 'round');
        circle.style.transform = 'rotate(-90deg)';
        circle.style.transformOrigin = '60px 60px';
        circle.style.setProperty('--target-offset', targetOffset);
        circle.style.animationDelay = `${index * 150}ms`;
        circle.classList.add('donut-segment');
        svg.appendChild(circle);

        offsetPercent += percent;
    });

    const centerTotal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerTotal.setAttribute('x', cx);
    centerTotal.setAttribute('y', cy - 2);
    centerTotal.setAttribute('text-anchor', 'middle');
    centerTotal.setAttribute('dominant-baseline', 'middle');
    centerTotal.classList.add('donut-center-text');
    centerTotal.textContent = total.toLocaleString('ru-RU');
    svg.appendChild(centerTotal);

    const centerSub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerSub.setAttribute('x', cx);
    centerSub.setAttribute('y', cy + 12);
    centerSub.setAttribute('text-anchor', 'middle');
    centerSub.classList.add('donut-center-sub');
    centerSub.textContent = 'заказов';
    svg.appendChild(centerSub);

    if (legend) {
        legend.innerHTML = data.map((item) => {
            const count = Number(item.count || 0);
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return `
                <div class="legend-item">
                    <span class="legend-dot" style="background:${item.color || '#4da6ff'}"></span>
                    <span class="legend-label">${item.label}</span>
                    <span class="legend-val">${count} / ${percent}%</span>
                </div>
            `;
        }).join('');
    }
}

function animateDashboardCharts() {
    requestAnimationFrame(() => {
        document.querySelectorAll('.chart-bar').forEach((bar) => bar.classList.add('animated'));
        document.querySelectorAll('.donut-segment').forEach((segment) => segment.classList.add('animated'));
    });
}

function initDashboardRangeTabs() {
    document.querySelectorAll('[data-chart-period]').forEach((button) => {
        button.addEventListener('click', function () {
            document.querySelectorAll('[data-chart-period]').forEach((item) => item.classList.remove('active'));
            this.classList.add('active');
            initDashboardBarChart(this.dataset.chartPeriod);
            animateDashboardCharts();
        });
    });
}

function initDashboardActions() {
    const startAdsButton = document.querySelector('[data-dashboard-action="start-ads"]');
    const exportButton = document.querySelector('[data-dashboard-action="export-csv"]');

    if (startAdsButton) {
        startAdsButton.addEventListener('click', function () {
            if (typeof showToast === 'function') {
                showToast('info', 'Реклама', 'Раздел рекламных кампаний готов к подключению');
            }
        });
    }

    if (exportButton) {
        exportButton.addEventListener('click', exportOrdersTableToCsv);
    }
}

function exportOrdersTableToCsv() {
    const table = document.querySelector('.latest-orders__table');
    if (!table) return;

    const rows = [...table.querySelectorAll('tr')];
    const csvRows = rows.map((row) => {
        const cells = [...row.querySelectorAll('th, td')];
        return cells.map((cell) => {
            const value = cell.innerText.replace(/\s+/g, ' ').trim().replace(/"/g, '""');
            return `"${value}"`;
        }).join(';');
    });

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders_export.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
        showToast('success', 'Экспорт готов', 'CSV-файл с заказами скачан');
    }
}

function initCreateOrderModal() {
    const createButton = document.querySelector('[data-dashboard-action="create-order"]');
    const modal = document.getElementById('createOrderModal');
    const form = document.getElementById('createOrderForm');
    if (!createButton || !modal || !form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const productSelect = document.getElementById('createOrderProduct');
    const totalPreview = document.getElementById('createOrderTotalPreview');
    const createUrl = createButton.dataset.createOrderUrl || '/orders/create/json/';

    let isCreatingOrder = false;

    function formatRub(value) {
        const numberValue = Number(String(value || '0').replace(',', '.'));
        if (Number.isNaN(numberValue)) return '₽0';
        return `₽${numberValue.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;
    }

    function updateCreateOrderTotalPreview() {
        if (!productSelect || !totalPreview) return;
        const selectedOption = productSelect.selectedOptions[0];
        const price = selectedOption?.dataset.price || '0';
        totalPreview.textContent = formatRub(price);
    }

    function openCreateModal() {
        form.reset();
        updateCreateOrderTotalPreview();
        modal.classList.add('show');
    }

    function closeCreateModal() {
        modal.classList.remove('show');
    }

    if (productSelect) {
        productSelect.addEventListener('change', updateCreateOrderTotalPreview);
        updateCreateOrderTotalPreview();
    }

    createButton.addEventListener('click', openCreateModal);

    modal.querySelectorAll('[data-create-order-close]').forEach((button) => {
        button.addEventListener('click', closeCreateModal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeCreateModal();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isCreatingOrder) {
            return;
        }

        isCreatingOrder = true;

        const formData = new FormData(form);
        
        // Создаём payload из данных формы
        const payload = {
            user_id: formData.get('user_id'),
            product_id: formData.get('product_id'),
            quantity: formData.get('quantity'),
            status: formData.get('status'),
        };

        if (!payload.product_id) {
            isCreatingOrder = false; // Добавьте эту строку, чтобы сбросить флаг
            if (typeof showToast === 'function') {
                showToast('error', 'Выберите товар', 'В заказ можно добавить только товар из списка доступных товаров');
            }
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Создание...';
        }

        try {
            const response = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': typeof getCookie === 'function' ? getCookie('csrftoken') : '',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === false) {
                throw new Error(result.error || 'Не удалось создать заказ');
            }

            if (typeof showToast === 'function') {
                showToast('success', 'Заказ создан', `#ORD-${result.order?.id || ''} добавлен на сумму ${formatRub(result.order?.total || 0)}`);
            }

            closeCreateModal();
            setTimeout(() => window.location.reload(), 700);
        } catch (error) {
            console.error('Ошибка создания заказа:', error);

            isCreatingOrder = false;

            if (typeof showToast === 'function') {
                showToast('error', 'Ошибка', error.message || 'Не удалось создать заказ');
            } else {
                alert(error.message || 'Не удалось создать заказ');
            }
        } finally {
            if (!isCreatingOrder && submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Создать';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const productSelect = document.getElementById('createOrderProduct');
    const quantityInput = document.getElementById('createOrderQuantity');
    const totalPreview = document.getElementById('createOrderTotalPreview');

    if (!productSelect || !quantityInput || !totalPreview) {
        return;
    }

    function updateTotalPreview() {
        const selectedOption = productSelect.options[productSelect.selectedIndex];

        if (!selectedOption || !selectedOption.value) {
            totalPreview.textContent = '₽0';
            return;
        }

        const price = Number(selectedOption.dataset.price || 0);
        const quantity = Number(quantityInput.value || 1);
        const total = price * quantity;

        totalPreview.textContent = `₽${total.toLocaleString('ru-RU')}`;
    }

    productSelect.addEventListener('change', updateTotalPreview);
    quantityInput.addEventListener('input', updateTotalPreview);

    updateTotalPreview();
});
