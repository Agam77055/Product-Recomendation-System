const express = require("express");
const cors = require("cors");
const products = require("./dataset/MOCK_DATA.json"); // Update path if necessary
const { exec } = require("child_process");
const path = require('path');
const { stdout, stderr } = require("process");
const { log } = require("console");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Endpoint to get product IDs (you can customize this as needed)
app.get("/api/product-ids", (req, res) => {
  // Return an array of product keys (or IDs)
  const productIds = [1, 2, 3, 4, 100];
  res.json(productIds);
});

// Endpoint to get products based on provided IDs
app.get("/api/products", (req, res) => {
  const ids = req.query.ids.split(",").map(Number); // Convert IDs from query string to an array of numbers
  const filteredProducts = ids
    .map(id => products.find(product => product.key === id)) // Find products in the same order as `ids`
    .filter(product => product !== undefined); // Filter out any undefined entries in case of missing ids
  
  res.json(filteredProducts);
});

app.post('/recommend', (req, res) => {
  console.log("Received request body:", req.body); // Log the entire request body

  const user = req.body.user; // Access userId
  console.log(`User ID: ${user}`); // Log the user ID received

  if (!user) {
      return res.status(400).json({ error: 'userId is required' });
  }

  // Execute the C++ program with the user ID as an argument
  const cppExecutable = path.join(__dirname, 'cpp_algorithms', 'user_recommend.exe');
  console.log(`"${cppExecutable}" ${user}`);
  
  exec(`"${cppExecutable}" ${user}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error executing C++ program: ${error.message}`);
          return res.status(500).json({ error: 'Failed to get recommendations' });
      }
      console.log("executed");
      
      if (stderr) {
          console.error(`stderr: ${stderr}`);
          return res.status(500).json({ error: 'Error in C++ program' });
      }

      // Parse the JSON output from C++ and send it as the response
      try {
          const result = JSON.parse(stdout);
          console.log(result);
          res.json(result);
      } catch (parseError) {
          console.error(`Failed to parse JSON output: ${parseError.message}`);
          res.status(500).json({ error: 'Failed to parse recommendations' });
      }
  });
});

app.post('/trending', (req, res) => {
  console.log(req.body);

  const category = req.body.category || "toys";  // Only taking category now
  const cppExecutable = path.join(__dirname, `cpp_algorithms`, `trending.exe`);
  console.log(`${cppExecutable} "${category}"`);  // Updated command to only use category
  
  // Execute the C++ program with just the category argument
  exec(`"${cppExecutable}" "${category}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing C++ program: ${error.message}`);
      return res.status(500).json({ error: 'Failed to get recommendations' });
    }
    console.log("executed");

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error in C++ program' });
    }

    try {
      const result = JSON.parse(stdout);
      console.log(result);
      res.json(result);
    } catch (parseError) {
      console.error(`Failed to parse JSON output: ${parseError.message}`);
      res.status(500).json({ error: 'Failed to parse recommendations' });
    }
  });  
});

app.post('/fav_category', (req, res) => {
  const userId = req.body.user;  // assuming req.body contains { user: "97" }

  const cppExecutable = path.join(__dirname, 'cpp_algorithms', 'fav_category.exe');
  const command = `"${cppExecutable}" ${userId}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`Error executing C++ program: ${error.message}`);
      return res.status(500).json({ error: 'Failed to get recommendations' });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error in C++ program' });
    }

    try {
      const result = JSON.parse(stdout);
      console.log(result);
      res.json(result);
    } catch (parseError) {
      console.error(`Failed to parse JSON output: ${parseError.message}`);
      res.status(500).json({ error: 'Failed to parse recommendations' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
