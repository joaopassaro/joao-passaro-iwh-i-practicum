const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const CUSTOM_OBJECT_ID = process.env.HUBSPOT_CUSTOM_OBJECT_ID;
const PROP_NAME = process.env.HUBSPOT_PROP_NAME || "name";
const PROP_2 = process.env.HUBSPOT_PROP_2;
const PROP_3 = process.env.HUBSPOT_PROP_3;
const OBJECT_LABEL = process.env.HUBSPOT_OBJECT_LABEL || "Custom Objects";

app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const requiredEnvVars = {
  HUBSPOT_PRIVATE_APP_TOKEN: HUBSPOT_TOKEN,
  HUBSPOT_CUSTOM_OBJECT_ID: CUSTOM_OBJECT_ID,
  HUBSPOT_PROP_NAME: PROP_NAME,
  HUBSPOT_PROP_2: PROP_2,
  HUBSPOT_PROP_3: PROP_3,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const hubspotHeaders = {
  Authorization: `Bearer ${HUBSPOT_TOKEN}`,
  "Content-Type": "application/json",
};

// 1. ROTA DA HOMEPAGE
app.get("/", async (req, res) => {
  try {
    const properties = [PROP_NAME, PROP_2, PROP_3].join(",");

    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}?properties=${properties}`,
      { headers: hubspotHeaders }
    );

    res.render("homepage", {
      title: `${OBJECT_LABEL} | Integrating With HubSpot I Practicum`,
      objectLabel: OBJECT_LABEL,
      propName: PROP_NAME,
      prop2: PROP_2,
      prop3: PROP_3,
      records: response.data.results,
    });
  } catch (error) {
    console.error("Error loading HubSpot records:");
    console.error(error.response?.data || error.message);
    res.status(500).send("Error loading HubSpot custom object records.");
  }
});

// 2. ROTA GET DO FORMULÁRIO
app.get("/update-cobj", (req, res) => {
  res.render("updates", {
    title: "Update Custom Object Form | Integrating With HubSpot I Practicum",
    objectLabel: OBJECT_LABEL,
    prop2: PROP_2,
    prop3: PROP_3,
  });
});

// 3. ROTA POST DO FORMULÁRIO
app.post("/update-cobj", async (req, res) => {
  try {
    const { name, lastname, address } = req.body;

    if (!name || !lastname || !address) {
      return res.status(400).send("All form fields are required.");
    }

    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}`,
      {
        properties: {
          [PROP_NAME]: name,
          [PROP_2]: lastname,
          [PROP_3]: address,
        },
      },
      { headers: hubspotHeaders }
    );

    res.redirect("/");
  } catch (error) {
    console.error("Error creating HubSpot record:");
    console.error(error.response?.data || error.message);
    res.status(500).send("Error creating HubSpot custom object record.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});