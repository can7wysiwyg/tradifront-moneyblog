      const ARTICLES_PER_LOAD = 8;
        const API_URL = "http://localhost:5000";
        
        // Track displayed articles for each subcategory
        const subcategoryState = {};

        document.addEventListener('DOMContentLoaded', async() => {
            const catIdFromUrl = window.location.hash.substring(1);
            const mainContent = document.getElementById('main');
            
            if(catIdFromUrl) {
                try {
                    const response = await fetch(`${API_URL}/public/articles-by-category/${catIdFromUrl}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if(!response.ok) {
                        throw new Error("Failed to fetch articles from category");
                    }
                    
                    const data = await response.json();
                    console.log(data);
                    
                    renderCategoryPage(data, mainContent);
                    
                } catch (error) {
                    console.log("Error fetching data:", error);
                    showError(mainContent, "Failed to load articles. Please try again later.");
                }
            } else {
                showError(mainContent, "No Search Items Related To Your Query");
            }
        });

        function renderCategoryPage(data, container) {
            container.innerHTML = '';
            
            // Category title
            const categoryTitle = document.createElement('h1');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = data.category;
            container.appendChild(categoryTitle);

            // Initialize state and render subcategories
            data.subcategories.forEach(subcategory => {
                subcategoryState[subcategory.name] = {
                    displayedCount: 0,
                    totalArticles: subcategory.totalArticles,
                    articles: subcategory.articles
                };
                
                renderSubcategory(subcategory, container);
            });
        }

        function renderSubcategory(subcategory, container) {
            const subcategorySection = document.createElement('div');
            subcategorySection.className = 'subcategory-section';
            subcategorySection.id = `subcategory-${subcategory.name}`;

            // Subcategory header
            const header = document.createElement('div');
            header.className = 'subcategory-header';
            
            const title = document.createElement('h2');
            title.className = 'subcategory-title';
            title.textContent = subcategory.name;
            
            const count = document.createElement('span');
            count.className = 'article-count';
            count.textContent = `${subcategory.totalArticles} articles`;
            
            header.appendChild(title);
            header.appendChild(count);
            subcategorySection.appendChild(header);

            // Articles container
            const articlesContainer = document.createElement('div');
            articlesContainer.className = 'articles-grid';
            articlesContainer.id = `articles-${subcategory.name}`;
            subcategorySection.appendChild(articlesContainer);

            // Load more button container
            const loadMoreContainer = document.createElement('div');
            loadMoreContainer.id = `load-more-container-${subcategory.name}`;
            subcategorySection.appendChild(loadMoreContainer);

            container.appendChild(subcategorySection);

            // Load initial articles
            loadMoreArticles(subcategory.name);
        }

        function loadMoreArticles(subcategoryName) {
            const state = subcategoryState[subcategoryName];
            const articlesContainer = document.getElementById(`articles-${subcategoryName}`);
            const loadMoreContainer = document.getElementById(`load-more-container-${subcategoryName}`);

            if (!state || !articlesContainer) return;

            // Calculate articles to show
            const startIndex = state.displayedCount;
            const endIndex = Math.min(startIndex + ARTICLES_PER_LOAD, state.articles.length);
            const articlesToShow = state.articles.slice(startIndex, endIndex);

            // If no articles to show initially
            if (startIndex === 0 && articlesToShow.length === 0) {
                const noArticlesDiv = document.createElement('div');
                noArticlesDiv.className = 'no-articles';
                noArticlesDiv.textContent = `No articles available in ${subcategoryName}`;
                articlesContainer.appendChild(noArticlesDiv);
                return;
            }

            // Render articles
            articlesToShow.forEach(article => {
                const articleCard = createArticleCard(article);
                articlesContainer.appendChild(articleCard);
            });

            // Update displayed count
            state.displayedCount = endIndex;

            // Update load more button
            updateLoadMoreButton(subcategoryName, loadMoreContainer);
        }

        function createArticleCard(article) {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            // Format date
            const date = new Date(article.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Create excerpt from content
            const excerpt = article.content ? 
                article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '') :
                'No preview available';

            card.innerHTML = `
                ${article.photo ? 
                    `<img src="${article.photo}" alt="${article.title}" class="article-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="article-image" style="display:none;">No Image Available</div>` :
                    `<div class="article-image">No Image Available</div>`
                }
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-meta">
                        <span class="article-date">${formattedDate}</span>
                        <span class="article-clicks">
                            <span>👁</span>
                            <span>${article.clicks || 0}</span>
                        </span>
                    </div>
                </div>
            `;

            // Add click handler for article
            card.addEventListener('click', () => {
                console.log('Article clicked:', article.title);
                // Navigate to article.html with article ID in hash
                window.location.href = `article.html#${article._id || article._id || ''}`;
            });

            return card;
        }

        function updateLoadMoreButton(subcategoryName, container) {
            const state = subcategoryState[subcategoryName];
            
            // Remove existing button
            const existingBtn = container.querySelector('.load-more-btn');
            if (existingBtn) {
                existingBtn.remove();
            }

            // Check if more articles are available
            if (state.displayedCount < state.articles.length) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.textContent = `Load More (${state.articles.length - state.displayedCount} remaining)`;
                
                loadMoreBtn.addEventListener('click', () => {
                    loadMoreArticles(subcategoryName);
                });
                
                container.appendChild(loadMoreBtn);
            }
        }

        function showError(container, message) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>${message}</h2>
                </div>
            `;
        }
   