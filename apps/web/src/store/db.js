import Dexie from "dexie";

export const db = new Dexie("CaresyncDB");

db.version(1).stores({
  patientsCache: "_id, uhid, name, phone, updatedAt", // Server-side patients cached for offline access
  pendingPatients: "++id, name, phone, gender, createdAt, syncStatus", // Pending registrations
});

export const initOfflineDB = async () => {
  try {
    await db.open();
    console.log("Caresync offline database initialized");
  } catch (err) {
    console.error("Error opening offline database", err);
  }
};
