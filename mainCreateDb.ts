import * as db from "./utils/db.ts";
import { startLogger } from "./utils/logger.ts";

startLogger();
await db.dbConnect();
//await db.setUsers();
await db.setInfraFamilies();
await db.setInfraInstances();
await db.setDatabaseInstances();
await db.dbDisconnect();
