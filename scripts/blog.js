(function () {
    var posts = window.blogPosts || [];
    var postsContainer = document.getElementById("blog-posts");
    var searchInput = document.getElementById("blog-search");
    var searchButton = document.getElementById("blog-search-button");
    var categoryLinks = document.querySelectorAll("[data-blog-category]");
    var activeFilter = document.getElementById("blog-active-filter");
    var emptyState = document.getElementById("blog-empty-state");
    var selectedCategory = "";

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            }[character];
        });
    }

    function getPostTags(post) {
        return Array.isArray(post.tags) ? post.tags : [];
    }

    function postMatchesSearch(post, searchTerm) {
        if (!searchTerm) {
            return true;
        }

        var searchableText = [
            post.title,
            post.excerpt,
            post.posted,
            post.author,
            post.categories.join(" "),
            getPostTags(post).join(" ")
        ].join(" ").toLowerCase();

        return searchableText.indexOf(searchTerm.toLowerCase()) !== -1;
    }

    function postMatchesCategory(post, category) {
        if (!category) {
            return true;
        }

        return post.categories.indexOf(category) !== -1;
    }

    function renderPost(post) {
        return [
            '<div class="card mb-4" data-post-categories="' + escapeHtml(post.categories.join(",")) + '">',
            '   <img class="img-thumbnail" src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.imageAlt) + '" style="width: 50%; height: auto;">',
            '   <div class="card-body">',
            '       <h2 class="card-title"><a href="' + escapeHtml(post.url) + '">' + escapeHtml(post.title) + '</a></h2>',
            '       <p class="card-text">' + escapeHtml(post.excerpt) + '</p>',
            '       <a href="' + escapeHtml(post.url) + '" class="btn btn-primary" style="background-color: #6f42c1;">Read More &rarr;</a>',
            '   </div>',
            '   <div class="card-footer text-muted">',
            '       Posted ' + escapeHtml(post.posted) + ' by <a href="' + escapeHtml(post.authorUrl) + '">' + escapeHtml(post.author) + '</a>',
            '   </div>',
            '</div>'
        ].join("\n");
    }

    function updateFilterLabel(searchTerm) {
        var labels = [];

        if (searchTerm) {
            labels.push('search: "' + searchTerm + '"');
        }

        if (selectedCategory) {
            labels.push("category: " + selectedCategory);
        }

        if (activeFilter) {
            activeFilter.textContent = labels.length ? "Showing posts for " + labels.join(" and ") : "Showing all posts";
        }
    }

    function renderPosts() {
        var searchTerm = searchInput ? searchInput.value.trim() : "";
        var filteredPosts = posts.filter(function (post) {
            return postMatchesSearch(post, searchTerm) && postMatchesCategory(post, selectedCategory);
        });

        postsContainer.innerHTML = filteredPosts.map(renderPost).join("\n");

        if (emptyState) {
            emptyState.style.display = filteredPosts.length ? "none" : "block";
        }

        updateFilterLabel(searchTerm);
    }

    function setSelectedCategory(category) {
        selectedCategory = category;

        categoryLinks.forEach(function (link) {
            var isSelected = link.getAttribute("data-blog-category") === selectedCategory;
            link.setAttribute("aria-current", isSelected ? "true" : "false");
        });

        renderPosts();
    }

    function readFiltersFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var category = params.get("category") || "";
        var search = params.get("search") || "";

        if (searchInput && search) {
            searchInput.value = search;
        }

        setSelectedCategory(category);
    }

    function updateUrl() {
        var params = new URLSearchParams();
        var searchTerm = searchInput ? searchInput.value.trim() : "";

        if (searchTerm) {
            params.set("search", searchTerm);
        }

        if (selectedCategory) {
            params.set("category", selectedCategory);
        }

        var newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
        window.history.replaceState({}, "", newUrl);
    }

    if (!postsContainer) {
        return;
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            updateUrl();
            renderPosts();
        });

        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                updateUrl();
                renderPosts();
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener("click", function () {
            updateUrl();
            renderPosts();
        });
    }

    categoryLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            setSelectedCategory(link.getAttribute("data-blog-category") || "");
            updateUrl();
        });
    });

    readFiltersFromUrl();
}());
