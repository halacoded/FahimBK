const notFoundHandler = (request, response, next) => {
  try {
    return response
      .status(404)
      .json({ error: `${request.originalUrl} does not exist` });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = notFoundHandler;
