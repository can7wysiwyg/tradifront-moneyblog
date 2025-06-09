document.addEventListener('DOMContentLoaded', async() => {
   const catIdFromUrl = window.location.hash.substring(1);
   const mainContent =  document.getElementById('main')

   if(catIdFromUrl) {



   } else {
        const helloword = document.createElement('h1')

        helloword.textContent = "No Search Items Related To Your Query"

        mainContent.appendChild(helloword)

   }



})