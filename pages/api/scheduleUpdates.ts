import cron from "node-cron";
import { updatePlayers } from "./updatePlayers";

// Schedule the updatePlayers to run at 5 AM CET time
cron.schedule(
  "0 5 * * *",
  () => {
    console.log("Running a daily task to update player data");
    updatePlayers();
  },
  {
    scheduled: true,
    timezone: "Europe/Germany",
  }
);

// Schedule more frequent checks for injuries every 30 minutes
cron.schedule("*/30 * * * *", () => {
  console.log("Running a half-hourly check for player injuries");
  updatePlayers();
});
