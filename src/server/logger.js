import winston from "winston";
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
  const logFileDirectory = path.join(__dirname, "/logs");
  if (!fs.existsSync(logFileDirectory)) {
    fs.mkdirSync(logFileDirectory);
  }

  transports.push(
    new winston.transports.File({
      level: "error",
      colorize: true,
      filename: path.join(logFileDirectory, "log.txt"),
    })
  );
}

const logger = new winston.Logger({
  transports,
});

export default logger;
