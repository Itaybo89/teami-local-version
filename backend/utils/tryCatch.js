// backend/utils/tryCatch.js
const { resError, resSuccess } = require('./responseSender');
const { extractErrorMessage } = require('./errorHandler');

const tryCatch = async (res, fn, successMessage = null) => {
  try {
    const data = await fn();
    if (res.headersSent) return; 
    if (successMessage) {
      return resSuccess(res, data, successMessage);
    }
    return res.json(data);
  } catch (err) {
    if (res.headersSent) return; 
    const message = extractErrorMessage(err);
    return resError(res, message);
  }
};

module.exports = tryCatch;
