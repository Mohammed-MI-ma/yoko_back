const i18n = require("i18n");
const Redis = require("ioredis");
const zlib = require("zlib");
const redis = new Redis();

const Image = require("../models/Image");

// Function to create a new Image
exports.createImage = async (req, res) => {
  try {
    console.log("Uploaded file:", req.user);

    // Create a new Image document with the necessary fields
    const newImage = new Image({
      url: req.file.path, // Set the URL of the image based on the file path
      size: req.file.size,
      name: req.file.originalname,
    });

    // Save the new image document to the database
    const savedImage = await newImage.save();

    // Respond with the saved image data
    res.status(201).json(savedImage);
  } catch (error) {
    console.error("Error creating image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Function to get Images by Keyword
exports.getImagesByKeyword = async (req, res) => {
  try {
    const keyword = req.params.keyword; // Correctly retrieves the value from the URL

    // Check cache for compressed images
    const compressedImagesData = await redis.getBuffer(keyword);

    if (compressedImagesData) {
      // If compressed images found in cache, decompress and return them
      const images = compressedImagesData.map((imageData) =>
        zlib.inflateSync(imageData)
      );
      res.set("Content-Type", "application/json"); // Set the appropriate content type
      return res.status(200).json({
        success: true,
        message: "Images found",
        images: images,
      });
    }

    // Query the database to find Images with the specified keyword
    const images = await Image.find({ keyword });

    if (images.length === 0) {
      const lang = req.headers["accept-language"] || "fr"; // Get the language specified by the frontend
      const message =
        i18n.__({ phrase: "noImageWithFound", locale: lang }) ||
        "Aucune image trouvée avec le mot-clé fourni";

      return res.status(200).json({
        success: true,
        message: message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Image trouvée avec le mot-clé fourni",
      images: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const imageData = await getImage(id);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
