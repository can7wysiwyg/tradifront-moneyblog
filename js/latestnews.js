const latesto = document.getElementById('latest-stories')

document.addEventListener('DOMContentLoaded', async() => {
    const API_URL = "https://nodeapi-moneyblog.onrender.com"


    try {

        const response = await fetch(`${API_URL}/public/latest-articles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if(!response.ok) {
            console.log("failed to fetch trending news")
        }

        const latestArticles = await response.json()

        


    

        if(latestArticles.latestArticles.length > 0) {

             latestArticles.latestArticles.forEach(article => {
                const div = document.createElement('div')
                div.classList.add('trending-item')
                div.onclick = () => {
                        
                        window.location.href = `article.html#${article._id}`;
                    };

                    div.innerHTML = `
                    ${article?.title}
                    `

                                 latesto.appendChild(div)




             })



        } else {

             const div = document.createElement('div')
        div.classList.add('trending-item')

        div.innerHTML = `
        No Trending News Available
        `

        latesto.appendChild(div)


        }

        
    } catch (error) {

        console.log("Error fetching data:", error)

       
        
    }

})