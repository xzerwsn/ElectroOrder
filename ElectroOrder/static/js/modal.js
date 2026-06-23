function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (const rawCookie of cookies) {
            const cookie = rawCookie.trim();
            if (cookie.startsWith(`${name}=`)) {
                cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function openModal(id) {
    document.getElementById(id)?.classList.add("show");
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-modal-close]").forEach((button) => {
        button.addEventListener("click", () => closeModal(button.dataset.modalClose));
    });

    document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) modal.classList.remove("show");
        });
    });

    initOrderModal();
    initCreateOrderModal();
    initCreateProductModal();
    initManageProductModal();
});

function initOrderModal() {
    const modal = document.getElementById("orderModal");
    const saveButton = document.getElementById("modalOrderSaveBtn");
    const statusSelect = document.getElementById("modalOrderStatusSelect");
    const badge = document.getElementById("modalOrderBadge");
    if (!modal || !saveButton || !statusSelect || !badge) return;

    let currentOrderId = null;
    let currentOrderRow = null;

    const updateBadge = (statusValue, statusLabel) => {
        badge.className = `status-badge status-${statusValue}`;
        badge.innerHTML = `<span class="status-dot"></span><span id="modalOrderStatus">${statusLabel}</span>`;
    };

    const openFromRow = async (row) => {
        const orderId = row.dataset.orderId;
        if (!orderId) return;

        try {
            const response = await fetch(`/crm/orders/${orderId}/json/`);
            if (!response.ok) throw new Error("Не удалось загрузить заказ");

            const data = await response.json();
            currentOrderId = orderId;
            currentOrderRow = row;
            document.getElementById("modalOrderId").textContent = `#ORD-${data.id}`;
            document.getElementById("modalOrderUser").textContent = data.user;
            document.getElementById("modalOrderTotal").textContent = data.total;
            document.getElementById("modalOrderProduct").textContent = data.product || "—";
            document.getElementById("modalOrderCreated").textContent = data.created_at;
            statusSelect.value = data.status_value;
            updateBadge(data.status_value, data.status);
            openModal("orderModal");
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось открыть заказ");
        }
    };

    document.querySelectorAll(".order-row").forEach((row) => {
        row.addEventListener("click", (event) => {
            if (event.target.closest(".checkbox-wrap") || event.target.closest(".order-open-btn")) return;
            openFromRow(row);
        });
    });

    document.querySelectorAll("[data-order-open]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const row = button.closest(".order-row");
            if (row) openFromRow(row);
        });
    });

    saveButton.addEventListener("click", async () => {
        if (!currentOrderId) return;

        saveButton.disabled = true;
        saveButton.textContent = "Сохранение...";

        try {
            const response = await fetch(`/crm/orders/${currentOrderId}/update-status/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({ status: statusSelect.value }),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Не удалось сохранить статус");
            }

            updateBadge(result.status_value, result.status);

            if (currentOrderRow) {
                currentOrderRow.dataset.status = result.status_value;
                currentOrderRow.classList.remove("status-new", "status-pending", "status-delivered", "status-cancelled");
                currentOrderRow.classList.add(`status-${result.status_value}`);

                const rowBadge = currentOrderRow.querySelector(".status-badge");
                if (rowBadge) {
                    rowBadge.className = `status-badge status-${result.status_value}`;
                    rowBadge.innerHTML = `<span class="status-dot"></span>${result.status}`;
                }
            }

            showToast("success", "Заказ обновлён", `Статус заказа #ORD-${currentOrderId} сохранён`);
            closeModal("orderModal");
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось сохранить заказ");
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Сохранить";
        }
    });
}

function initCreateOrderModal() {
    const triggerButtons = document.querySelectorAll('[data-dashboard-action="create-order"]');
    const modal = document.getElementById("createOrderModal");
    const form = document.getElementById("createOrderForm");
    const submitButton = document.getElementById("createOrderSubmitBtn");
    const productSelect = document.getElementById("createOrderProduct");
    const quantityInput = document.getElementById("createOrderQuantity");
    const totalPreview = document.getElementById("createOrderTotalPreview");
    if (!modal || !form || !submitButton || !productSelect || !quantityInput || !totalPreview) return;

    const createUrl = triggerButtons[0]?.dataset.createOrderUrl || "/orders/create/json/";
    const formatRub = (value) => `₽${Number(value || 0).toLocaleString("ru-RU")}`;

    const updateTotal = () => {
        const option = productSelect.selectedOptions[0];
        const price = Number(option?.dataset.price || 0);
        const quantity = Number(quantityInput.value || 1);
        totalPreview.textContent = formatRub(price * quantity);
    };

    triggerButtons.forEach((button) => {
        button.addEventListener("click", () => {
            form.reset();
            updateTotal();
            openModal("createOrderModal");
        });
    });

    productSelect.addEventListener("change", updateTotal);
    quantityInput.addEventListener("input", updateTotal);
    updateTotal();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = "Создание...";

        const formData = new FormData(form);
        const payload = {
            user_id: formData.get("user_id"),
            product_id: formData.get("product_id"),
            quantity: formData.get("quantity"),
            status: formData.get("status"),
        };

        try {
            const response = await fetch(createUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Не удалось создать заказ");
            }

            showToast("success", "Заказ создан", `#ORD-${result.order.id} добавлен на сумму ${formatRub(result.order.total)}`);
            closeModal("createOrderModal");
            window.setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось создать заказ");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Создать";
        }
    });
}

function initCreateProductModal() {
    const triggerButton = document.querySelector('[data-products-action="add-product"]');
    const modal = document.getElementById("createProductModal");
    const form = document.getElementById("createProductForm");
    const submitButton = document.getElementById("createProductSubmitBtn");
    if (!triggerButton || !modal || !form || !submitButton) return;

    const createUrl = triggerButton.dataset.createProductUrl || "/products/create/json/";

    triggerButton.addEventListener("click", () => {
        form.reset();
        const activeInput = document.getElementById("createProductActive");
        if (activeInput) activeInput.checked = true;
        openModal("createProductModal");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = "Создание...";

        const formData = new FormData(form);
        const payload = {
            name: formData.get("name"),
            price: formData.get("price"),
            stock: formData.get("stock"),
            is_active: formData.get("is_active") === "on",
        };

        try {
            const response = await fetch(createUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Не удалось создать товар");
            }

            showToast("success", "Товар создан", `${result.product.name} добавлен в каталог`);
            closeModal("createProductModal");
            window.setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось создать товар");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Создать";
        }
    });
}

function initManageProductModal() {
    const modal = document.getElementById("productManageModal");
    const form = document.getElementById("manageProductForm");
    const submitButton = document.getElementById("manageProductSubmitBtn");
    if (!modal || !form || !submitButton) return;

    let currentDetailUrl = "";
    let currentUpdateUrl = "";

    const openProduct = async (button) => {
        try {
            const response = await fetch(button.dataset.productDetailUrl);
            if (!response.ok) throw new Error("Не удалось загрузить товар");

            const product = await response.json();
            currentDetailUrl = button.dataset.productDetailUrl;
            currentUpdateUrl = button.dataset.productUpdateUrl;

            document.getElementById("manageProductSku").textContent = `SKU-${String(product.id).padStart(5, "0")}`;
            document.getElementById("manageProductName").value = product.name;
            document.getElementById("manageProductPrice").value = product.price;
            document.getElementById("manageProductStock").value = product.stock;
            document.getElementById("manageProductActive").checked = Boolean(product.is_active);

            openModal("productManageModal");
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось открыть товар");
        }
    };

    document.querySelectorAll(".product-open-btn").forEach((button) => {
        button.addEventListener("click", () => openProduct(button));
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentUpdateUrl) return;

        submitButton.disabled = true;
        submitButton.textContent = "Сохранение...";

        const payload = {
            name: document.getElementById("manageProductName").value.trim(),
            price: document.getElementById("manageProductPrice").value,
            stock: document.getElementById("manageProductStock").value,
            is_active: document.getElementById("manageProductActive").checked,
        };

        try {
            const response = await fetch(currentUpdateUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) {
                throw new Error(result.error || "Не удалось сохранить товар");
            }

            showToast("success", "Товар обновлён", `${result.product.name} сохранён`);
            closeModal("productManageModal");
            window.setTimeout(() => window.location.reload(), 400);
        } catch (error) {
            showToast("error", "Ошибка", error.message || "Не удалось сохранить товар");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Сохранить";
        }
    });
}
