import { database } from "./db";
import fs from "fs";

export function saveDbSnapshot() {
  try {
    const snapshot = JSON.stringify(
      database,
      (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }

        if (value instanceof Map) {
          return {
            __type: "Map",
            value: Array.from(value.entries()),
          };
        }

        return value;
      },
      2,
    );

    fs.writeFileSync(`${process.cwd()}/db.log`, snapshot, "utf8");
  } catch (err) {
    console.error("Snapshot failed:", err);
  }
}
