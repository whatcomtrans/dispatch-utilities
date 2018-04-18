import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

let transports = [
  new winston.transports.Console({
    level: "info",
    timestamp: true,
    colorize: true,
  }),
];

if (process.env.NODE_ENV === "production") {
  const logFileDirectory = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logFileDirectory)) {
    fs.mkdirSync(logFileDirectory);
  }

  transports.push(
    new winston.transports.DailyRotateFile({
      level: "info",
      filename: "winston-log-%DATE%.txt",
      dirname: logFileDirectory,
      maxSize: "1mb",
      maxFiles: "14",
      timestamp: () => new Date(),
    })
  );
}

const logger = new winston.Logger({
  transports,
});

export default logger;
