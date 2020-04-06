// zomato key: 8b90d48db5e94a1006c3296e641d4078
class ZOMATO {
   constructor() {
      this.api = "8b90d48db5e94a1006c3296e641d4078";
      this.header = {
         method: 'GET',
         headers: {
            'user-key': this.api,
            'Content-Type': 'application/json'
         },
         credentials: 'same-origin'
      };
   }
   async searchAPI(city, categoryID) {
      // category url
      const categoryUrl = `https://developers.zomato.com/api/v2.1/categories`;
      // city url
      const cityUrl = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;
      // search category
      const categoryInfo = await fetch(categoryUrl, this.header);
      const categoryJSON = await categoryInfo.json();
      const categories = await categoryJSON.categories;
      // search city
      const cityInfo = await fetch(cityUrl, this.header);
      const cityJSON = await cityInfo.json();
      const cityLocation = await cityJSON.location_suggestions;

      let cityID = 0;
      if (cityLocation.length > 0) {
         cityID = await cityLocation[0].id;
      }

      // search restaurants
      const restaurantUrl = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}&entity_type=city&category=${categoryID}&sort=rating`;

      const restaurantInfo = await fetch(restaurantUrl, this.header);
      const restaurantJSON = await restaurantInfo.json();
      const restaurants = await restaurantJSON.restaurants;

      return {
         categories,
         cityID,
         restaurants
      }
   }
}
class UI {
   constructor() {
      this.loader = document.querySelector('.loader');
      this.restaurantsList = document.getElementById('restaurant-list');
   }
   addSelectOptions(categories) {
      const search = document.getElementById('searchCategory');
      let output = `<option value='0' selected>Select Category</option>`;
      categories.forEach(category => {
         output += `<option value="${category.categories.id}">${category.categories.name}</option>`;
      })
      search.innerHTML = output;
   }
   showFeedback(text) {
      const feedback = document.querySelector('.feedback');
      feedback.classList.add('showItem');
      feedback.innerHTML = `<p>${text}</p>`;
      setTimeout(() => {
         feedback.classList.remove('showItem');
      }, 3000);
   }
   showLoader() {
      this.loader.classList.add('showItem');
   }
   hideLoader() {
      setTimeout(() => {
         this.loader.classList.remove('showItem')
      }, 3000)
   }
}

(function () {

   const searchForm = document.getElementById('searchForm');
   const searchCity = document.getElementById('searchCity');
   const searchCategory = document.getElementById('searchCategory');

   const zomato = new ZOMATO();
   const ui = new UI();

   // add select options
   document.addEventListener('DOMContentLoaded', () => {
      // logic goes here
      zomato.searchAPI().then(data => ui.addSelectOptions(data.categories));
   })
   // submit form
   searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const city = searchCity.value.toLowerCase();
      const categoryID = parseInt(searchCategory.value);
      // console.log(city, categoryID);

      if (city === '' || categoryID === 0) {
         ui.showFeedback('Please enter a city and select category');
      }
      else {
         // Logic goes here
         zomato.searchAPI(city).then(cityData => {
            if (cityData.cityID === 0) {
               ui.showFeedback('Please enter a valid city');
            } else {
               ui.showLoader();
               ui.hideLoader();
               zomato.searchAPI(city, categoryID).then(data => {
                  ui.getRestaurants(data.restaurants);
               });
            }
         });

      }
   })
})();