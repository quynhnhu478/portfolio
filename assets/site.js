(function () {
    const projects = [
        {
            href: "bai-tap/bai-1.html",
            label: "Thao tác với tệp và thư mục",
        },
        {
            href: "bai-tap/bai-2.html",
            label: "Tìm kiếm và đánh giá thông tin",
        },
        {
            href: "bai-tap/bai-3.html",
            label: "Viết prompt hiệu quả",
        },
        {
            href: "bai-tap/bai-4.html",
            label: "Công cụ hợp tác trực tuyến",
        },
        {
            href: "bai-tap/bai-5.html",
            label: "AI tạo sinh hỗ trợ sáng tạo",
        },
        {
            href: "bai-tap/bai-6.html",
            label: "AI có trách nhiệm",
        },
    ];

    const topLinks = [
        { href: "index.html", label: "Trang chủ" },
        { href: "gioi-thieu.html", label: "Giới thiệu" },
        { href: "du-an.html", label: "Dự án", count: projects.length },
        { href: "tong-ket.html", label: "Tổng kết" },
    ];

    function getRootPrefix() {
        return window.location.pathname.replace(/\\/g, "/").includes("/bai-tap/") ? "../" : "";
    }

    function isActive(path) {
        const current = decodeURIComponent(window.location.pathname.replace(/\\/g, "/"));
        if (path === "index.html" && (current.endsWith("/") || current === "")) {
            return true;
        }
        return current.endsWith("/" + path) || current.endsWith(path);
    }

    function buildLink(item, rootPrefix, className, forceActive) {
        const link = document.createElement("a");
        link.className = className;
        link.href = rootPrefix + item.href;
        link.textContent = item.label;
        if (forceActive || isActive(item.href)) {
            link.classList.add("is-active");
        }
        if (item.count) {
            const documentElement = document.createElement("span");
            documentElement.className = "nav-link__count";
            documentElement.textContent = item.count;
            link.appendChild(documentElement);
        }
        return link;
    }

    function repairNotionLinks(rootPrefix) {
        document.querySelectorAll('a[href*="app.notion.com"]').forEach((link) => {
            link.href = rootPrefix + "du-an.html";
            link.removeAttribute("target");
            link.removeAttribute("rel");
        });
    }

    // Thuật toán tự động sửa liên kết ngoài
    function repairExternalLinks() {
        document.querySelectorAll('a').forEach(function (link) {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    // Thuật toán phóng to ảnh
    function initLightbox() {
        document.querySelectorAll('figure.image a, .image a').forEach(function (link) {
            if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(link.href)) {
                link.addEventListener("click", function (e) {
                    e.preventDefault();

                    const overlay = document.createElement("div");
                    overlay.className = "portfolio-lightbox-overlay";
                    overlay.style.cssText = [
                        "position: fixed; top: 0; left: 0; width: 100%; height: 100%;",
                        "background: rgba(22, 19, 16, 0.9); z-index: 999999;",
                        "display: flex; align-items: center; justify-content: center;",
                        "opacity: 0; transition: opacity 220ms ease; cursor: zoom-out;"
                    ].join(" ");

                    const img = document.createElement("img");
                    img.src = this.href;
                    img.style.cssText = [
                        "max-width: 90%; max-height: 90%; border-radius: 12px;",
                        "box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);",
                        "transform: scale(0.96); transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);"
                    ].join(" ");

                    overlay.appendChild(img);
                    document.body.appendChild(overlay);

                    requestAnimationFrame(function () {
                        overlay.style.opacity = "1";
                        img.style.transform = "scale(1)";
                    });

                    overlay.addEventListener("click", function () {
                        overlay.style.opacity = "0";
                        img.style.transform = "scale(0.96)";
                        setTimeout(function () {
                            overlay.remove();
                        }, 220);
                    });
                });
            }
        });
    }

    function init() {
        // 🔴 BỘ LỌC THÔNG MINH: KHÔNG TẠO SIDEBAR TRONG IFRAME
        if (window.parent && window.parent !== window) {
            // Nếu đang chạy trong iframe: Chỉ chạy các tính năng phụ, không tạo menu thừa
            initLightbox();
            repairExternalLinks();
            return; // Thoát ra ngay lập tức để không tạo sidebar thừa
        }

        if (document.querySelector(".portfolio-sidebar")) {
            return;
        }

        const rootPrefix = getRootPrefix();
        document.body.classList.add("has-portfolio-sidebar");

        const sidebar = document.createElement("aside");
        sidebar.className = "portfolio-sidebar";
        sidebar.innerHTML = [
            `<a class="portfolio-brand" href="${rootPrefix}index.html">`,
            '<span class="portfolio-brand__kicker">Digital Portfolio</span>',
            '<span class="portfolio-brand__name">Lê Thị Quỳnh Như</span>',
            '<span class="portfolio-brand__meta">Nhập môn công nghệ số và AI</span>',
            "</a>",
        ].join("");

        const nav = document.createElement("nav");
        nav.className = "portfolio-nav";
        nav.setAttribute("aria-label", "Điều hướng portfolio");

        topLinks.forEach((item) => {
            if (item.href === "du-an.html") {
                const group = document.createElement("div");
                group.className = "nav-group";
                const hasActiveProject = projects.some((project) => isActive(project.href));
                group.appendChild(buildLink(item, rootPrefix, "nav-link", hasActiveProject));

                const children = document.createElement("div");
                children.className = "nav-children";
                projects.forEach((project) => {
                    children.appendChild(buildLink(project, rootPrefix, "nav-child"));
                });
                group.appendChild(children);
                nav.appendChild(group);
                return;
            }

            nav.appendChild(buildLink(item, rootPrefix, "nav-link"));
        });

        sidebar.appendChild(nav);
        document.body.prepend(sidebar);
        repairNotionLinks(rootPrefix);

        initLightbox();
        repairExternalLinks();
        initLightbox();
        repairExternalLinks();

        // 🔴 ĐỒNG BỘ NGƯỢC TRẠNG THÁI ACTIVE LÊN MENU TRANG CHA
        if (window.parent && typeof window.parent.setActiveByHref === "function") {
            window.parent.setActiveByHref(window.location.href);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();