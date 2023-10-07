const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3000;

let scrapedData = []; // Create an array to store scraped data

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      'https://www.flipkart.com/search?sid=tyy%2F4io&sort=recency_desc&ctx=eyJjYXJkQ29udGV4dCI6eyJhdHRyaWJ1dGVzIjp7InRpdGxlIjp7Im11bHRpVmFsdWVkQXR0cmlidXRlIjp7ImtleSI6InRpdGxlIiwiaW5mZXJlbmNlVHlwZSI6IlRJVExFIiwidmFsdWVzIjpbIkxhdGVzdCBTYW1zdW5nIG1vYmlsZXMgIl0sInZhbHVlVHlwZSI6Ik1VTFRJX1ZBTFVFRCJ9fX19fQ%3D%3D&wid=1.productCard.PMU_V2_1&p%5B%5D=facets.discount_range_v1%255B%255D%3D30%2525%2Bor%2Bmore&p%5B%5D=facets.discount_range_v1%255B%255D%3D50%2525%2Bor%2Bmore&p%5B%5D=facets.discount_range_v1%255B%255D%3D40%2525%2Bor%2Bmore&p%5B%5D=facets.brand%255B%255D%3DSAMSUNG'
    );

    // Wait for the product titles, prices, discounts, descriptions, and images to load (you can adjust the selectors and wait time as needed)
    await page.waitForSelector('._4rR01T', { visible: true });
    await page.waitForSelector('._30jeq3', { visible: true });
    await page.waitForSelector('._3Ay6Sb', { visible: true });
    await page.waitForSelector('._396cs4', { visible: true });

    // Extract product information and image URLs and store them in an array of objects
    const products = await page.evaluate(() => {
      const titleElements = document.querySelectorAll('._4rR01T');
      const priceElements = document.querySelectorAll('._30jeq3');
      const discountElements = document.querySelectorAll('._3Ay6Sb');
      const descriptionElements = document.querySelectorAll('._1fQZEK');
      const imageElements = document.querySelectorAll('._396cs4');

      const productInfo = [];

      for (let i = 0; i < titleElements.length; i++) {
        const id = i + 1; // Generate a unique ID
        const title = titleElements[i].textContent.trim();
        const price = priceElements[i].textContent.trim();
        const discount = discountElements[i].textContent.trim();
        const description = descriptionElements[i].textContent.trim();
        const imageUrl = imageElements[i].getAttribute('src');

        productInfo.push({
          id,
          title,
          price,
          discount,
          description,
          imageUrl,
        });
      }

      return productInfo;
    });

    // Download and save images
    for (const product of products) {
      if (product.imageUrl) {
        const response = await axios.get(product.imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const filename = `product_${product.id}.jpg`; // You can customize the filename as needed
        fs.writeFileSync(filename, buffer);
      }
    }

    // Add the scraped data to the array
    scrapedData = scrapedData.concat(products);

    // Print the array of product information
    console.log('Product Information:', scrapedData);

    await browser.close();

    // Return scraped data as JSON response
    res.json(products);

    // Optionally, save the data to a JSON file
    fs.writeFileSync('scraped_data.json', JSON.stringify(scrapedData, null, 2));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});