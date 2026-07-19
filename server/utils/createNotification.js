const Notification = require("../model/Notification");


const createNotification = async ({ type, message, product }) => {
  try {
    await Notification.create({
      type,
      message,
      product,
    });
  } catch (error) {
    console.log("Notification Error:", error.message);
  }
};

module.exports = createNotification;