document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("marketThemeToggle");
    const applyTheme = (theme) => {
        document.body.dataset.theme = theme;
        localStorage.setItem("market-theme", theme);
    };

    const savedTheme = localStorage.getItem("market-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        applyTheme("dark");
    }

    themeToggle?.addEventListener("click", () => {
        applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
    });

    const animatedCards = document.querySelectorAll(
        ".product-card, .category-card, .meta-card, .cart-item, .profile-card, .history-item, .summary-card, .checkout-panel, .auth-card, .auth-panel"
    );

    animatedCards.forEach((card, index) => {
        card.animate(
            [
                { opacity: 0, transform: "translateY(18px) scale(0.985)" },
                { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            {
                duration: 520,
                delay: Math.min(index * 45, 320),
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "both",
            }
        );
    });

    const revealNodes = document.querySelectorAll("[data-reveal]");
    if (revealNodes.length) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14 }
        );

        revealNodes.forEach((node) => revealObserver.observe(node));
    }

    const profileModal = document.getElementById("profileEditModal");
    const openProfileModalButton = document.querySelector("[data-open-profile-modal]");
    const closeProfileModalButtons = document.querySelectorAll("[data-close-profile-modal]");

    const closeModal = () => {
        if (!profileModal) return;
        profileModal.hidden = true;
        document.body.style.overflow = "";
    };

    const openModal = () => {
        if (!profileModal) return;
        profileModal.hidden = false;
        document.body.style.overflow = "hidden";
    };

    if (profileModal && openProfileModalButton) {
        openProfileModalButton.addEventListener("click", openModal);

        closeProfileModalButtons.forEach((button) => {
            button.addEventListener("click", closeModal);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !profileModal.hidden) {
                closeModal();
            }
        });
    }

    document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const bounds = card.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
            const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
            card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
});
