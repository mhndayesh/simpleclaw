import axios from 'axios'; function getPrice(productName) {   const url = `https:www.amazon.com/s?k=${productName}`;   axios.get(url)     .then(response => {       console.log(response.data); // Modified the line to print the response data instead of trying to access properties of undefined
      const products = response.data.results;
      for (let i = 0; i < products.length; i++) {
        if (products[i].salesRank <= 100000 && products[i].categories[1] === 'Electronics') {
          return products[i].price;
        }
      }
    })
    .catch(error => console.error(error));
} const productName = process.argv[2]; getPrice(productName);