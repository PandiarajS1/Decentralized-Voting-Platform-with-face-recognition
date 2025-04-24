// utils/faceDataConverter.js
const crypto = require("crypto");

/**
 * Convert face frames to a feature vector
 * In a production system, you would use a proper face recognition library
 * like face-api.js, OpenCV, or a cloud-based solution
 *
 * @param {Array} frames - Array of face capture frames
 * @returns {Object} - Processed face data
 */
exports.convertFaceFramesToFeatures = async (frames) => {
  try {
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      throw new Error("Invalid face frames data");
    }

    // Generate a more stable feature representation
    let combinedFeatures = {
      // Using numeric arrays instead of hex strings for better comparison
      feature1: new Array(32).fill(0),
      feature2: new Array(32).fill(0),
      feature3: new Array(32).fill(0),
      feature4: new Array(32).fill(0),
    };

    // Process each frame and extract basic features
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];

      // Create a hash of the frame data
      const frameHash = crypto
        .createHash("sha256")
        .update(frame.toString())
        .digest("hex");

      // Convert hash segments to numeric arrays for mathematical operations
      const segment1 = Array.from(frameHash.substring(0, 16)).map((c) =>
        c.charCodeAt(0)
      );
      const segment2 = Array.from(frameHash.substring(16, 32)).map((c) =>
        c.charCodeAt(0)
      );
      const segment3 = Array.from(frameHash.substring(32, 48)).map((c) =>
        c.charCodeAt(0)
      );
      const segment4 = Array.from(frameHash.substring(48, 64)).map((c) =>
        c.charCodeAt(0)
      );

      // Add to the cumulative features
      for (let j = 0; j < 32 && j < segment1.length; j++) {
        combinedFeatures.feature1[j] += segment1[j] || 0;
        combinedFeatures.feature2[j] += segment2[j] || 0;
        combinedFeatures.feature3[j] += segment3[j] || 0;
        combinedFeatures.feature4[j] += segment4[j] || 0;
      }
    }

    // Normalize the features by the number of frames
    for (let j = 0; j < 32; j++) {
      combinedFeatures.feature1[j] = Math.round(
        combinedFeatures.feature1[j] / frames.length
      );
      combinedFeatures.feature2[j] = Math.round(
        combinedFeatures.feature2[j] / frames.length
      );
      combinedFeatures.feature3[j] = Math.round(
        combinedFeatures.feature3[j] / frames.length
      );
      combinedFeatures.feature4[j] = Math.round(
        combinedFeatures.feature4[j] / frames.length
      );
    }

    return {
      combinedFeatures,
      frameCount: frames.length,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error converting face frames:", error);
    throw error;
  }
};

/**
 * Map face data with Aadhar number
 *
 * @param {Object} faceData - Processed face data
 * @param {String} aadharNumber - User's Aadhar number
 * @returns {String} - Encoded face data
 */
exports.mapWithAadhar = (faceData, aadharNumber) => {
  try {
    if (!faceData || !aadharNumber) {
      throw new Error("Face data and Aadhar number are required");
    }

    // Ensure the last 4 digits are stored as a string
    const aadharSuffix = aadharNumber.slice(-4); // Extract last 4 digits properly

    // Store raw feature data as a JSON string
    const featureString = JSON.stringify(faceData.combinedFeatures || {});

    return `${featureString}:${aadharSuffix}:${faceData.frameCount}`;
  } catch (error) {
    console.error("Error mapping face data with Aadhar:", error);
    throw error;
  }
};

/**
 * Compare face data for verification
 *
 * @param {Object} loginFaceData - Processed face data from login attempt
 * @param {String} storedDataString - Stored face data from database
 * @returns {Boolean} - Whether the face matches
 */
exports.compareFaceData = async (loginFaceData, storedDataString) => {
  try {
    if (!loginFaceData || !storedDataString) {
      console.log("🔹 Missing data for comparison");
      return false;
    }

    // Extract stored components
    let featuresStr, storedAadharSuffix, frameCount;

    const firstColonIndex = storedDataString.lastIndexOf("}:"); // Find last occurrence of JSON close `}`
    if (firstColonIndex === -1) {
      console.error("🔹 Invalid stored data format: Missing JSON closing `}`");
      return false;
    }

    // Extract JSON face data properly
    featuresStr = storedDataString.substring(0, firstColonIndex + 1); // Get JSON part

    // Extract Aadhar suffix and frame count
    const remainingData = storedDataString
      .substring(firstColonIndex + 2)
      .split(":"); // Split after `}:`
    if (remainingData.length < 2) {
      console.error(
        "🔹 Error: Invalid stored data format. Expected Aadhar Suffix & Frame Count."
      );
      return false;
    }

    storedAadharSuffix = remainingData[0]; // Extract Aadhar Suffix
    frameCount = remainingData[1]; // Extract Frame Count

    // Debugging Output
    console.log("🔹 Extracted Features String:", featuresStr);
    console.log("🔹 Extracted Stored Aadhar Suffix:", storedAadharSuffix);
    console.log("🔹 Extracted Frame Count:", frameCount);

    // Validate Aadhar Suffix
    if (storedAadharSuffix.length !== 4 || isNaN(storedAadharSuffix)) {
      console.error(
        "🔹 Error: Aadhar suffix is not a valid 4-digit number!",
        storedAadharSuffix
      );
      return false;
    }

    // Ensure loginFaceData contains Aadhar number
    if (!loginFaceData.aadharNumber) {
      console.log("🔹 Login data missing Aadhar number");
      return false;
    }

    // Extract last 4 digits of Aadhar number
    const loginAadharSuffix = String(loginFaceData.aadharNumber.slice(-4));
    storedAadharSuffix = String(storedAadharSuffix); // Convert stored suffix to string if needed

    console.log("🔹 Stored Aadhar Suffix:", storedAadharSuffix);
    console.log("🔹 Login Aadhar Suffix:", loginAadharSuffix);

    // First check: Aadhar suffix should match
    if (loginAadharSuffix !== storedAadharSuffix) {
      console.log("🔹 Aadhar suffix mismatch");
      return false;
    }

    // Parse stored feature data
    let storedFeatures;
    try {
      storedFeatures = JSON.parse(featuresStr);
    } catch (e) {
      console.log("🔹 Invalid stored feature format:", e.message);
      return false;
    }

    // Get login features
    const loginFeatures = loginFaceData.combinedFeatures;

    // Ensure features are valid
    if (!storedFeatures || !loginFeatures) {
      console.log("🔹 Missing feature data");
      return false;
    }

    // Calculate feature similarity using Euclidean distance
    let totalDistance = 0;
    let maxPossibleDistance = 0;
    let featureCount = 0;

    for (const featureKey of ["feature1", "feature2", "feature3", "feature4"]) {
      if (storedFeatures[featureKey] && loginFeatures[featureKey]) {
        const storedFeatureArray = storedFeatures[featureKey];
        const loginFeatureArray = loginFeatures[featureKey];

        // Compare corresponding values
        const length = Math.min(
          storedFeatureArray.length,
          loginFeatureArray.length
        );
        for (let i = 0; i < length; i++) {
          const diff = Math.abs(storedFeatureArray[i] - loginFeatureArray[i]);
          totalDistance += Math.pow(diff, 2);
          maxPossibleDistance += Math.pow(255, 2);
          featureCount++;
        }
      }
    }

    if (featureCount === 0) {
      console.log("🔹 No feature data to compare");
      return false;
    }

    // Calculate Euclidean similarity
    totalDistance = Math.sqrt(totalDistance);
    maxPossibleDistance = Math.sqrt(maxPossibleDistance);
    const similarity = 100 - (totalDistance / maxPossibleDistance) * 100;
    const threshold = 50; // 50% similarity required

    console.log("🔹 Feature Count Compared:", featureCount);
    console.log("🔹 Total Distance:", totalDistance.toFixed(2));
    console.log("🔹 Max Possible Distance:", maxPossibleDistance.toFixed(2));
    console.log("🔹 Similarity Score:", similarity.toFixed(2));
    console.log("🔹 Required Threshold:", threshold);

    return similarity >= threshold;
  } catch (error) {
    console.error("Error comparing face data:", error);
    return false;
  }
};
