document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'c7d34ec778ef41aeb61394234a9651e5';
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('input');
  const recipeList = document.getElementById('recipe-list');
  const favLink = document.getElementById('fav-link');
  const historyLink = document.getElementById('his-link');
  const favContent = document.getElementById('fav-content');
  const historyContent = document.getElementById('history-content');
  const doughnutSection = document.querySelector('.doughnut');
  const openFilterBtn = document.getElementById('openFilterBtn');
  const filterModal = document.getElementById('filterModal');
  const closeBtn = document.getElementsByClassName('closeBtn')[0];
  const detailedView = document.getElementById('detailed-view');
  const detailedInfo = document.getElementById('detailed-info');
  const backButton = document.getElementById('back-button');
  const loadingScreen = document.getElementById('loading-screen');

  let isLoading = false;

  const fetchData = async (query) => {
    try {
      showLoadingScreen();
      const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      saveSearchHistory(query); 
      renderData(data.results);
      console.log(data.results);
      //console.log(data);
    } catch (error) {
      if(error === 402){
        alert("API error");
      }
      console.error('Error fetching data:', error);
    }finally {
      hideLoadingScreen();
    }
  };

  const renderData = async (recipes) => {
      recipeList.innerHTML = '';

      if (recipes.length === 0) {
        recipeList.innerHTML = '<p>No recipes found.</p>';
      }

    for (const recipe of recipes) {
      window.recipeItem = document.createElement('div');
      const recipeName = document.createElement('h2');
      const recipeImage = document.createElement('img');
      const div = document.createElement('div');

      const fav = document.createElement('img');
      const favBtn = document.createElement('button');
      window.infoDiv = document.createElement('div');

      favBtn.id = ''

      fav.classList.add('fav');
      
      infoDiv.classList.add('infoDiv');
      div.classList.add('fav-contanier');
      recipeItem.classList.add('recipe-item');
      recipeName.classList.add('recipe-name');
      recipeImage.classList.add('recipe-image');
      
      fav.src = 'Assets/heart-icon.png';
      recipeName.textContent = recipe.title;
      recipeImage.src = recipe.image;
      recipeImage.alt = recipe.title;

      favBtn.appendChild(fav);
      div.appendChild(recipeName);
      div.appendChild(favBtn);
      recipeItem.appendChild(div);
      
      //recipeItem.appendChild(recipeImage);
      infoDiv.appendChild(recipeImage);
      recipeList.appendChild(recipeItem);

      favBtn.addEventListener('click', () => {
        toggleFavorite(recipe);
        fav.classList.toggle('red');
      });

      recipeItem.addEventListener('click', () => {
        showDetailedView(recipe);
      });

      if (isFavorite(recipe)) {
        fav.classList.add('favorite');
        fav.classList.toggle('red');
      }
      await fetchRecipeInformation(recipe.id);
    }
  };


  const showDetailedView = async (recipe) => {
    const recipeInfo = await fetchRecipeInformation(recipe.id);
    detailedInfo.innerHTML = `
      <h3>${recipeInfo.title}</h3>
      <img src=${recipeInfo.image}>
      <p><strong>Servings:</strong> ${recipeInfo.servings}</p>
      <p><strong>Ready in minutes:</strong> ${recipeInfo.readyInMinutes}</p>
      <p><strong>Health score:</strong> ${recipeInfo.healthScore}</p>
      <p><strong>Spoonacular score:</strong> ${recipeInfo.spoonacularScore}</p>
      <h4>Ingredients:</h4>
      <ul class="ingredients-list">
        ${recipeInfo.extendedIngredients ? recipeInfo.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('') : '<li>No ingredients available</li>'}
      </ul>
      <h4>Instructions:</h4>
      <p>${recipeInfo.instructions || 'No instructions available'}</p>
      <p><strong>Source:</strong> <a href="${recipeInfo.sourceUrl}" target="_blank">${recipeInfo.sourceName}</a></p>
    `;
    recipeList.style.display = 'none';
    detailedView.style.display = 'block';
  };

  const fetchRecipeInformation = async (recipeId) => {
    try {
      const infoURl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
      const response = await fetch(infoURl);
      const recipeInfo = await response.json();
      console.log("Recipe Info:" + recipeInfo);

      const detailedInfo = document.createElement('div');
      

      detailedInfo.innerHTML = `
        <p><strong>Servings:</strong> ${recipeInfo.servings}</p>
        <p><strong>Ready in minutes:</strong> ${recipeInfo.readyInMinutes}</p>
        <p><strong>Health score:</strong> ${recipeInfo.healthScore}</p>
        <p><strong>Spoonacular score:</strong> ${parseFloat(recipeInfo.spoonacularScore.toFixed(2))}</p>
      `;


      infoDiv.appendChild(detailedInfo);
      recipeItem.appendChild(infoDiv);


    } catch (error) {
      console.error('Error fetching recipe information:', error);
    }
  };

  const toggleFavorite = (recipe) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (isFavorite(recipe)) {
      favorites = favorites.filter(fav => fav.id !== recipe.id);
    } else {
      favorites.push(recipe);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
  };


  const isFavorite = (recipe) => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.id === recipe.id);
  };

  const saveSearchHistory = (query) => {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(query)) {
      searchHistory.push(query);
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  };

  const renderSearchHistory = () => {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyContent.innerHTML = '';
    if (searchHistory.length === 0) {
      historyContent.innerHTML = '<p>No search history found.</p>';
      return;
    }
    const historyList = document.createElement('ul');
    searchHistory.forEach(query => {
      const historyItem = document.createElement('li');
      historyItem.textContent = query;
      historyItem.addEventListener('click', () => {
        searchInput.value = query;
        fetchData(query);
      });
      historyList.appendChild(historyItem);
    });
    historyContent.appendChild(historyList);
  };

  const renderFavorites = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      favContent.innerHTML = '';
      if (favorites.length === 0) {
        favContent.innerHTML = '<p>No favorite recipes found.</p>';
        return;
      }
    favorites.forEach(recipe => {
      const recipeItem = document.createElement('div');
      const recipeName = document.createElement('h2');
      const recipeImage = document.createElement('img');
      const div = document.createElement('div');

      const remove = document.createElement('img');
      const removeBtn = document.createElement('button');



      remove.src = '/Assets/trash.png';
      remove.classList.add('remove-img')
      div.classList.add('rm');
      recipeItem.classList.add('recipe-item');
      recipeName.classList.add('recipe-name');
      recipeImage.classList.add('recipe-image');
          
      recipeName.textContent = recipe.title;
      recipeImage.src = recipe.image;
      recipeImage.alt = recipe.title;

      removeBtn.appendChild(remove);
      div.appendChild(recipeName);
      div.appendChild(removeBtn);
      recipeItem.appendChild(div);
      recipeItem.appendChild(recipeImage);
      favContent.appendChild(recipeItem);

      removeBtn.addEventListener('click', () =>{
        toggleFavorite(recipe);
      });

      recipeItem.addEventListener('click', () => {
        showDetailedView(recipe);
      });
    });
  };

  const showLoadingScreen = () => {
    loadingScreen.style.display = 'block';
    isLoading = true;
  };

  const hideLoadingScreen = () => {
    loadingScreen.style.display = 'none';
    isLoading = false;
  };

  const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedFetchData = debounce(fetchData, 500);

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    if (isLoading) return;
    const query = searchInput.value.trim();
    if (query !== '') {
      debouncedFetchData(query);
    }
  });

  if (favLink) {
    favLink.addEventListener('click', (event) => {
      event.preventDefault();
      historyContent.style.display = 'none';
      favContent.style.display = 'block';
      recipeList.innerHTML = '';
      doughnutSection.style.display = 'none';
    });
  }

  if (historyLink) {
    historyLink.addEventListener('click', (event) => {
      event.preventDefault();
      favContent.style.display = 'none';
      historyContent.style.display = 'block';
      doughnutSection.style.display = 'none';
      recipeList.innerHTML = '';
      renderSearchHistory();
    });
  }

  openFilterBtn.onclick = function () {
    filterModal.style.display = "block";
    console.log("open filter");
  };

  closeBtn.onclick = function () {
    filterModal.style.display = "none";
  };
  renderFavorites();
});

