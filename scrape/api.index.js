const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "mydatabase.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
// app.get("/books/", async (request, response) => {
//   const getBooksQuery = `
//     SELECT
//       *
//     FROM
//       book
//     ORDER BY
//       book_id;`;
//   const booksArray = await db.all(getBooksQuery);
//   response.send(booksArray);
// });

// Get Scraped Data API
app.get("/scraped_data", async (req, res) => {
  try {
    const getScrapedDataQuery = `
      SELECT
        *
      FROM
        scraped_data;
    `;
    const scrapedData = await db.all(getScrapedDataQuery);
    res.json(scrapedData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Products API
app.get("/products", async (req, res) => {
  try {
    const getProductsQuery = `
      SELECT
        *
      FROM
        scraped_data;
    `;
    const products = await db.all(getProductsQuery);
    res.json(products);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
