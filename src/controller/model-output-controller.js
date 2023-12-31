const { db } = require("../db/firestore");

const storeModelOutput = async (req, res) => {
  try {
    //Get image url and food name from request body
    const {
      image_url,
      food_name,
      calcium,
      carbohydrates,
      emission,
      fat,
      protein,
      vitamins,
    } = req.body;

    //Verified user by token
    const userId = req.user.userId;

    //Stored all information to firebase
    const docRef = db.collection("model-output").doc();
    await docRef.set({
      userId: userId,
      image_url: image_url,
      food_name: food_name,
      emission: emission,
      calcium: calcium,
      carbohydrates: carbohydrates,
      fat: fat,
      protein: protein,
      vitamins: vitamins,
    });

    //Set up variabel for response
    const data = {
      userId,
      image_url,
      food_name,
      emission,
      calcium,
      carbohydrates,
      fat,
      protein,
      vitamins,
      dataId: docRef.id, // Include the ID in the response
    };

    res.status(200).json({ data, message: "data has been stored" });
  } catch (error) {
    // console.log(error);
    res.status(500).send("error");
  }
};

const getOutputInfo = async (req, res) => {
  try {
    const userId = req.user.userId;

    const collectionRef = db.collection("model-output");
    const snapshot = await collectionRef.where("userId", "==", userId).get();

    if (!snapshot.empty) {
      const dataArray = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.dataId = doc.id; // Include the id in the data object
        dataArray.push(data);
      });
      res.status(200).send(dataArray);
    } else {
      // console.log('No matching documents.');
      res.status(400).send("No Matching Documents");
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send("Error");
  }
};

const getSpecificOutput = async (req, res) => {
  try {
    // Get articleId from request parameters
    const { id: dataId } = req.params;

    //Access collection
    const articleRef = db.collection("model-output");

    // Query db by document ID (articleId from request)
    const snapshot = await articleRef.doc(dataId).get();

    //Handle if title is not found
    if (snapshot.empty) {
      console.log("No matching documents.");
      return;
    }

    // Get data and send it
    const data = snapshot.data();
    data.id = snapshot.id; // Include the id in the data object

    res.status(200).send(data);
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  storeModelOutput,
  getOutputInfo,
  getSpecificOutput,
};
