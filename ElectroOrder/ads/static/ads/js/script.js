function renderCampaignCompareChart() {
    const container = document.getElementById("campaignCompareChart");
    const data = readJsonScript("campaign-chart-data", { labels: [], spent: [], revenue: [] });
    if (!container) return;

    container.innerHTML = "";

    const maxValue = Math.max(...data.spent, ...data.revenue, 0);
    if (!data.labels.length || !maxValue) {
        container.innerHTML = '<div class="chart-empty">Нет данных по кампаниям</div>';
        return;
    }

    data.labels.forEach((label, index) => {
        const spent = Number(data.spent[index] || 0);
        const revenue = Number(data.revenue[index] || 0);
        const group = document.createElement("div");
        group.className = "compare-group";
        group.innerHTML = `
            <div class="compare-group__bars">
                <div class="compare-bar compare-bar--spent" style="height:${Math.max(8, Math.round((spent / maxValue) * 210))}px"></div>
                <div class="compare-bar compare-bar--revenue" style="height:${Math.max(8, Math.round((revenue / maxValue) * 210))}px"></div>
            </div>
            <div class="compare-group__label">${label}</div>
            <div class="compare-group__meta">₽${spent.toLocaleString("ru-RU")} / ₽${revenue.toLocaleString("ru-RU")}</div>
        `;
        container.appendChild(group);
    });
}

function renderCampaignStatusChart() {
    const svg = document.getElementById("campaignStatusSvg");
    const legend = document.getElementById("campaignStatusLegend");
    if (!svg || !legend) return;

    const data = readJsonScript("campaign-status-data", []).filter((item) => Number(item.count || 0) > 0);
    const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

    svg.innerHTML = "";
    legend.innerHTML = "";
    if (!total) {
        legend.innerHTML = '<div class="donut-empty">Нет активных данных по статусам</div>';
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

    data.forEach((item) => {
        const count = Number(item.count || 0);
        const part = count / total;
        const dashLength = part * circumference;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", item.color);
        circle.setAttribute("stroke-width", stroke);
        circle.setAttribute("stroke-dasharray", `${dashLength} ${circumference - dashLength}`);
        circle.setAttribute("stroke-dashoffset", circumference - progress * circumference);
        circle.setAttribute("stroke-linecap", "round");
        circle.style.transform = "rotate(-90deg)";
        circle.style.transformOrigin = "60px 60px";
        svg.appendChild(circle);
        progress += part;
    });

    const totalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    totalText.setAttribute("x", cx);
    totalText.setAttribute("y", cy - 2);
    totalText.setAttribute("text-anchor", "middle");
    totalText.setAttribute("dominant-baseline", "middle");
    totalText.classList.add("donut-center-text");
    totalText.textContent = String(total);
    svg.appendChild(totalText);

    const subText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    subText.setAttribute("x", cx);
    subText.setAttribute("y", cy + 12);
    subText.setAttribute("text-anchor", "middle");
    subText.classList.add("donut-center-sub");
    subText.textContent = "кампаний";
    svg.appendChild(subText);

    legend.innerHTML = data.map((item) => `
        <div class="legend-item">
            <span class="legend-dot" style="background:${item.color}"></span>
            <span class="legend-label">${item.label}</span>
            <span class="legend-val">${item.count}</span>
        </div>
    `).join("");
}

function initCampaignCreateModal() {
    const trigger = document.getElementById("openCampaignModal");
    const modal = document.getElementById("createCampaignModal");
    const form = document.getElementById("createCampaignForm");
    const submitButton = document.getElementById("createCampaignSubmitBtn");
    if (!trigger || !modal || !form || !submitButton) return;

    trigger.addEventListener("click", () => {
        form.reset();
        const startInput = document.getElementById("campaignStartDate");
        if (startInput) startInput.valueAsDate = new Date();
        openModal("createCampaignModal");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = "Создание...";

        const formData = new FormData(form);
        const payload = {
            name: formData.get("name"),
            channel: formData.get("channel"),
            budget: formData.get("budget"),
            start_date: formData.get("start_date"),
            seed_product: formData.get("seed_product"),
            description: formData.get("description"),
        };

        try {
            const response = await fetch(trigger.dataset.createCampaignUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Не удалось создать кампанию");
            }

            showToast("success", "Кампания создана", `${result.campaign.name} добавлена в работу`);
            closeModal("createCampaignModal");
            window.setTimeout(() => window.location.reload(), 400);
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось создать кампанию");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Создать";
        }
    });
}

function initCampaignStatusButtons() {
    document.querySelectorAll(".campaign-status-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            if (button.disabled) return;

            const nextStatus = button.dataset.nextStatus;
            button.disabled = true;
            const previousText = button.textContent;
            button.textContent = "Сохранение...";

            try {
                const response = await fetch(button.dataset.updateUrl, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },
                    body: JSON.stringify({ status: nextStatus }),
                });

                const result = await response.json().catch(() => ({}));
                if (!response.ok || result.success === false) {
                    throw new Error(result.error || "Не удалось обновить статус");
                }

                showToast("success", "Кампания обновлена", `Статус изменён: ${result.campaign.status}`);
                window.setTimeout(() => window.location.reload(), 250);
            } catch (error) {
                button.disabled = false;
                button.textContent = previousText;
                showToast("error", "Ошибка", error.message || "Не удалось обновить статус");
            }
        });
    });
}

function renderAnalyticsTimeline() {
    const container = document.getElementById("analyticsTimelineChart");
    const data = readJsonScript("orders-timeline-data", { labels: [], revenue: [], orders: [] });
    if (!container) return;

    container.innerHTML = '<div class="timeline-grid"><span></span><span></span><span></span><span></span></div>';
    const bars = document.createElement("div");
    bars.className = "timeline-bars";
    const maxRevenue = Math.max(...data.revenue, 0);
    const maxOrders = Math.max(...data.orders, 0);

    if (!data.labels.length || (!maxRevenue && !maxOrders)) {
        container.innerHTML = '<div class="chart-empty">Нет данных за выбранный период</div>';
        return;
    }

    data.labels.forEach((label, index) => {
        const slot = document.createElement("div");
        slot.className = "timeline-slot";
        const revenue = Number(data.revenue[index] || 0);
        const orders = Number(data.orders[index] || 0);
        slot.innerHTML = `
            <div class="timeline-slot__bars">
                <div class="timeline-slot__bar timeline-slot__bar--revenue" style="height:${Math.max(6, Math.round((revenue / maxRevenue) * 220))}px"></div>
                <div class="timeline-slot__bar timeline-slot__bar--orders" style="height:${Math.max(6, Math.round((orders / maxOrders) * 220))}px"></div>
            </div>
            <div class="timeline-slot__label">${label}</div>
        `;
        bars.appendChild(slot);
    });

    container.appendChild(bars);
}

document.addEventListener("DOMContentLoaded", () => {
    renderCampaignCompareChart();
    renderCampaignStatusChart();
    initCampaignCreateModal();
    initCampaignStatusButtons();
    renderAnalyticsTimeline();
});
