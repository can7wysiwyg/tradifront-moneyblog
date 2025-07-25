        document.addEventListener('DOMContentLoaded', async() => {
            const API_URL = 'https://nodeapi-moneyblog.onrender.com';
            const main = document.getElementById('main');
            const loading = document.getElementById('loading');
            
            const articleIdFromUrl = window.location.hash.substring(1);
           const articleUrl = window.location.href 

            if(!articleIdFromUrl) {
                main.innerHTML = '<div class="error">No article ID provided in URL</div>';
                return;
            }

            try {
                // Fetch article data
                const response = await fetch(`${API_URL}/public/article-single/${articleIdFromUrl}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if(!response.ok) {
                    throw new Error('Failed to fetch article');
                }

                const data = await response.json();
                

                if(!data.success) {
                    throw new Error(data.msg || 'Failed to load article');
                }

                // Remove loading
                loading.remove();

                // Render the page
                renderArticlePage(data);

            } catch (error) {
                console.error('Error fetching article:', error);
                main.innerHTML = `<div class="error">Error loading article: ${error.message}</div>`;
            }
        });

        function renderArticlePage(data) {
            const { article, relatedArticles, categoryArticles } = data;
            const main = document.getElementById('main');

            

            setTimeout(() => {
                 localStorage.setItem("catId", article.catId._id);
                 localStorage.setItem("subCatId", article.subCatId);
                localStorage.setItem("keyword", JSON.stringify(article.articleKeywords || []));
                

            }, 600)

        

            const html = `
                <!-- Article Header -->
                <div class="article-header">
                    <div class="container">
                        <h1 class="article-title">${escapeHtml(article.title)}</h1>
                        <div class="article-meta">
                            <span class="category-badge">${escapeHtml(article.catId?.category || 'Uncategorized')}</span>
                            ${article.subCatId ? `<span class="subcategory-badge">${escapeHtml(article.subCatId.name || '')}</span>` : ''}
                            <div class="article-clicks">
                                <svg class="eye-icon" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                                ${article.articleClicks || 0} views
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="container">
                    <div class="main-content">
                        <article class="article-content">
                            ${article.photo ? `<img src="${article.photo}" alt="${escapeHtml(article.title)}" class="article-image">` : ''}
                            <div class="blog-content" >

                                 ${article.content} 
                                
                            </div>
                        </article>

                        
                        
                        <aside class="sidebar">
                            <!-- Could add sidebar content here in the future -->
                        </aside>
                    </div>
                </div>

                <div class="share-section">
             <i class="bi bi-share-fill me-2"></i>   <h2> Share Article </h2>
                <hr class="my-4">
                            <div class="container">
                <div class="share-container">
                    <div class="share-header">
                        <i class="bi bi-share-fill share-icon"></i>
                        <h3 class="share-title">Share This Article</h3>
                    </div>
                    <div class="share-buttons">
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="share-btn facebook-btn">
                            <i class="bi bi-facebook"></i>
                            <span>Facebook</span>
                        </a>
                        
                        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="share-btn twitter-btn">
                            <i class="bi bi-twitter-x"></i>
                            <span>X</span>
                        </a>
                        
                        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - ' + window.location.href)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="share-btn whatsapp-btn">
                            <i class="bi bi-whatsapp"></i>
                            <span>WhatsApp</span>
                        </a>
                        
                                            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="share-btn linkedin-btn">
                            <i class="bi bi-linkedin"></i>
                            <span>LinkedIn</span>
                        </a>

                        <a href="https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}" 
   target="_blank" 
   rel="noopener noreferrer" 
   class="share-btn reddit-btn">
    <i class="bi bi-reddit"></i>
    <span>Reddit</span>
</a>


<a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(article.photo)}&description=${encodeURIComponent(article.title)}" 
   target="_blank" 
   rel="noopener noreferrer" 
   class="share-btn pinterest-btn">
    <i class="bi bi-pinterest"></i>
    <span>Pinterest</span>
</a>


                        
                    </div>
                </div>
            </div>


              

                </div>

                <!-- Related Articles -->
                ${relatedArticles && relatedArticles.length > 0 ? `
                <section class="related-section">
                    <div class="container">
                        <h2 class="section-title">Related Articles</h2>
                        <div class="articles-grid">
                            ${relatedArticles.map(article => createArticleCard(article)).join('')}
                        </div>
                    </div>
                </section>
                ` : ''}

                <!-- Category Articles -->
                ${categoryArticles && categoryArticles.length > 0 ? `
                <section class="related-section">
                    <div class="container">
                        <h2 class="section-title">More from ${escapeHtml(article.catId?.category || 'This Category')}</h2>
                        <div class="articles-grid">
                            ${categoryArticles.map(article => createArticleCard(article)).join('')}
                        </div>
                    </div>
                </section>
                ` : ''}

                
            `;

            main.innerHTML = html;

            // Add click handlers for article cards
            addCardClickHandlers();
        }

        function createArticleCard(article) {
            return `
                <div class="article-card" data-article-id="${article._id}">
                    ${article.photo ? `<img src="${article.photo}" alt="${escapeHtml(article.title)}" class="card-image">` : ''}
                    <div class="card-content">
                        <h3 class="card-title">${escapeHtml(article.title)}</h3>
                        <div class="card-meta">
                            <span class="card-category">${escapeHtml(article.catId?.category || 'Uncategorized')}</span>
                            <div class="card-clicks">
                                <svg class="eye-icon" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                                ${article.articleClicks || 0}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function addCardClickHandlers() {
            const cards = document.querySelectorAll('.article-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const articleId = card.dataset.articleId;
                    if (articleId) {
                        window.location.hash = articleId;
                        window.location.reload(); // Reload to show the new article
                    }
                });
            });
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function formatContent(content) {
            if (!content) return '<p>No content available.</p>';
            
            // Split content by newlines and wrap in paragraphs
            const paragraphs = content.split('\n').filter(p => p.trim());
            return paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
        }


       