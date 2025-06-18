document.addEventListener('DOMContentLoaded', async() => {
    const API_URL = 'https://nodeapi-moneyblog.onrender.com';
    const navitems = document.getElementById('navitems');

    async function NewsCats() {
        try {
            const response = await fetch(`${API_URL}/public/categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log("Error fetching categories");
                return;
            }

            const categories = await response.json();

            if (categories.length > 0) {
                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.classList.add('nav-item');
                    
                    li.onclick = () => {
                        
                        window.location.href = `categoricalnews.html#${category._id}`;
                    };

                    li.innerHTML = `
                        <p class="nav-link">
                            <i class="fas fa-newspaper"></i> ${category?.category}
                        </p>
                    `;

                    navitems.appendChild(li);
                });
            }
            
        } catch (error) {
            console.log("There was an error fetching the news categories:", error.message);
        }
    }

    NewsCats();
});