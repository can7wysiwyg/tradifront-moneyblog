   
        const NewsTemplate = {
            // Update hero article
            updateHeroArticle: function(data) {
                if (data.image) {
                    document.getElementById('hero-article').style.backgroundImage = 
                        `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${data.image}')`;
                }
                if (data.title) document.getElementById('hero-title').textContent = data.title;
                if (data.excerpt) document.getElementById('hero-excerpt').textContent = data.excerpt;
                if (data.author) document.getElementById('hero-author').textContent = data.author;
                if (data.time) document.getElementById('hero-time').textContent = data.time;
                if (data.views) document.getElementById('hero-views').textContent = data.views.toLocaleString();
            },

            // Update lead story
            updateLeadStory: function(data) {
                const leadStory = document.getElementById('lead-story');
                if (data.image) {
                    const placeholder = leadStory.querySelector('.story-image-placeholder');
                    placeholder.innerHTML = `<img src="${data.image}" alt="Lead story" class="lead-story-image">`;
                }
                if (data.headline) document.getElementById('lead-headline').textContent = data.headline;
                if (data.excerpt) document.getElementById('lead-excerpt').textContent = data.excerpt;
                if (data.author) document.getElementById('lead-author').textContent = data.author;
                if (data.time) document.getElementById('lead-time').textContent = data.time;
            },

            // Update any story card
            updateStoryCard: function(storyId, data) {
                const card = document.querySelector(`[data-story-id="${storyId}"]`);
                if (!card) return;

                if (data.image) {
                    const placeholder = card.querySelector('.story-image-placeholder');
                    if (placeholder) {
                        placeholder.innerHTML = `<img src="${data.image}" alt="Story image" class="article-image">`;
                    }
                }

                Object.keys(data).forEach(field => {
                    const element = card.querySelector(`[data-field="${field}"]`);
                    if (element && data[field]) {
                        element.textContent = data[field];
                    }
                });
            },

            // Add new story to a section
            addStoryToSection: function(sectionId, storyData) {
                const section = document.getElementById(sectionId);
                if (!section) return;

                const storyHtml = `
                    <div class="col-md-6">
                        <div class="story-card" data-story-id="${storyData.id}">
                            <div class="story-image-placeholder">
                                ${storyData.image ? 
                                    `<img src="${storyData.image}" alt="Story image" class="article-image">` :
                                    `<div><i class="fas fa-image fa-2x mb-2"></i><br>Story Image<br><small>400x200px</small></div>`
                                }
                            </div>
                            <h4 class="story-headline" data-field="headline">${storyData.headline || 'Headline'}</h4>
                            <p class="story-excerpt" data-field="excerpt">${storyData.excerpt || 'Story excerpt...'}</p>
                            <div class="story-meta">
                                <span><i class="fas fa-map-marker-alt"></i> <span data-field="location">${storyData.location || 'Location'}</span></span>
                                <span><i class="fas fa-clock"></i> <span data-field="time">${storyData.time || 'Time'}</span></span>
                            </div>
                        </div>
                    </div>
                `;
                
                section.insertAdjacentHTML('beforeend', storyHtml);
            },

            // Update trending sidebar
            updateTrending: function(trendingArray) {
                const trendingContainer = document.querySelector('.sidebar .trending-item').parentNode;
                trendingContainer.innerHTML = '<h5><i class="fas fa-fire"></i> Trending Now</h5>';
                
                trendingArray.forEach(item => {
                    const trendingItem = document.createElement('div');
                    trendingItem.className = 'trending-item';
                    trendingItem.textContent = item.title || item;
                    if (item.url) {
                        trendingItem.style.cursor = 'pointer';
                        trendingItem.onclick = () => window.open(item.url, '_blank');
                    }
                    trendingContainer.appendChild(trendingItem);
                });
            }
        };

        // Example API integration functions
        function loadNewsData() {
            // Example: Update hero article with API data
            // NewsTemplate.updateHeroArticle({
            //     title: "Breaking: Major Discovery Announced",
            //     excerpt: "Scientists reveal groundbreaking findings...",
            //     author: "Dr. Jane Smith",
            //     time: "Just now",
            //     views: 15420,
            //     image: "https://example.com/hero-image.jpg"
            // });

            // Example: Update story cards
            // NewsTemplate.updateStoryCard('world-1', {
            //     headline: "Updated World News Headline",
            //     excerpt: "Updated story content from API...",
            //     location: "New York",
            //     time: "1 hour ago",
            //     image: "https://example.com/world-news.jpg"
            // });
        }

        document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the news template
            loadNewsData();
            
            // Smooth scroll for navigation links
            document.querySelectorAll('.navbar-nav .nav-link[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Update active nav item
                        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                            link.classList.remove('active');
                        });
                        this.classList.add('active');
                    }
                });
            });

            // Add click effects to story cards
            document.querySelectorAll('.story-card, .trending-item').forEach(card => {
                card.addEventListener('click', function() {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });

            // Newsletter subscription feedback
            document.querySelector('.btn-danger').addEventListener('click', function() {
                const input = this.previousElementSibling;
                if (input.value.includes('@')) {
                    this.textContent = 'Subscribed!';
                    this.classList.remove('btn-danger');
                    this.classList.add('btn-success');
                    input.value = '';
                    setTimeout(() => {
                        this.textContent = 'Subscribe';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-danger');
                    }, 2000);
                } else {
                    this.textContent = 'Invalid Email';
                    this.classList.add('btn-warning');
                    setTimeout(() => {
                        this.textContent = 'Subscribe';
                        this.classList.remove('btn-warning');
                    }, 2000);
                }
            });
        }); cards
            document.querySelectorAll('.story-card, .trending-item').forEach(card => {
                card.addEventListener('click', function() {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });

            // Newsletter subscription feedback
            document.querySelector('.btn-danger').addEventListener('click', function() {
                const input = this.previousElementSibling;
                if (input.value.includes('@')) {
                    this.textContent = 'Subscribed!';
                    this.classList.remove('btn-danger');
                    this.classList.add('btn-success');
                    input.value = '';
                    setTimeout(() => {
                        this.textContent = 'Subscribe';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-danger');
                    }, 2000);
                } else {
                    this.textContent = 'Invalid Email';
                    this.classList.add('btn-warning');
                    setTimeout(() => {
                        this.textContent = 'Subscribe';
                        this.classList.remove('btn-warning');
                    }, 2000);
                }
            });
        });
 