function readJsonScript(id, fallback) {
    const element = document.getElementById(id);
    if (!element) return fallback;

    try {
        return JSON.parse(element.textContent || "");
    } catch (_error) {
        return fallback;
    }
}

function showToast(type, title, message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message || ""}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("hiding");
        setTimeout(() => toast.remove(), 220);
    }, 3200);
}

function exportTableToCsv(tableSelector, fileName) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const rows = [...table.querySelectorAll("tr")];
    const csvRows = rows.map((row) => {
        const cells = [...row.querySelectorAll("th, td")].filter((cell) => !cell.classList.contains("checkbox-col"));
        return cells.map((cell) => `"${cell.innerText.replace(/\s+/g, " ").trim().replace(/"/g, '""')}"`).join(";");
    });

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function setTheme(theme) {
    const html = document.documentElement;
    const button = document.getElementById("themeToggle");
    const nextTheme = theme || (html.dataset.theme === "dark" ? "light" : "dark");

    if (button) {
        button.classList.add("spinning");
        setTimeout(() => button.classList.remove("spinning"), 420);
    }

    html.dataset.theme = nextTheme;
    localStorage.setItem("eo-theme", nextTheme);
}

function initTheme() {
    const savedTheme = localStorage.getItem("eo-theme");
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
    }

    document.getElementById("themeToggle")?.addEventListener("click", () => setTheme());
}

function applyCompactMode(isCompact) {
    document.body.classList.toggle("compact-mode", Boolean(isCompact));
    localStorage.setItem("eo-compact-mode", isCompact ? "1" : "0");
}

function initCompactMode() {
    const compactInput = document.getElementById("settingsCompact");
    const saved = localStorage.getItem("eo-compact-mode") === "1";
    applyCompactMode(saved);

    if (compactInput) {
        compactInput.checked = saved;
        compactInput.addEventListener("change", () => applyCompactMode(compactInput.checked));
    }
}

function initMobileMenu() {
    const menu = document.getElementById("mainNav");
    const overlay = document.getElementById("navOverlay");

    const openMenu = () => {
        menu?.classList.add("mobile-open");
        overlay?.classList.add("active");
    };

    const closeMenu = () => {
        menu?.classList.remove("mobile-open");
        overlay?.classList.remove("active");
    };

    document.getElementById("mobileMenuToggle")?.addEventListener("click", openMenu);
    document.getElementById("navCloseBtn")?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);
    window.addEventListener("resize", () => {
        if (window.innerWidth > 860) closeMenu();
    });
}

function initNotificationsPanel() {
    const toggle = document.getElementById("notificationsToggle");
    const panel = document.getElementById("notificationsPanel");
    const clearButton = document.getElementById("notificationsClear");
    const list = document.getElementById("notificationsList");
    const empty = document.getElementById("notificationsEmpty");
    const dot = toggle?.querySelector(".notif-dot");

    if (!toggle || !panel) return;

    const close = () => {
        panel.hidden = true;
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    const open = () => {
        panel.hidden = false;
        panel.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        if (panel.hidden) open();
        else close();
    });

    clearButton?.addEventListener("click", () => {
        if (list) list.innerHTML = "";
        if (empty) empty.hidden = false;
        if (dot) dot.hidden = true;
    });

    document.addEventListener("click", (event) => {
        if (!panel.hidden && !event.target.closest(".topbar-dropdown-wrap")) close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
    });
}

function initDashboardBarChart(defaultPeriod = "week") {
    const container = document.getElementById("barChart");
    if (!container) return;

    const chartData = readJsonScript("orders-chart-data", { week: [], month: [], year: [] });

    const render = (period) => {
        container.querySelectorAll(".chart-bar-wrap, .chart-empty").forEach((node) => node.remove());
        const data = chartData[period] || [];
        const maxCount = Math.max(...data.map((item) => Number(item.count || 0)), 0);

        if (!data.length || maxCount === 0) {
            const empty = document.createElement("div");
            empty.className = "chart-empty";
            empty.textContent = "За выбранный период заказов нет";
            container.appendChild(empty);
            return;
        }

        data.forEach((item, index) => {
            const count = Number(item.count || 0);
            const wrap = document.createElement("div");
            wrap.className = "chart-bar-wrap";

            const value = document.createElement("span");
            value.className = "chart-value";
            value.textContent = count;

            const bar = document.createElement("div");
            bar.className = "chart-bar";
            bar.style.height = `${Math.max(8, Math.round((count / maxCount) * 100))}%`;
            bar.style.animationDelay = `${index * 80}ms`;

            const label = document.createElement("span");
            label.className = "label";
            label.textContent = item.label;

            wrap.append(value, bar, label);
            container.appendChild(wrap);
        });

        requestAnimationFrame(() => {
            container.querySelectorAll(".chart-bar").forEach((bar) => bar.classList.add("animated"));
        });
    };

    render(defaultPeriod);

    document.querySelectorAll("[data-chart-period]").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-chart-period]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            render(button.dataset.chartPeriod);
        });
    });
}

function initDashboardDonutChart() {
    const svg = document.getElementById("donutSvg");
    const legend = document.getElementById("donutLegend");
    if (!svg || !legend) return;

    const data = readJsonScript("status-chart-data", []).filter((item) => Number(item.count || 0) > 0);
    const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

    svg.innerHTML = "";
    legend.innerHTML = "";

    if (!total) {
        legend.innerHTML = '<div class="donut-empty">Нет данных по статусам</div>';
        return;
    }

    const cx = 60;
    const cy = 60;
    const r = 40;
    const stroke = 14;
    const circumference = 2 * Math.PI * r;
    let progress = 0;

    const background = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    background.setAttribute("cx", cx);
    background.setAttribute("cy", cy);
    background.setAttribute("r", r);
    background.setAttribute("fill", "none");
    background.setAttribute("stroke", "var(--bg-overlay)");
    background.setAttribute("stroke-width", stroke);
    svg.appendChild(background);

    data.forEach((item, index) => {
        const count = Number(item.count || 0);
        const part = count / total;
        const dashLength = part * circumference;
        const startOffset = circumference - progress * circumference;
        const targetOffset = startOffset - dashLength;

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", item.color || "#4da6ff");
        circle.setAttribute("stroke-width", stroke);
        circle.setAttribute("stroke-dasharray", `${dashLength} ${circumference - dashLength}`);
        circle.setAttribute("stroke-dashoffset", startOffset);
        circle.setAttribute("stroke-linecap", "round");
        circle.style.transform = "rotate(-90deg)";
        circle.style.transformOrigin = "60px 60px";
        circle.style.setProperty("--target-offset", targetOffset);
        circle.style.animationDelay = `${index * 150}ms`;
        circle.classList.add("donut-segment");
        svg.appendChild(circle);

        progress += part;
    });

    const totalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    totalText.setAttribute("x", cx);
    totalText.setAttribute("y", cy - 2);
    totalText.setAttribute("text-anchor", "middle");
    totalText.setAttribute("dominant-baseline", "middle");
    totalText.classList.add("donut-center-text");
    totalText.textContent = total.toLocaleString("ru-RU");
    svg.appendChild(totalText);

    const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    subText.setAttribute("x", cx);
    subText.setAttribute("y", cy + 12);
    subText.setAttribute("text-anchor", "middle");
    subText.classList.add("donut-center-sub");
    subText.textContent = "заказов";
    svg.appendChild(subText);

    legend.innerHTML = data.map((item) => {
        const count = Number(item.count || 0);
        const percent = Math.round((count / total) * 100);
        return `
            <div class="legend-item">
                <span class="legend-dot" style="background:${item.color}"></span>
                <span class="legend-label">${item.label}</span>
                <span class="legend-val">${count} / ${percent}%</span>
            </div>
        `;
    }).join("");

    requestAnimationFrame(() => {
        svg.querySelectorAll(".donut-segment").forEach((segment) => segment.classList.add("animated"));
    });
}

function initDashboardActions() {
    document.querySelector('[data-dashboard-action="start-ads"]')?.addEventListener("click", () => {
        showToast("info", "Реклама", "Раздел рекламных кампаний подготовлен под дальнейшую интеграцию");
    });

    document.querySelector('[data-dashboard-action="export-csv"]')?.addEventListener("click", () => {
        exportTableToCsv(".orders-table", "orders_export");
        showToast("success", "Экспорт", "CSV с заказами сформирован");
    });

    document.querySelector('[data-orders-action="advanced-filter"]')?.addEventListener("click", () => {
        showToast("info", "Фильтры", "Расширенные фильтры можно подключить на следующем шаге");
    });

    document.querySelector('[data-orders-action="export-csv"]')?.addEventListener("click", () => {
        exportTableToCsv("#ordersManagementTable", "orders_full");
        showToast("success", "Экспорт", "CSV со всеми заказами сформирован");
    });
}

function initOrdersFilters() {
    const searchInput = document.getElementById("ordersSearch");
    const rows = [...document.querySelectorAll("#ordersTableBody .order-row")];
    const visibleCount = document.getElementById("ordersVisibleCount");
    const selectAll = document.getElementById("selectAllOrders");
    let currentStatus = "all";

    if (!rows.length) return;

    const apply = () => {
        const query = (searchInput?.value || "").trim().toLowerCase();
        let count = 0;

        rows.forEach((row) => {
            const statusMatch = currentStatus === "all" || row.dataset.status === currentStatus;
            const searchMatch = !query || row.dataset.search.toLowerCase().includes(query);
            const visible = statusMatch && searchMatch;
            row.hidden = !visible;
            if (visible) count += 1;
        });

        if (visibleCount) visibleCount.textContent = String(count);
    };

    searchInput?.addEventListener("input", apply);

    document.querySelectorAll("[data-status-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            currentStatus = button.dataset.statusFilter;
            document.querySelectorAll("[data-status-filter]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            apply();
        });
    });

    selectAll?.addEventListener("change", () => {
        document.querySelectorAll(".row-checkbox").forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
        });
    });

    apply();
}

function initProductActions() {
    document.querySelector('[data-products-action="export"]')?.addEventListener("click", () => {
        exportTableToCsv("#productsTable", "products_catalog");
        showToast("success", "Экспорт", "CSV с товарами сформирован");
    });

    document.querySelector('[data-products-action="filter"]')?.addEventListener("click", () => {
        showToast("info", "Фильтр", "Фильтрация товаров подключается отдельно от текущего экрана");
    });
}

function initSettingsActions() {
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-theme-choice]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            if (button.dataset.themeChoice === "system") {
                const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                setTheme(prefersDark ? "dark" : "light");
            } else {
                setTheme(button.dataset.themeChoice);
            }
        });
    });

    const saveProfileButton = document.querySelector('[data-settings-action="save-profile"]');
    saveProfileButton?.addEventListener("click", async () => {
        const fullName = document.getElementById("settingsProfileName")?.value.trim() || "";
        const email = document.getElementById("settingsProfileEmail")?.value.trim() || "";
        const url = saveProfileButton.dataset.settingsProfileUrl;

        saveProfileButton.disabled = true;
        saveProfileButton.textContent = "Сохранение...";

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({ full_name: fullName, email }),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Не удалось сохранить профиль");
            }

            document.getElementById("settingsProfileName").value = result.profile.full_name;
            document.getElementById("settingsProfileEmail").value = result.profile.email;
            showToast("success", "Профиль", "Изменения профиля сохранены");
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось сохранить профиль");
        } finally {
            saveProfileButton.disabled = false;
            saveProfileButton.textContent = "Сохранить";
        }
    });

    document.querySelector('[data-settings-action="connect-telegram"]')?.addEventListener("click", () => {
        showToast("info", "Telegram Ads", "Подключение Telegram Ads подготовлено к интеграции");
    });

    document.querySelector('[data-settings-action="2fa"]')?.addEventListener("click", () => {
        showToast("info", "Безопасность", "Настройка двухфакторной авторизации будет следующим шагом");
    });

    document.querySelector('[data-settings-action="password"]')?.addEventListener("click", () => {
        showToast("info", "Безопасность", "Смена пароля подключается отдельно");
    });

    document.querySelector('[data-settings-action="logout-all"]')?.addEventListener("click", () => {
        showToast("warning", "Сессии", "Команда завершения всех сессий подготовлена");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initCompactMode();
    initMobileMenu();
    initNotificationsPanel();
    initDashboardBarChart();
    initDashboardDonutChart();
    initDashboardActions();
    initOrdersFilters();
    initProductActions();
    initSettingsActions();
});
