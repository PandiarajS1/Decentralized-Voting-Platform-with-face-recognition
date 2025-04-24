// services/smsService.js
// This is a placeholder for your actual SMS implementation
// You'll need to sign up for an SMS gateway provider like Twilio, Nexmo, etc.

// Example with Twilio (you'd need to install twilio package)
// const twilio = require('twilio');

// Configure with your credentials
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOTP = async (phoneNumber, otp) => {
  try {
    // Ensure phone number is in E.164 format
    const formattedNumber = formatPhoneNumber(phoneNumber);

    // For now, just log the OTP (for development)
    console.log(`Sending OTP ${otp} to ${formattedNumber}`);

    // When ready to implement with actual SMS provider:
    /*
      const message = await client.messages.create({
        body: `Your verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });
      return {
        success: true,
        messageId: message.sid
      };
      */

    return {
      success: true,
      messageId: "dev-mode",
    };
  } catch (error) {
    console.error("SMS sending error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to format phone numbers to E.164 standard
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let digits = phoneNumber.replace(/\D/g, "");

  // Add country code if missing (assuming India +91 for example)
  if (digits.length === 10) {
    digits = "91" + digits;
  }

  // Add + prefix
  return "+" + digits;
};

// Send general SMS
exports.sendSMS = async (phoneNumber, message) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    // For development
    console.log(`Sending SMS to ${formattedNumber}: ${message}`);

    // Actual implementation
    /*
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });
      return {
        success: true,
        messageId: response.sid
      };
      */

    return {
      success: true,
      messageId: "dev-mode",
    };
  } catch (error) {
    console.error("SMS sending error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
