// description: Append a message to saved_data/log.txt
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const message = args[0] ?? "";

if (!message) {
  console.error("No message provided.");
  process.exit(1);
}

// Ensure the directory exists
const logDir = path.resolve("saved_data");
fs.mkdirSync(logDir, { recursive: true });

const logPath = path.join(logDir, "log.txt");

// Append the message with a newline
try {
  fs.appendFileSync(logPath, message + "\n", "utf8");
  console.log(`Appended to ${logPath}`);
} catch (err) {
  console.error("Failed to write to log file:", err);
  process.exit(1);
}
