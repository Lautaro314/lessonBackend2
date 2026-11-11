
const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const config = require("./env.config.js");


const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "magenta",
    warning: "yellow",
    info: "green",
    http: "cyan",
    debug: "blue",
  },
};

winston.addColors(customLevelsOptions.colors);


const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);


const currentEnv = config.mode || process.env.NODE_ENV || "development";

const transportsList = [
  
  new winston.transports.Console({
    level: currentEnv === "production" ? "info" : "debug",
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      logFormat
    ),
  }),
];


const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../../logs/error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxDays: "14d",
  level: "error", 
  format: logFormat,
});

transportsList.push(fileRotateTransport);

const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: transportsList,
});

module.exports = logger;