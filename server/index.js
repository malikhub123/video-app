const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { AccessToken } = require("twilio").jwt;
const VideoGrant = AccessToken.VideoGrant;

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate-token", (req, res) => {
  try {
    const { identity, roomName } = req.body;

    if (!identity || !roomName) {
      return res.status(400).json({ error: "Missing identity or roomName" });
    }

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
    );

    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    res.json({ token: token.toJwt() });

  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
