//funcion para inicializar la aplicacion
import { startLogger } from "./logger.ts";
import { dbConnect, dbReadConfigData } from "./db.ts";

export async function initWebApp() {
  // Initialize the application, e.g., connect to the database
  startLogger();
  await dbConnect();
  await dbReadConfigData();
}
