import { expect, test, type Page } from "@playwright/test";

const SEEDED_PASSWORD = "password";
const TEST_PLAYER_PHONE = "11999999999";
const GROUPED_PLAYER_PHONE = "11977777777";
const OWNER_PHONE = "11111111111";

async function login(page: Page, phone: string): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(phone);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
}

test.describe("Navegacao jogador vs admin", () => {
    test("jogador sem is_admin cai em home do jogador e nao acessa groups", async ({ page }) => {
        await login(page, TEST_PLAYER_PHONE);

        await expect(page).toHaveURL(/\/home\/player$/);
        await expect(page.getByRole("heading", { name: "HOME DO JOGADOR" })).toBeVisible();

        await expect(page.getByRole("button", { name: "GRUPOS" })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "DATAS" })).toHaveCount(0);

        const blocked = await page.goto("/groups");
        expect(blocked?.status()).toBe(403);
    });

    test("membro de grupo sem is_admin tambem cai em home do jogador", async ({ page }) => {
        await login(page, GROUPED_PLAYER_PHONE);
        await expect(page).toHaveURL(/\/home\/player$/);
        await expect(page.getByRole("heading", { name: "HOME DO JOGADOR" })).toBeVisible();
    });

    test("jogador com is_admin cai na home do admin apos login", async ({ page }) => {
        await login(page, OWNER_PHONE);
        await expect(page).toHaveURL(/\/home\/admin$/);
        await expect(page.getByRole("heading", { name: "HOME DO ADMIN" })).toBeVisible();
    });

    test("admin navega entre home do jogador e grupos com menus distintos", async ({ page }) => {
        await login(page, OWNER_PHONE);
        await expect(page).toHaveURL(/\/home\/admin$/);
        await expect(page.getByRole("heading", { name: "HOME DO ADMIN" })).toBeVisible();

        await page.goto("/home/player");
        await expect(page).toHaveURL(/\/home\/player$/);
        await expect(page.getByRole("heading", { name: "HOME DO JOGADOR" })).toBeVisible();

        await expect(page.getByRole("button", { name: "GRUPOS" })).toBeVisible();
        await page.getByRole("button", { name: "GRUPOS" }).click();
        await expect(page).toHaveURL(/\/groups$/);
        await expect(page.getByRole("heading", { name: "1. GRUPOS" })).toBeVisible();
    });

    test("home do admin exibe resumo basico", async ({ page }) => {
        await login(page, OWNER_PHONE);

        await expect(page).toHaveURL(/\/home\/admin$/);
        await expect(page.getByRole("heading", { name: "HOME DO ADMIN" })).toBeVisible();
        await expect(page.getByText("GRUPOS QUE VOCÊ É DONO")).toBeVisible();
        await expect(page.getByText("ÚLTIMA PARTIDA")).toBeVisible();
        await expect(page.getByText("PRÓXIMA PARTIDA")).toBeVisible();
        await expect(page.getByText("QUADRO DE AVISOS")).toBeVisible();
        await expect(page.getByText("BEM-VINDO! AQUI ESTÁ UM RESUMO RÁPIDO DA SUA GESTÃO.")).toBeVisible();
    });
});
