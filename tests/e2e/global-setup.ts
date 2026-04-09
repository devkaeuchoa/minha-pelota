import { resetDatabaseAndSeed } from "./setup/db";

export default async function globalSetup(): Promise<void> {
    const seeder = process.env.E2E_GLOBAL_SEEDER || undefined;
    resetDatabaseAndSeed({ seeder });
}
