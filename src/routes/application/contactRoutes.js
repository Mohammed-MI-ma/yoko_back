const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// Import contact controller
const contactController = require("../../controllers/contactUs");
const { userAuth, checkRole } = require("../../controllers/auth");
const { ROLE } = require("../../config/roles");

// Define rate limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiting middleware only to the GET /contact endpoint
router.get("/", limiter, contactController.getContactInfo);

// Route to handle retrieving contact information
/**
 * @swagger
 *   /api/application/contact-application/:
 *   get:
 *     summary: Get contact information
 *     description: Retrieve contact information.
 *     tags:
 *       - Contact info
 *     responses:
 *       '200':
 *         description: A single contact information object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactInfo'
 *       '500':
 *         description: Internal server error
 */
router.get("/", contactController.getContactInfo);
/**
 * @swagger
 * components:
 *   schemas:
 *     ContactInfoInput:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         address:
 *           type: string
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *             twitter:
 *               type: string
 *             linkedin:
 *               type: string
 *             instagram:
 *               type: string
 *         operatingHours:
 *           type: string
 *         contactForm:
 *           type: boolean
 *         mapEmbed:
 *           type: string
 *         additionalContacts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *         faqs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *         privacyPolicyLink:
 *           type: string
 *         languagesSupported:
 *           type: array
 *           items:
 *             type: string
 *         accessibilityInfo:
 *           type: string
 */
/**
 * @swagger
 * /api/application/contact-application/:
 *   post:
 *     summary: Update or create contact information
 *     description: Update or create contact information.
 *     tags:
 *       - Contact info
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInfoInput'
 *     responses:
 *       '200':
 *         description: Contact information updated or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactInfoInput'
 *       '500':
 *         description: Internal server error
 */
router.post(
  "/",
  userAuth,
  checkRole([ROLE.admin]),
  contactController.updateContactInfo
);

module.exports = router;
