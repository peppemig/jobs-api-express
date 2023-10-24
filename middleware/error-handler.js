const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
  // check if error already has a status code (coming from our custom errors)
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  };

  //if (err instanceof CustomAPIError) {
  //  return res.status(err.statusCode).json({ msg: err.message });
  //}

  // handle possible mongo errors

  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "CastError") {
    customError.msg = `No item found for id: ${err.value}`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
};

module.exports = errorHandlerMiddleware;
