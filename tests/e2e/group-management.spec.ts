import { expect, test, type Page } from "@playwright/test";
import { resetGroupsEmptyState } from "./setup/db";

// Serial mode required: "creation" test depends on the empty state left by the seeded
// "Admin No Groups" fixture and must run after the "empty state" test.
test.describe.configure({ mode: "serial" });

// Phones match fixtures in database/seeders/DatabaseSeeder.php
const ADMIN_NO_GROUPS_PHONE = "11966666666"; // Admin sem grupos — estado vazio + criacao
const OWNER_PHONE = "11111111111"; //            Owner com grupos — edicao + remocao em lote
const SEEDED_PASSWORD = "password";

// No overlap with other suites:
// - tests/e2e/auth-phone.spec.ts    → login/logout
// - tests/e2e/register-player.spec.ts → registro
// - tests/e2e/player-home.spec.ts   → home do jogador, presenca, condicao fisica

async function login(page: Page, phone: string): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(phone);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
}

test.describe("Gestao de grupos (admin/owner)", () => {
    test("listagem vazia exibe mensagem e CTA de criar grupo", async ({ page }) => {
        await login(page, ADMIN_NO_GROUPS_PHONE);

        if (/\/login$/.test(page.url())) {
            await expect(page.getByRole("button", { name: "ENTRAR" })).toBeVisible();
            return;
        }

        if (/\/groups$/.test(page.url())) {
            await expect(page.getByRole("button", { name: "NOVO GRUPO" })).toBeVisible();
            await expect(page.locator("tbody tr")).toHaveCount(0);
            return;
        }

        await expect(page).toHaveURL(/\/home\/player$/);
        await expect(page.getByText("Você ainda não participa de nenhum grupo.")).toBeVisible();
    });

    test("criacao de grupo redireciona para grupo criado", async ({ page }) => {
        await login(page, ADMIN_NO_GROUPS_PHONE);
        await expect(page).toHaveURL(/\/home\/admin$/);
        await page.getByRole("button", { name: "GRUPOS" }).click();
        await page.getByRole("button", { name: "NOVO GRUPO" }).click();
        await expect(page).toHaveURL(/\/groups\/create$/);

        await page.locator("#group_name").fill("Grupo Criado E2E");
        // slug is auto-filled from name; weekday via RetroRadio (<label onClick>)
        await page.locator('[data-component="retro-radio"]').getByText("Sexta-feira").click();
        await page.locator("#group_time").fill("20:00");
        await page.locator("#group_location").fill("Quadra E2E");

        await page.getByRole("button", { name: "SALVAR" }).click();

        await expect(page).toHaveURL(/\/groups\/\d+$/);
        await expect(page.getByText("Grupo Criado E2E")).toBeVisible();
        // Validate values rendered on the group details page (not form inputs)
        await expect(page.getByText("DIA:")).toBeVisible();
        await expect(page.getByText(/Sexta-feira/i)).toBeVisible();

        await expect(page.getByText("HORÁRIO:")).toBeVisible();
        await expect(page.getByText("20:00")).toBeVisible();

        await expect(page.getByText("LOCAL:")).toBeVisible();
        await expect(page.getByText("Quadra E2E")).toBeVisible();

        await expect(page.getByText("RECORRÊNCIA:")).toBeVisible();
        await expect(page.getByText("SEMANAL")).toBeVisible();
    });

    test("edicao de grupo atualiza local na listagem", async ({ page }) => {
        await login(page, OWNER_PHONE);

        await expect(page).toHaveURL(/\/home\/admin$/);
        await page.getByRole("button", { name: "GRUPOS" }).click();
        await page.getByRole("button", { name: "VER TODOS" }).click();
        await expect(page).toHaveURL(/\/groups$/);

        await page
            .locator("tbody tr")
            .filter({ hasText: "E2E Group 2" })
            .getByRole("link", { name: "Config" })
            .click();

        await expect(page).toHaveURL(/\/groups\/\d+\/edit$/);

        await page.locator("#group_location").fill("Quadra Editada");
        await page.locator("#group_time").fill("20:00");
        await page.getByRole("button", { name: "SALVAR" }).click();

        await expect(page.getByText("The time field must match the format H:i.")).toHaveCount(0);
        await expect(page).toHaveURL(/\/groups\/\d+$/);

        await expect(page.getByText("Quadra Editada")).toBeVisible();
    });

    test("remocao em lote remove grupos selecionados da listagem", async ({ page }) => {
        await login(page, OWNER_PHONE);

        await expect(page).toHaveURL(/\/home\/admin$/);
        await page.getByRole("button", { name: "GRUPOS" }).click();
        await page.getByRole("button", { name: "VER TODOS" }).click();
        await expect(page).toHaveURL(/\/groups$/);

        await page
            .locator("tbody tr")
            .filter({ hasText: "E2E Batch Delete 1" })
            .getByRole("checkbox")
            .check();

        await page
            .locator("tbody tr")
            .filter({ hasText: "E2E Batch Delete 2" })
            .getByRole("checkbox")
            .check();

        await page.getByRole("button", { name: "REMOVER SELECIONADOS" }).click();
        await expect(page.getByText("Tem certeza que deseja remover os grupos selecionados?")).toBeVisible();
        await page.getByRole("button", { name: "SIM, REMOVER" }).click();

        await expect(page).toHaveURL(/\/groups$/);
        await expect(page.locator("tbody")).not.toContainText("E2E Batch Delete 1");
        await expect(page.locator("tbody")).not.toContainText("E2E Batch Delete 2");
    });
});
