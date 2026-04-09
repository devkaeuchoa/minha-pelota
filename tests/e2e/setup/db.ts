import { execSync } from "node:child_process";

type SeedOptions = {
    seeder?: string;
};

function runArtisan(command: string): void {
    execSync(`php artisan ${command}`, {
        stdio: "inherit",
        env: {
            ...process.env,
            APP_ENV: process.env.APP_ENV ?? "testing",
        },
    });
}

export function resetDatabaseAndSeed(options: SeedOptions = {}): void {
    console.log(`resetDatabaseAndSeed: ${options.seeder}`);
    const seederFlag = options.seeder ? ` --seeder=${options.seeder}` : "";
    runArtisan(`migrate:fresh --seed${seederFlag}`);
}

export function seedOnly(options: SeedOptions = {}): void {
    console.log(`seedOnly: ${options.seeder}`);
    const classFlag = options.seeder ? ` --class=${options.seeder}` : "";
    runArtisan(`db:seed${classFlag}`);
}

export function resetGroupsEmptyState(): Promise<void> {
    console.log(`resetGroupsEmptyState`);
    return new Promise<void>((resolve) => {
        resetDatabaseAndSeed({
            seeder: "Database\\Seeders\\E2EGroupsEmptyStateSeeder",
        });
        resolve();
    });
}
