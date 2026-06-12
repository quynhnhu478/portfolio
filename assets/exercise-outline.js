(function () {
    function cleanText(text) {
        return text.replace(/\s+/g, " ").trim();
    }

    function ensureId(element, index) {
        if (!element.id) {
            element.id = "outline-section-" + index;
        }
        return element.id;
    }

    function getSummaryLevel(summary) {
        var level = 0;
        var node = summary.parentElement;
        while (node) {
            if (node.tagName === "DETAILS") {
                level += 1;
            }
            node = node.parentElement;
        }
        return Math.max(1, Math.min(level, 3));
    }

    function injectParentStyles(targetDoc) {
        if (targetDoc.getElementById("outline-popover-styles")) return;
        var style = targetDoc.createElement("style");
        style.id = "outline-popover-styles";
        style.textContent = [
            ".nav-outline-popover {",
            "    position: fixed; width: 310px; max-height: calc(100vh - 60px);",
            "    overflow-y: auto; background: #ffffff;",
            "    border: 1px solid rgba(37, 33, 28, 0.08); border-radius: 16px;",
            "    padding: 20px 16px; display: none; ",
            "    box-shadow: 0 20px 50px rgba(37, 33, 28, 0.1), 0 4px 15px rgba(37, 33, 28, 0.02);",
            "    z-index: 100000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
            "    opacity: 0; transform: scale(0.96) translateX(-10px);",
            "    transition: opacity 220ms ease, transform 220ms cubic-bezier(0.4, 0, 0.2, 1);",
            "}",
            ".nav-outline-popover.is-visible {",
            "    opacity: 1; transform: scale(1) translateX(0);",
            "}",
            ".popover-title {",
            "    margin: 0 0 12px 4px; font-size: 0.75rem; font-weight: 700;",
            "    text-transform: uppercase; letter-spacing: 0.08em; color: #8c857b;",
            "    border-bottom: 1px solid rgba(0, 0, 0, 0.04); padding-bottom: 8px;",
            "}",
            ".popover-list {",
            "    display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none;", // Tăng gap lên 8px tạo khoảng thở cho đề mục
            "}",
            ".popover-item { margin: 0; padding: 0; }",
            ".popover-link {",
            "    display: block; color: #4a453e; font-size: 0.82rem; line-height: 1.45;",
            "    text-decoration: none; padding: 6px 8px; border-radius: 8px; transition: all 150ms ease;",
            "    white-space: normal; word-break: break-word;",
            "}",
            ".popover-link:hover {",
            "    background: rgba(47, 111, 115, 0.06); color: #164d50; text-decoration: none;",
            "}",
            "/* Phân cấp thị giác rõ nét */",
            ".popover-item--level-1 .popover-link {",
            "    font-weight: 700; color: #25211c; font-size: 0.85rem;", // Đề mục lớn đậm và tối màu
            "}",
            ".popover-item--level-2 .popover-link {",
            "    padding-left: 14px; color: #5c554d; font-size: 0.8rem;", // Đề mục nhỏ vừa phải, lùi lề rõ ràng
            "}",
            ".popover-item--level-3 .popover-link {",
            "    padding-left: 24px; color: #7a7066; font-size: 0.78rem;", // Đề mục phụ nhỏ và có màu xám nhẹ hơn
            "}",
            "@media (max-width: 980px) {",
            "    .nav-outline-popover { display: none !important; }",
            "}"
        ].join("\n");
        targetDoc.head.appendChild(style);
    }

    function buildOutline() {
        var article = document.querySelector("article.page");
        if (!article) return;

        // Quét các đề mục
        var targets = Array.from(article.querySelectorAll("summary, h2, h3, h4"))
            .map(function (element, index) {
                var title = "";

                // THUẬT TOÁN: Xử lý bóc tách tiêu đề gốc nếu thẻ chứa thẻ xuống dòng <br/> và đoạn mô tả dài phía sau
                var rawHtml = element.innerHTML;
                var brMatch = rawHtml.split(/<br\s*\/?>/i);
                if (brMatch.length > 1) {
                    var tempDiv = document.createElement("div");
                    tempDiv.innerHTML = brMatch[0]; // Chỉ lấy phần html trước thẻ <br/> đầu tiên
                    title = cleanText(tempDiv.textContent || "");
                } else {
                    title = cleanText(element.textContent || "");
                }

                if (!title || title.length < 3) return null;

                var level = element.tagName === "SUMMARY"
                    ? getSummaryLevel(element)
                    : Math.max(1, Math.min(Number(element.tagName.slice(1)) - 1, 3));

                return {
                    element: element,
                    id: ensureId(element, index + 1),
                    level: level,
                    title: title
                };
            })
            .filter(Boolean);

        if (targets.length < 2) return;

        var isIframe = window.parent && window.parent !== window;
        var targetDoc = isIframe ? window.parent.document : document;

        var oldPopover = targetDoc.querySelector(".nav-outline-popover");
        if (oldPopover) {
            oldPopover.remove();
        }

        injectParentStyles(targetDoc);

        var activeMenuLink = targetDoc.querySelector(".portfolio-sidebar .is-active");
        if (activeMenuLink) {
            var popoverCard = targetDoc.createElement("div");
            popoverCard.className = "nav-outline-popover";

            var rect = activeMenuLink.getBoundingClientRect();
            popoverCard.style.top = rect.top + "px";
            popoverCard.style.left = (rect.right + 12) + "px";

            var title = targetDoc.createElement("div");
            title.className = "popover-title";
            title.textContent = "Mục lục bài viết";
            popoverCard.appendChild(title);

            var list = targetDoc.createElement("ul");
            list.className = "popover-list";

            targets.forEach(function (target) {
                var item = targetDoc.createElement("li");
                item.className = "popover-item popover-item--" + target.level;

                var link = targetDoc.createElement("a");
                link.className = "popover-link";
                link.title = target.title;
                link.textContent = target.title;

                link.href = "javascript:void(0);";
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    var parentDetails = target.element.closest("details");
                    if (parentDetails && !parentDetails.open) {
                        parentDetails.open = true;
                    }
                    target.element.scrollIntoView({ behavior: "smooth", block: "start" });
                });

                item.appendChild(link);
                list.appendChild(item);
            });

            popoverCard.appendChild(list);
            targetDoc.body.appendChild(popoverCard);

            function openPopover() {
                popoverCard.style.display = "block";

                var rect = activeMenuLink.getBoundingClientRect();
                var popoverHeight = popoverCard.offsetHeight;
                var viewportHeight = (window.parent && window.parent.innerHeight) ? window.parent.innerHeight : window.innerHeight;

                var topPos = rect.top;
                var leftPos = rect.right + 12;

                if (topPos + popoverHeight > viewportHeight - 24) {
                    topPos = viewportHeight - popoverHeight - 24;
                }
                if (topPos < 24) {
                    topPos = 24;
                }

                popoverCard.style.top = topPos + "px";
                popoverCard.style.left = leftPos + "px";

                requestAnimationFrame(function () {
                    popoverCard.classList.add("is-visible");
                });
            }

            function closePopover() {
                if (popoverCard.classList.contains("is-visible")) {
                    popoverCard.classList.remove("is-visible");
                    setTimeout(function () {
                        popoverCard.style.display = "none";
                    }, 220);
                }
            }

            openPopover();

            activeMenuLink.addEventListener("click", function (e) {
                e.preventDefault();
                if (popoverCard.classList.contains("is-visible")) {
                    closePopover();
                } else {
                    openPopover();
                }
            });

            function handleGlobalClick(e) {
                var clickedInsidePopover = popoverCard.contains(e.target);
                var clickedActiveLink = activeMenuLink === e.target || activeMenuLink.contains(e.target);

                if (!clickedInsidePopover && !clickedActiveLink) {
                    closePopover();
                }
            }

            targetDoc.addEventListener("click", handleGlobalClick);
            document.addEventListener("click", handleGlobalClick);

            if (isIframe) {
                window.parent.addEventListener("resize", function() {
                    var newRect = activeMenuLink.getBoundingClientRect();
                    var newPopoverHeight = popoverCard.offsetHeight;
                    var newViewportHeight = window.parent.innerHeight;
                    var newTopPos = newRect.top;

                    if (newTopPos + newPopoverHeight > newViewportHeight - 24) {
                        newTopPos = newViewportHeight - newPopoverHeight - 24;
                    }
                    if (newTopPos < 24) newTopPos = 24;

                    popoverCard.style.top = newTopPos + "px";
                    popoverCard.style.left = (newRect.right + 12) + "px";
                });
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildOutline);
    } else {
        buildOutline();
    }
})();