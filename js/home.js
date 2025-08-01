
let currentPage = 1;
const categoriesPerPage = 5;
const articlesPerCategory = 6;
const totalArticlesPerPage = categoriesPerPage * articlesPerCategory; 
let allArticles = [];
let categories = [];
let organizedByCategory = {};
 const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
   
    
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const mainContent = document.getElementById("main-content");
    
    try {
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
        
               const firstVisitArticles = await fetch(`${API_URL}/public/show-articles`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            
            if (!firstVisitArticles.ok) {
                throw new Error("Failed to fetch first visit articles");
            }
            
            const firstVisitData = await firstVisitArticles.json();
            const allFirstVisitArticles = firstVisitData.articles || [];
            
            // Articles are already shuffled from backend, no need to shuffle again
            articles = allFirstVisitArticles;
        
        
        if (articles.length === 0) {
            throw new Error("No articles found");
        }
        
        allArticles = articles;
        organizedByCategory = organizeArticlesByCategory(articles);
        
        loading.style.display = "none";
        mainContent.style.display = "block";
        
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
    
    
     Object.keys(organizedSections).forEach(category => {
//         // organizedSections[category] = shuffleArray(organizedSections[category]);
//         // For now, keeping the backend shuffle order

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
    
    const startCategoryIndex = (pageNumber - 1) * categoriesPerPage;
    const endCategoryIndex = Math.min(startCategoryIndex + categoriesPerPage, totalCategories);
    
    const pageCategories = {};
    
    for (let i = startCategoryIndex; i < endCategoryIndex; i++) {
        const categoryName = categoryNames[i];
        const categoryArticles = organizedByCategory[categoryName];
        
        pageCategories[categoryName] = categoryArticles.slice(0, articlesPerCategory);
    }
    
    return { categories: pageCategories, totalPages };
}

function populateArticlesWithPagination() {
    const { categories: pageCategories, totalPages } = getPageData(currentPage);
    
    let allPageArticles = [];
    Object.values(pageCategories).forEach(categoryArticles => {
        allPageArticles.push(...categoryArticles);
    });
    
    const featuredArticles = allArticles.filter(article => 
        article.featured === true || article.mainArticle === true
    );
    
    let heroArticle = null;
    
    if (featuredArticles.length > 0) {
        const randomIndex = Math.floor(Math.random() * featuredArticles.length);
        heroArticle = featuredArticles[randomIndex];
    } else {
        heroArticle = allPageArticles.find(article => article.mainArticle === true);
    }
    
    if (heroArticle) {
        populateHeroArticle(heroArticle);
        
        Object.keys(pageCategories).forEach(categoryName => {
            pageCategories[categoryName] = pageCategories[categoryName].filter(
                article => article._id !== heroArticle._id
            );
        });
    }
    
    
    populateArticlesGrid(pageCategories);
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
    
    const { categories: pageCategories } = getPageData(currentPage);
    let totalArticlesOnPage = 0;
    Object.values(pageCategories).forEach(categoryArticles => {
        totalArticlesOnPage += categoryArticles.length;
    });
    
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
    const { totalPages } = getPageData(1); 
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    populateArticlesWithPagination();
    
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
    // const heroExcerpt = document.getElementById("hero-excerpt");
    const heroTime = document.getElementById("hero-time");
    const heroViews = document.getElementById("hero-views");
    
    if (article?.photo) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${article.photo}')`;
    } else {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))`;
        heroSection.style.backgroundColor = '#333';
    }
    
    heroTitle.textContent = article.title;
//   heroExcerpt.textContent =  truncateText(article.content, 200);
    heroTime.textContent = formatTime(article.createdAt);
    heroViews.textContent = article.articleClicks || 0;
    
    heroSection.style.display = "block";
    heroSection.style.cursor = "pointer";
    heroSection.onclick = () => handleArticleClick(article);
}

function populateArticlesGrid(pageCategories) {
    const container = document.getElementById("articles-container");
    container.innerHTML = ''; 
    
    Object.entries(pageCategories).forEach(([categoryName, categoryArticles]) => {
        if (categoryArticles.length === 0) return;
        
        const sectionHtml = createSectionHtml(categoryName, categoryArticles);
        container.innerHTML += sectionHtml;
    });
    
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
        const article = articles[0];
        html += `
            <div class="article-card" data-article-id="${article._id}">
                        <div>
                            <div>
                                <img src="${article.photo || ''}" alt="Article Photo" class="card-image" />
                            </div>
                        </div>
                        <div class="card-content">
                        <h6 class="card-title">${article.title}</h6>
                        
                        <div class="story-meta">
                            <span><i class="fas fa-clock"></i> ${formatTime(article.createdAt)}</span>
                            
                        </div>

                        </div>
                    </div>

        `;
    } else {
        html += '<div class="row">';
        articles.forEach(article => {
            html += `
            <div class="col-md-6">
                    <div class="article-card" data-article-id="${article._id}">
                        <div>
                            <div>
                                <img src="${article.photo || ''}" alt="Article Photo" class="card-image" />
                            </div>
                        </div>
                        <div class="card-content">
                        <h6 class="card-title">${article.title}</h6>
                        
                        <div class="story-meta">
                            <span><i class="fas fa-clock"></i> ${formatTime(article.createdAt)}</span>
                            <span><i class="fas fa-eye"></i> ${article.articleClicks || 0} views</span>
                        </div>

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
    window.location.href = `article.html#${article._id}`;
}

async function trackArticleClick(article) {
    try {
        await fetch(`${API_URL}/public/article-click/${article._id}`, {
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


