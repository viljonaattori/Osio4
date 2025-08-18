const jwt = require("jsonwebtoken");

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  }
  next();
};

const userExtractor = (request, response, next) => {
  if (request.token) {
    try {
      request.user = jwt.verify(request.token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: "token invalid" });
    }
  }
  next();
};

module.exports = { tokenExtractor, userExtractor };
