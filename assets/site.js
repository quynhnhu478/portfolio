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
            const count = document.createElement("span");
            count.className = "nav-link__count";
            count.textContent = item.count;
            link.appendChild(count);
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

    function init() {
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
        // Đồng bộ tiêu đề trang con lên thanh tiêu đề của trình duyệt trang cha
        if (window.parent && window.parent !== window) {
            window.parent.document.title = document.title + " | Lê Thị Quỳnh Như";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
