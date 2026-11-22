
const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");
const config = require("./env.config.js");

// Asegura que exista el directorio de logs (ignorado por git)
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}


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


const transportsList = [
  
  new winston.transports.Console({
    level: config.logLevel,
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