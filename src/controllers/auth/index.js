const passport = require("passport");
const register = require("./register");
const login = require("./login");
const User = require("../../models/User");
const Otp = require("../../models/Otp");
const { authenticator } = require("otplib");
const nodemailer = require("nodemailer");

const Joi = require("joi");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/tokenUtils");
const { ROLE } = require("../../config/roles");

const userRegister = (userRequest, role, res) =>
  register(userRequest, role, res);

const userLogin = (userRequest, role, res) => login(userRequest, role, res);

// Messages

const findByEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  role: Joi.string().valid("admin", "user").required().messages({
    "any.only": "Role must be either 'admin' or 'user'",
    "any.required": "Role is required",
  }),
});
const MSG = {
  userNotFound: "User information not found",
  userFound: "User information found",
  internalError: "Internal server error",
  invalidData: "Invalid request data",
  adminNotFound: "Admin information not found",
  adminFound: "Admin information found",
  internalError: "Internal server error",
  invalidData: "Invalid request data",

  AccessDenied:
    "User found, but you lack the necessary permissions. Only administrators can access this resource.",
};
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
    //if user findOne
    if (value.role === ROLE.admin) {
      //if user findOne
      if (!user) {
        // adminNOTFOUNd
        return res.status(404).json({ error: MSG.adminNotFound });
      }
      // adminFOUNd
      res.status(200).json({ result: MSG.adminFound });
    } else {
      if (!user) {
        // adminNOTFOUNd
        return res.status(404).json({ error: MSG.userNotFound });
      }
      // adminFOUNd
      if (user.role === ROLE.admin) {
        return res.status(500).json({
          result: MSG.AccessDenied,
        });
      } else {
        return res.status(200).json({ result: MSG.userFound });
      }
    }
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
const sendOTPtoEmailAdmin = async (req, res) => {
  const { error, value } = sendOTPtoEmailSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join("; ");
    return res.status(400).json({ error: errorMessage });
  }

  const secret = authenticator.generateSecret(6);

  // Set options for OTP generation
  authenticator.options = {
    digits: 6, // Set the number of digits for the OTP (e.g., 4 digits)
    algorithm: "sha1", // Use a hash-based algorithm for numeric OTPs
  };
  const admin = await User.findOne({ email: value.email });
  if (!admin) res.status(500).json({ error: "error you are not admin" });

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
const otpSchema = Joi.object({
  code: Joi.string()
    .pattern(/^\d{1,6}$/)
    .message("OTP must be a number with at most 6 digits"),
});

const verifyCodeOTP = async (req, res) => {
  try {
    const { error, value } = otpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({ error: errorMessage });
    }

    const otp = await Otp.findOne({ otp: value.code });
    if (!otp) {
      return res.status(404).json({ error: "Invalid verification code" });
    }

    let newUser;
    let retreivedUser;

    try {
      if (value.code.length == 4) {
        // Create user
        newUser = new User({
          name: "temoraryUser", // Provide a value for the name field
          username: "temoraryUser", // Provide a value for the username field
          email: otp.email,
          password: generateRandomPassword(10),
          role: ROLE.user,
          // Provide a value for the password
        });
        retreivedUser = await newUser.save();
      }
      if (value.code.length == 6) {
        retreivedUser = await User.findOne({ email: otp.email });
      }
      console.log("User created successfully:", newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle the error appropriately (e.g., return an error response to the client)
    }

    // Generate an access token and a refresh token
    const accessToken = generateAccessToken(retreivedUser); // Assuming you have a function to generate access tokens
    const refreshToken = generateRefreshToken(retreivedUser); // Assuming you have a function to generate refresh tokens

    // Create a sanitized user object for the response
    const sanitizedUser = {
      id: retreivedUser?._id,
      role: retreivedUser?.role,
      username: retreivedUser?.username,
      email: retreivedUser?.email,
      name: retreivedUser?.name,
      lastname: retreivedUser?.lastname,
      validated: retreivedUser?.validated,
      createdAt: retreivedUser?.createdAt,
      updatedAt: retreivedUser?.updatedAt,
      preferences: retreivedUser?.preferences,
    };

    return res.status(200).json({
      user: sanitizedUser,
      access_token: accessToken,
      refreshToken,
      message: "Vous avez réussi à vous connecter avec succès",
      success: true,
    });
  } catch (error) {
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
  sendOTPtoEmail,
  verifyCodeOTP,
  sendOTPtoEmailAdmin,
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
function generateRandomPassword(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
}
