const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const otpGenerator = require('otp-generator');

const app = express();
app.use(cors())
app.use(bodyParser.json());

let otpStore = {};

app.post('/generate-otp', (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    const otp = otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    });

    const expiresAt = Date.now() + 2 * 60 * 1000; 
    otpStore[phoneNumber] = { otp, expiresAt };

    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
});


app.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    const storedData = otpStore[phoneNumber];
    if (!storedData) {
        return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (Date.now() > storedData.expiresAt) {
        delete otpStore[phoneNumber];
        return res.status(400).json({ message: "OTP expired" });
    }

    if (storedData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[phoneNumber];
    res.json({ message: "OTP verified successfully" });
});

app.listen(5000, () => {
    console.log("OTP API running on port 5000");
});
