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

async function openTodayMatchFromCalendar(page: Page): Promise<void> {
    await page.getByRole("link", { name: "PAGAMENTOS DO MÊS" }).click();
    await expect(page).toHaveURL(/\/groups\/\d+\/payments$/);
    await expect(page.getByRole("heading", { name: "CALENDÁRIO DE PAGAMENTOS" })).toBeVisible();

    const today = new Date().getDate().toString();
    await page
        .locator("td a", { hasText: today })
        .first()
        .click();
    await expect(page).toHaveURL(/\/groups\/\d+\/matches\/\d+\/payments$/);
}

test.describe("Pagamentos por partida", () => {
    test("calendario do mes abre a tela da partida com todos os jogadores do grupo", async ({
        page,
    }) => {
        await loginOwner(page);
        await openTodayMatchFromCalendar(page);

        await expect(page.getByRole("heading", { name: "PAGAMENTOS DA PARTIDA" })).toBeVisible();
        // .last(): "PARTIDA" also appears as a breadcrumb crumb above the page content.
        await expect(page.getByText("PARTIDA", { exact: true }).last()).toBeVisible();
        await expect(page.getByText("LOCAL", { exact: true })).toBeVisible();
        await expect(page.getByText("Arena Pagamentos E2E").first()).toBeVisible();

        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "JOGADOR" }),
        ).toBeVisible();
        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "PRESENÇA" }),
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
        await expect(
            page.locator('[data-component="retro-table-header-cell"]', { hasText: "AÇÃO" }),
        ).toBeVisible();

        // Owner + Grouped Player are both members of the group, so both appear now
        // (previously only confirmed attendees were listed).
        await expect(page.locator("tbody tr")).toHaveCount(2);
        await expect(
            page.locator('[data-component="retro-table-row"]', { hasText: "Grouped Player" }),
        ).toContainText("CONFIRMADA");
    });

    test("atualizar pagamento reflete nos contadores pagos e nao pagos", async ({ page }) => {
        await loginOwner(page);
        await openTodayMatchFromCalendar(page);

        const unpaid = summaryValue(page, "NÃO PAGOS");
        const paid = summaryValue(page, "PAGOS");

        const row = page.locator("tbody tr").filter({ hasText: "Grouped Player" });
        await row.locator("select").selectOption("paid");
        await row.getByRole("button", { name: "SALVAR" }).click();

        await expect(page.getByText("Pagamento atualizado com sucesso.")).toBeVisible();
        await expect(paid).toHaveText("1");
        await expect(unpaid).toHaveText("0");
    });

    test("membro nao owner recebe 403 ao acessar pagamentos", async ({ page }) => {
        await loginOwner(page);
        await page.getByRole("link", { name: "PAGAMENTOS DO MÊS" }).click();
        await expect(page).toHaveURL(/\/groups\/\d+\/payments$/);

        const today = new Date().getDate().toString();
        const href = await page
            .locator("td a", { hasText: today })
            .first()
            .getAttribute("href");
        expect(href).toBeTruthy();
        await logout(page);

        await login(page, GROUPED_PLAYER_PHONE);
        await expect(page).toHaveURL(/\/home\/player/);

        const response = await page.goto(href!);
        expect(response?.status()).toBe(403);
    });
});
