import { expect, test, type Page } from "@playwright/test";

const SEEDED_PASSWORD = "password";
const PLAYER_WITHOUT_GROUP_PHONE = "11999999999";
const PLAYER_WITH_GROUP_PHONE = "11977777777";

async function login(page: Page, phone: string, password = SEEDED_PASSWORD): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(phone);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "ENTRAR" }).click();
    await expect(page).toHaveURL(/\/home\/player$/);
}

test.describe("Home do jogador", () => {
    test("jogador sem grupo visualiza mensagem de vazio", async ({ page }) => {
        await login(page, PLAYER_WITHOUT_GROUP_PHONE);

        await expect(page.getByText("Você ainda não participa de nenhum grupo.")).toBeVisible();
        await expect(page.getByRole("button", { name: "CONFIRMAR" })).toHaveCount(0);
    });

    test("jogador com grupo e proxima partida visualiza dados da partida", async ({ page }) => {
        await login(page, PLAYER_WITH_GROUP_PHONE);

        await expect(page.getByText("E2E Group")).toBeVisible();
        await expect(page.getByText("Arena E2E")).toBeVisible();
        await expect(page.getByText("PENDENTE")).toBeVisible();
    });

    test("atualiza presenca rapida com confirmar, talvez e desconfirmar", async ({ page }) => {
        await login(page, PLAYER_WITH_GROUP_PHONE);

        await page.getByRole("button", { name: "CONFIRMAR", exact: true }).click();
        await expect(page.getByText("CONFIRMADA")).toBeVisible();

        await page.getByRole("button", { name: "TALVEZ" }).click();
        await expect(page.getByText("TALVEZ")).toBeVisible();

        await page.getByRole("button", { name: "DESCONFIRMAR" }).click();
        await expect(page.getByText("DESCONFIRMADA")).toBeVisible();
    });

    test("atualiza condicao fisica para machucado", async ({ page }) => {
        await login(page, PLAYER_WITH_GROUP_PHONE);

        await page.getByRole("button", { name: "MACHUCADO" }).click();
        await expect(page.getByText("[MACHUCADO]")).toBeVisible();
    });
});
