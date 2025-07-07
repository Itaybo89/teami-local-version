// backend/utils/responseSender.js
const messages = require('./messageMap');

const getMessage = (msg) => {
  if (!msg) return 'OK';
  return messages[msg] || msg; 
};

const resSuccess = (res, data = null, message = 'OK', status = 200) => {
  return res.status(status).json({
    success: true,
    message: getMessage(message),
    data,
  });
};

const resError = (res, message = 'Something went wrong', status = 500) => {
  return res.status(status).json({
    success: false,
    message: getMessage(message),
  });
};

module.exports = {
  resSuccess,
  resError,
};
