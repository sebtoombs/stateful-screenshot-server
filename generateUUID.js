// For generation of UUIDs
const { randomBytes } = require("crypto");

/**
 * This function can generate a UUID of any size.
 * Example of UUID: "I1tx0ssVk9"
 * @param  {Number} Size of UUID
 * @return {String} UUID generated
 */
const generateUUID = (size = 10) => {
  return randomBytes(Math.ceil((size * 3) / 4))
    .toString("base64")
    .slice(0, size)
    .replace(/\+/g, "a")
    .replace(/\//g, "b");
};

module.exports = generateUUID;
