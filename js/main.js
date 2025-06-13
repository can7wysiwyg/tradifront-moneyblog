document.addEventListener('DOMContentLoaded', async() => {
    const API_URL = 'http://localhost:5000'
const navitems = document.getElementById('navitems')


async function NewsCats(params) {

    try {

        const response = await fetch(`${API_URL}/public/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if(!response.ok) {
            console.log("Error fetching categories")
        }

        const categories = await response.json()

        if(categories.length > 0) {
            categories.forEach(category => {
                const li = document.createElement('li')
                li.classList.add('nav-item')
                li.onclick = () => {
                    window.location.href = `categoricalnews.html#${category._id}`
                    // window.location.reload()
                }

                li.innerHTML = `
                <p class="nav-link" > <i class="fas fa-newspaper"></i> ${category?.category} </p>
                
                `

                navitems.appendChild(li)
            })
        }
        
    } catch (error) {
        console.log("There was an error fetching the news categories:", error.message)
    }
    


}

NewsCats()






})