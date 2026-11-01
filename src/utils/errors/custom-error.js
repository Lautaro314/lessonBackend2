class CustomError extends Error {
  constructor({ status = 500, message }) {
    super(message);
    this.status = status;
    this.statusString = status >= 500 ? "error" : "fail";
  }
}

module.exports = CustomError;