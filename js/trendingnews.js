const trendo = document.getElementById('trending-items')

document.addEventListener('DOMContentLoaded', async() => {
    const API_URL = "https://nodeapi-moneyblog.onrender.com"


    try {

        const response = await fetch(`${API_URL}/public/trending-news`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if(!response.ok) {
            console.log("failed to fetch trending news")
        }

        const trendingArticles = await response.json()

        


    

        if(trendingArticles.trendingArticles.length > 0) {

             trendingArticles.trendingArticles.forEach(article => {
                const div = document.createElement('div')
                div.classList.add('trending-item')
                div.onclick = () => {
                        
                        window.location.href = `article.html#${article._id}`;
                    };

                    div.innerHTML = `
                    ${article?.title}
                    `

                                 trendo.appendChild(div)




             })



        } else {

             const div = document.createElement('div')
        div.classList.add('trending-item')

        div.innerHTML = `
        No Trending News Available
        `

        trendo.appendChild(div)


        }

        
    } catch (error) {

        console.log("Error fetching data:", error)

       
        
    }

})