const passport = require("passport");
const register = require("./register");
const login = require("./login");
const User = require("../../models/User");
const Otp = require("../../models/Otp");
const { authenticator } = require("otplib");
const nodemailer = require("nodemailer");

const Joi = require("joi");

const userRegister = (userRequest, role, res) =>
  register(userRequest, role, res);

const userLogin = (userRequest, role, res) => login(userRequest, role, res);

// Messages
const MSG = {
  userNotFound: "User information not found",
  userFound: "User information found",
  internalError: "Internal server error",
  invalidData: "Invalid request data",
};
const findByEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});
const isUserFoundByEmail = async (req, res) => {
  try {
    const { error, value } = findByEmailSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }

    const user = await User.findOne({ email: value.email });
    if (!user) {
      return res.status(404).json({ error: MSG.userNotFound });
    }
    res.status(200).json({ result: MSG.userFound });
  } catch (error) {
    res.status(500).json({ error: MSG.internalError });
  }
};

const userRefreshToken = (refreshToken, res) => refresh(refreshToken, res);

const userAuth = passport.authenticate("jwt", { session: false });

/**
 * Checks if the provided user role is included in the roles list
 * @param {Array} roles - list of accepted roles.
 * @const checkRole
 */
const checkRole = (roles) => (req, res, next) => {
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();
};

/**
 * returns json of user data.
 * @const serializeUser
 */
function serializeUser(user) {
  try {
    // Customize how you want to serialize the user data here
    return {
      id: user.email,
      username: user.username,
      email: user.email,
      // Add more user properties as needed
    };
  } catch (error) {
    console.error("Error while serializing user:", error);
    return null; // Return null in case of an error
  }
}
const sendOTPtoEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
});
const sendOTPtoEmail = async (req, res) => {
  const { error, value } = sendOTPtoEmailSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join("; ");
    return res.status(400).json({ error: errorMessage });
  }
  const secret = authenticator.generateSecret(4);

  // Set options for OTP generation
  authenticator.options = {
    digits: 4, // Set the number of digits for the OTP (e.g., 4 digits)
    algorithm: "sha1", // Use a hash-based algorithm for numeric OTPs
  };

  // Generate a time-based OTP using the generated secret
  const otp = authenticator.generate(secret);
  // Create a Nodemailer transporter

  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "contactUs.yoko@gmail.com",
      pass: "lrxn zjql brtr fufr",
    },
    secure: false, // Disable SSL/TLS certificate verification
    tls: {
      rejectUnauthorized: false, // Disable SSL/TLS certificate verification
    },
  });

  // Define the email options
  let mailOptions = {
    from: "contactUs.yoko@gmail.com",
    to: value.email,
    subject: "Your OTP Code",
    html: otpEmailTemplate(otp),
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    const expirationTimestamp = new Date(Date.now() + 1 * 1000);
    await Otp.create({
      email: value.email,
      otp,
      expiresAt: expirationTimestamp,
    });

    return res.status(200).json({ result: "OTP email sent successfully" });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: MSG.internalError });
  }
};

module.exports = {
  userAuth,
  userLogin,
  userRegister,
  checkRole,
  userRefreshToken,
  serializeUser,
  isUserFoundByEmail,
  sendOTPtoEmail,
};
// Define the email template
const otpEmailTemplate = (otp) => {
  return `
    <html>
      <head>
        <style>
          /* Add your CSS styles here */
          body {
            font-family: Arial, sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          h1 {
            color: #333;
          }
          p {
            color: #555;
          }
          .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>OTP Verification</h1>
          <p>Your OTP code is:</p>
          <div class="otp-code">${otp}</div>
          <p>Please use this code to verify your account.</p>
        </div>
      </body>
    </html>
  `;
};
