function errorLogger(err, req, res, next) {
  console.error("Error Logger:", err.message);
  next(err);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    res.status(500).send({ success: false, message: "Server Error" });
  } else {
    res.status(statusCode).send({ error: err.message });
  }
}

const invalidPathHandler = (request, response) => {
  response.status(404).send({ message: "Route does not exist" });
};

module.exports = {
  errorHandler,
  errorLogger,
  invalidPathHandler,
};
