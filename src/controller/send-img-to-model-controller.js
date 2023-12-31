const axios = require("axios");

const quota = require("./quotaController");

// Function for sending image_url to flask
const sendImageUrlToFlask = async (image_url) => {
  try {
    const flaskEndpoint = process.env.MODEL_ENDPOINT;

    // Send image_url to flask
    const response = await axios.post(flaskEndpoint, { image_url });

    // Get response
    const modelResponse = response.data;

    return modelResponse;
  } catch (error) {
    const modelResponse = { response: "Gagal memprediksi model", error: true };
    return modelResponse;
  }
};

// Function to proceed all data
const processData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { image_url } = req.body;

    // Check quota scan
    const isHaveQuota = await quota.checkQuota(userId);

    if (!isHaveQuota) {
      return res.status(403).send({ error: "Quota exceeded" });
    }

    // Send image_url to function
    const responseFlask = await sendImageUrlToFlask(image_url);
    if (responseFlask.error) {
      return res.send({ modelResponse: responseFlask });
      // Reduced quota after successfull scanning
    } else {
      const result = await quota.reduceQuota(userId);
      const { user, token } = result;
      res.send({ user, token, modelResponse: responseFlask });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { processData };
