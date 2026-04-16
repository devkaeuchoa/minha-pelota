import { expect, test, type Page } from "@playwright/test";

const OWNER_PHONE = "11111111111";
const GROUPED_PLAYER_PHONE = "11977777777";
const SEEDED_PASSWORD = "password";

async function login(page: Page, phone: string): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(phone);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
}

async function loginOwner(page: Page): Promise<void> {
    await login(page, OWNER_PHONE);
    await expect(page).toHaveURL(/\/home\/admin$/);
    await page.goto("/groups");
    await expect(page).toHaveURL(/\/groups$/);
}

async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "LOG OUT" }).click();
    await expect(page).toHaveURL(/\/login$/);
}

function summaryValue(page: Page, label: string) {
    return page
        .locator('[data-component="retro-value-display"]')
        .filter({ has: page.getByText(label, { exact: true }) })
        .locator("span.tracking-widest");
}

test.describe("Pagamentos por partida", () => {
    test("atalho na listagem abre tela com colunas e apenas confirmados", async ({ page }) => {
        await loginOwner(page);

        const shortcut = page.getByRole("link", { name: "PAGAMENTOS ÚLTIMA PARTIDA" });
        await expect(shortcut).toBeVisible();
        await shortcut.click();

        await expect(page).toHaveURL(/\/groups\/\d+\/matches\/\d+\/payments$/);
        await expect(page.getByRole("heading", { name: "PAGAMENTOS DA PARTIDA" })).toBeVisible();

        await expect(page.getByText("PARTIDA", { exact: true })).toBeVisible();
        await expect(page.getByText("LOCAL", { exact: true })).toBeVisible();
        await expect(page.getByText("Arena Pagamentos E2E").first()).toBeVisible();

        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "JOGADOR" }),
        ).toBeVisible();
        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "DÍVIDA ANTERIOR" }),
        ).toBeVisible();
        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "STATUS" }),
        ).toBeVisible();
        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "VALOR A PAGAR (R$)" }),
        ).toBeVisible();
        const monthlyExemptHeader = page.locator('[data-component="retro-table-header-cell"]', {
            hasText: "ISENTO MENSALIDADE",
        });
        const poolApplyButton = page.getByRole("button", { name: "APLICAR PARA TODOS" });
        if (await poolApplyButton.isVisible().catch(() => false)) {
            await expect(monthlyExemptHeader).toHaveCount(0);
        } else {
            await expect(monthlyExemptHeader).toBeVisible();
        }
        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "AÇÃO" }),
        ).toBeVisible();

        await expect(page.locator("tbody tr")).toHaveCount(1);
        await expect(page.locator("tbody tr").first()).toContainText("Grouped Player");
        await expect(page.locator("tbody tr").first()).toContainText("grouped-player");
        await expect(
            page.locator('[data-component="retro-table-row"]', { hasText: "Test Player" }),
        ).toHaveCount(0);
    });

    test("atualizar pagamento reflete nos contadores pagos e nao pagos", async ({ page }) => {
        await loginOwner(page);
        await page.getByRole("link", { name: "PAGAMENTOS ÚLTIMA PARTIDA" }).click();
        await expect(page).toHaveURL(/\/groups\/\d+\/matches\/\d+\/payments$/);

        const unpaid = summaryValue(page, "NÃO PAGOS");
        const paid = summaryValue(page, "PAGOS");
        await expect(unpaid).toHaveText("1");
        await expect(paid).toHaveText("0");

        const row = page.locator("tbody tr").filter({ hasText: "Grouped Player" });
        await row.locator("select").selectOption("paid");
        await row.getByRole("button", { name: "SALVAR" }).click();

        await expect(page.getByText("Pagamento atualizado com sucesso.")).toBeVisible();
        await expect(paid).toHaveText("1");
        await expect(unpaid).toHaveText("0");
    });

    test("membro nao owner recebe 403 ao acessar pagamentos", async ({ page }) => {
        await loginOwner(page);
        const href = await page
            .getByRole("link", { name: "PAGAMENTOS ÚLTIMA PARTIDA" })
            .getAttribute("href");
        expect(href).toBeTruthy();
        await logout(page);

        await login(page, GROUPED_PLAYER_PHONE);
        await expect(page).toHaveURL(/\/home\/player/);

        const response = await page.goto(href!);
        expect(response?.status()).toBe(403);
    });
});
