const express = require("express");
const tinycolor = require("tinycolor2");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

app.use(express.json());

// Standard form for session object that was used by the backend
// {
//   "pbid": "mani",
//   "tickets": 38400,
//   "effect": [],  
//   "tag": []
// }


// Function to read JSON files
const readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

// Serve bank.json
app.get("/app/bank", (req, res) => {
  const bankData = readJSONFile("bank.json");
  if (bankData) {
    res.json(bankData);
  } else {
    res.status(500).json({ error: "Failed to read bank data" });
  }
});

// Serve stats.json
app.get("/app/stats", (req, res) => {
  const statsData = readJSONFile("stats.json");
  if (statsData) {
    res.json(statsData);
  } else {
    res.status(500).json({ error: "Failed to read stats data" });
  }
});

// Helper function to format date as "YYYY-MM-DD HH:MM:SS"
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Modify the `buy` route
app.post("/app/bank/buy", express.json(), (req, res) => {
  console.log("buy attempt");
  const { pbId, itemName, price, days } = req.body;
  const bankData = readJSONFile("bank.json");

  if (!bankData[pbId] || bankData[pbId].tickets < price * days) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  if (bankData[pbId].effect) {
      return res.status(400).json({ success: false, message: "You already have an active effect." });
  }

  bankData[pbId].tickets -= price * days;
  bankData[pbId].effect = [itemName, formatDate(Date.now() + days * 86400000)];

  fs.writeFileSync("bank.json", JSON.stringify(bankData, null, 4));

  const bankDataUser = bankData[pbId];
  bankDataUser['pbid'] = pbId;

  res.json({
      success: true,
      message: `${itemName} purchased successfully!`,
      user: bankDataUser  // Send updated user data
  });
});


app.post("/app/bank/buyTag", express.json(), (req, res) => {
  const { pbId, tagName, price, days, color } = req.body;
  const bankData = readJSONFile("bank.json");

  if (!bankData[pbId] || bankData[pbId].tickets < price * days) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  if (bankData[pbId].tag) {
      return res.status(400).json({ success: false, message: "You already have an active tag." });
  }

  bankData[pbId].tickets -= price * days;

  const rgbColor = tinycolor(color).toRgb();
  const colorArr = [rgbColor.r, rgbColor.g, rgbColor.b];

  bankData[pbId].tag = [tagName, formatDate(Date.now() + days * 86400000), colorArr];

  fs.writeFileSync("bank.json", JSON.stringify(bankData, null, 4));

  const bankDataUser = bankData[pbId];
  bankDataUser['pbid'] = pbId;
  res.json({
      success: true,
      message: `Tag '${tagName}' purchased successfully!`,
      user: bankDataUser  // Send updated user data
  });
});



// Start the server
const PORT = 3002;
app.listen(PORT, () => console.log(`Mock API running on port ${PORT}`));
