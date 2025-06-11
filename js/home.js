

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

let currentPage = 1;
const categoriesPerPage = 5;
const articlesPerCategory = 6;
const totalArticlesPerPage = categoriesPerPage * articlesPerCategory; // 25 articles per page
let allArticles = [];
let categories = [];
let organizedByCategory = {};

document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:5000";
    const catId = localStorage.getItem("catId");
    const subCatId = localStorage.getItem("subCatId");
    const keywordParams = JSON.parse(localStorage.getItem("keyword"));
    
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const mainContent = document.getElementById("main-content");
    
    try {
        // Fetch categories
        const categoriesResponse = await fetch(`${API_URL}/public/categories`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        
        if (categoriesResponse.ok) {
            categories = await categoriesResponse.json();
            if (categories.msg) {
                categories = [];
            }
        } else {
            console.warn("Could not fetch categories, using fallback");
            categories = [];
        }
        
        let articles = [];
        let isSecondVisit = false;
        
        if (catId && subCatId && keywordParams) {
            isSecondVisit = true;
            const keyword = keywordParams
                .map((k) => `keyword=${encodeURIComponent(k)}`)
                .join("&");
            
            const secondVisitArticles = await fetch(
                `${API_URL}/public/articles-by-clicked?catId=${catId}&subCatId=${subCatId}&${keyword}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );
            
            if (!secondVisitArticles.ok) {
                throw new Error("Failed to fetch second visit articles");
            }
            
            const secondVisitArticlesData = await secondVisitArticles.json();
            const allSecondVisitArticles = secondVisitArticlesData.articles || [];
            
            articles = shuffleArray(allSecondVisitArticles);
            
        } else {
            const firstVisitArticles = await fetch(`${API_URL}/public/show-articles`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            
            if (!firstVisitArticles.ok) {
                throw new Error("Failed to fetch first visit articles");
            }
            
            const firstVisitData = await firstVisitArticles.json();
            const allFirstVisitArticles = firstVisitData.articles || [];
            
            articles = shuffleArray(allFirstVisitArticles);
        }
        
        if (articles.length === 0) {
            throw new Error("No articles found");
        }
        
        // Store all articles and organize them by category
        allArticles = articles;
        organizedByCategory = organizeArticlesByCategory(articles);
        
        loading.style.display = "none";
        mainContent.style.display = "block";
        
        // Display articles with pagination
        populateArticlesWithPagination();
        
    } catch (err) {
        console.error("Error fetching articles:", err);
        loading.style.display = "none";
        error.style.display = "block";
    }
});

function organizeArticlesByCategory(articles) {
    const organizedSections = {};
    
    // Group articles by category
    articles.forEach(article => {
        const categoryName = getCategoryName(article.catId);
        if (!organizedSections[categoryName]) {
            organizedSections[categoryName] = [];
        }
        organizedSections[categoryName].push(article);
    });
    
    // Shuffle articles within each category
    Object.keys(organizedSections).forEach(category => {
        organizedSections[category] = shuffleArray(organizedSections[category]);
    });
    
    return organizedSections;
}

function getPageData(pageNumber) {
    const categoryNames = Object.keys(organizedByCategory);
    const totalCategories = categoryNames.length;
    const totalPages = Math.ceil(totalCategories / categoriesPerPage);
    
    if (pageNumber > totalPages) {
        return { categories: {}, totalPages };
    }
    
    // Calculate which categories to show on this page
    const startCategoryIndex = (pageNumber - 1) * categoriesPerPage;
    const endCategoryIndex = Math.min(startCategoryIndex + categoriesPerPage, totalCategories);
    
    const pageCategories = {};
    
    for (let i = startCategoryIndex; i < endCategoryIndex; i++) {
        const categoryName = categoryNames[i];
        const categoryArticles = organizedByCategory[categoryName];
        
        // Limit to 5 articles per category
        pageCategories[categoryName] = categoryArticles.slice(0, articlesPerCategory);
    }
    
    return { categories: pageCategories, totalPages };
}

function populateArticlesWithPagination() {
    const { categories: pageCategories, totalPages } = getPageData(currentPage);
    
    // Get all articles from current page
    let allPageArticles = [];
    Object.values(pageCategories).forEach(categoryArticles => {
        allPageArticles.push(...categoryArticles);
    });
    
    // Find featured articles from ALL articles (not just current page)
    const featuredArticles = allArticles.filter(article => 
        article.featured === true || article.mainArticle === true
    );
    
    let heroArticle = null;
    
    // If we have featured articles, randomly select one
    if (featuredArticles.length > 0) {
        const randomIndex = Math.floor(Math.random() * featuredArticles.length);
        heroArticle = featuredArticles[randomIndex];
    } else {
        // Fallback: look for mainArticle in current page articles
        heroArticle = allPageArticles.find(article => article.mainArticle === true);
    }
    
    // Populate hero article if found
    if (heroArticle) {
        populateHeroArticle(heroArticle);
        // Remove hero article from categories to avoid duplication
        Object.keys(pageCategories).forEach(categoryName => {
            pageCategories[categoryName] = pageCategories[categoryName].filter(
                article => article._id !== heroArticle._id
            );
        });
    }
    
    // Handle lead story if no hero article and we have articles
    if (!heroArticle && allPageArticles.length > 0) {
        const leadArticle = allPageArticles[0];
        populateLeadStory(leadArticle);
        // Remove lead article from categories
        Object.keys(pageCategories).forEach(categoryName => {
            const articleIndex = pageCategories[categoryName].findIndex(
                article => article._id === leadArticle._id
            );
            if (articleIndex !== -1) {
                pageCategories[categoryName].splice(articleIndex, 1);
                return;
            }
        });
    }
    
    // Populate articles grid
    populateArticlesGrid(pageCategories);
    
    // Update pagination controls
    updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {
    let paginationContainer = document.getElementById('pagination-container');
    
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'pagination-container mt-4 mb-4';
        document.getElementById('articles-container').after(paginationContainer);
    }
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    // Calculate total articles for current page
    const { categories: pageCategories } = getPageData(currentPage);
    let totalArticlesOnPage = 0;
    Object.values(pageCategories).forEach(categoryArticles => {
        totalArticlesOnPage += categoryArticles.length;
    });
    
    // Calculate article range
    const totalCategoriesShown = Object.keys(pageCategories).length;
    const startArticle = ((currentPage - 1) * categoriesPerPage) + 1;
    const endArticle = Math.min(currentPage * categoriesPerPage, Object.keys(organizedByCategory).length);
    
    paginationContainer.innerHTML = `
        <nav aria-label="Articles pagination">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Previous</a>
                </li>
                ${generatePageNumbers(currentPage, totalPages)}
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a>
                </li>
            </ul>
        </nav>
        <div class="text-center text-muted">
            Showing ${totalCategoriesShown} categories with ${totalArticlesOnPage} articles (Page ${currentPage} of ${totalPages})
        </div>
    `;
}

function generatePageNumbers(current, total) {
    let pages = '';
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
        pages += `<li class="page-item ${i === current ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
        </li>`;
    }
    
    return pages;
}

function changePage(page) {
    const { totalPages } = getPageData(1); // Get total pages
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    populateArticlesWithPagination();
    
    // Scroll to top of main content
    document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
}

function getCategoryName(catId) {
    if (!categories || categories.length === 0) return "News";
    const category = categories.find(cat => cat._id === catId);
    return category ? category.category : "News";
}

function populateHeroArticle(article) {
    const heroSection = document.getElementById("hero-article");
    const heroTitle = document.getElementById("hero-title");
    const heroExcerpt = document.getElementById("hero-excerpt");
    const heroTime = document.getElementById("hero-time");
    const heroViews = document.getElementById("hero-views");
    
    if (article?.photo) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${article.photo}')`;
    } else {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))`;
        heroSection.style.backgroundColor = '#333';
    }
    
    heroTitle.textContent = article.title;
    heroExcerpt.textContent = truncateText(article.content, 200);
    heroTime.textContent = formatTime(article.createdAt);
    heroViews.textContent = article.articleClicks || 0;
    
    heroSection.style.display = "block";
    heroSection.style.cursor = "pointer";
    heroSection.onclick = () => handleArticleClick(article);
}

function populateLeadStory(article) {
    const leadStory = document.getElementById("lead-story");
    const leadHeadline = document.getElementById("lead-headline");
    const leadExcerpt = document.getElementById("lead-excerpt");
    const leadTime = document.getElementById("lead-time");
    const leadViews = document.getElementById("lead-views");
    const imageContainer = document.getElementById("story-image-container");
    const placeholder = document.getElementById("story-image-placeholder");
    
    // Handle image
    if (article?.photo) {
        // Remove existing image if any
        const existingImg = imageContainer.querySelector('.story-image');
        if (existingImg) {
            existingImg.remove();
        }
        
        // Create and add new image
        const img = document.createElement('img');
        img.src = article.photo;
        img.alt = article.title || 'Story image';
        img.className = 'story-image';
        img.style.display = 'block';
        
        // Hide placeholder and show image
        placeholder.style.display = 'none';
        imageContainer.appendChild(img);
        
        // Handle image load error
        img.onerror = function() {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        };
    } else {
        // No image available, show placeholder
        const existingImg = imageContainer.querySelector('.story-image');
        if (existingImg) {
            existingImg.remove();
        }
        placeholder.style.display = 'flex';
    }
    
    // Populate content
    leadHeadline.textContent = article.title;
    leadExcerpt.textContent = truncateText(article.content, 300);
    leadTime.textContent = formatTime(article.createdAt);
    leadViews.textContent = article.articleClicks || 0;
    
    // Show the lead story
    leadStory.style.display = "block";
    leadStory.onclick = () => handleArticleClick(article);
}

function populateArticlesGrid(pageCategories) {
    const container = document.getElementById("articles-container");
    container.innerHTML = ''; // Clear previous content
    
    // Display each category section (limited to 5 categories with 6 articles each)
    Object.entries(pageCategories).forEach(([categoryName, categoryArticles]) => {
        if (categoryArticles.length === 0) return;
        
        const sectionHtml = createSectionHtml(categoryName, categoryArticles);
        container.innerHTML += sectionHtml;
    });
    
    // Add click handlers for all articles on the page
    Object.values(pageCategories).forEach(categoryArticles => {
        categoryArticles.forEach(article => {
            const articleElement = document.querySelector(`[data-article-id="${article._id}"]`);
            if (articleElement) {
                articleElement.onclick = () => handleArticleClick(article);
            }
        });
    });
}

function createSectionHtml(title, articles) {
    let html = `<h3 class="section-header">${title}</h3>`;
    
    if (articles.length === 1) {
        // Single article layout
        const article = articles[0];
        html += `
            <div class="story-card" data-article-id="${article._id}">
                <div class="article-images">
                    <div>
                        <img src="${article.photo || ''}" alt="Article Photo" />
                    </div>
                </div>
                <h4 class="story-headline">${article.title}</h4>
                <p class="story-excerpt">${truncateText(article.content, 200)}</p>
                <div class="story-meta">
                    <span><i class="fas fa-clock"></i> ${formatTime(article.createdAt)}</span>
                    <span><i class="fas fa-eye"></i> ${article.articleClicks || 0} views</span>
                </div>
            </div>
        `;
    } else {
        // Grid layout for multiple articles
        html += '<div class="row">';
        articles.forEach(article => {
            html += `
                <div class="col-md-6">
                    <div class="story-card" data-article-id="${article._id}">
                        <div class="article-images">
                            <div>
                                <img src="${article.photo || ''}" alt="Article Photo" />
                            </div>
                        </div>
                        <h4 class="story-headline">${article.title}</h4>
                        <p class="story-excerpt">${truncateText(article.content, 150)}</p>
                        <div class="story-meta">
                            <span><i class="fas fa-clock"></i> ${formatTime(article.createdAt)}</span>
                            <span><i class="fas fa-eye"></i> ${article.articleClicks || 0} views</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    return html;
}

function handleArticleClick(article) {
    trackArticleClick(article);
    window.location.href = `article.html?id=${article._id}`;
}

async function trackArticleClick(article) {
    try {
        await fetch(`http://localhost:5000/public/article-click/${article._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Error tracking click:", error);
    }
}

function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

function formatTime(dateString) {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
}