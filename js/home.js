document.addEventListener("DOMContentLoaded", async () => {
 
  const API_URL = "http://localhost:5000";

    const catId = localStorage.getItem("catId");
  const subCatId = localStorage.getItem("subCatId");
  const keywordParams = JSON.parse(localStorage.getItem("keyword"));


  if(catId && subCatId && keywordParams) {

    // second vist articles are articles that are shown to the users after
    //they have visited the site and we have an idea of their prefered articles

    const keyword = keywordParams
    .map((k) => `keywordParams=${encodeURIComponent(k)}`)
    .join("&");

  const secondVisitArticles = await fetch(
    `${API_URL}/public/articles-by-clicked?catId=${catId}&subCatId=${subCatId}&${keyword}`,
    {method: "GET", headers: {"Content-Type": "application/json"}}
  );

  if(!secondVisitArticles.ok) {
    console.log("Error fetching second visit articles")
  }

  const secondVisitArticlesData = await secondVisitArticles.json()

  let randomSecondVistArticles =
    secondVisitArticlesData.articles[Math.floor(secondVisitArticlesData.articles.length * Math.random())];





  } else {

      // first visit articles are articles that are shown to the user normally on their first visit
  const firstVistArticles = await fetch(`${API_URL}/public/show-articles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!firstVistArticles.ok) {
    console.log("Error fetching articles");
  }

  const firstVist = await firstVistArticles.json();

  let randomFirstVistArticles =
    firstVist.articles[Math.floor(firstVist.articles.length * Math.random())];

    




  }






});
