import { expect, test, type Page } from "@playwright/test";

const OWNER_PHONE = "11111111111";
const SEEDED_PASSWORD = "password";
const E2E_GROUP_NAME = "E2E Group";
/** Padded to 64 chars — must match DatabaseSeeder str_pad('e2e_presence_expired', 64, '0'). */
const E2E_PRESENCE_EXPIRED_TOKEN =
    "e2e_presence_expired" + "0".repeat(64 - "e2e_presence_expired".length);

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loginOwner(page: Page): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(OWNER_PHONE);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
    await expect(page).toHaveURL(/\/groups$/);
}

async function openGroupShowByExactName(page: Page, groupName: string): Promise<void> {
    await page.goto("/groups");
    const exactGroupCell = page.locator("td", {
        hasText: new RegExp(`^${escapeRegex(groupName)}$`),
    });
    await page
        .locator("tbody tr")
        .filter({ has: exactGroupCell })
        .getByRole("link", { name: "Ver" })
        .click();
    await expect(page).toHaveURL(/\/groups\/\d+$/);
}

async function openE2eGroupShow(page: Page): Promise<void> {
    await openGroupShowByExactName(page, E2E_GROUP_NAME);
}

async function readConfirmedCount(page: Page): Promise<number> {
    const block = page
        .locator('[data-component="retro-value-display"]')
        .filter({ has: page.getByText("CONFIRMADOS", { exact: true }) });
    const valueSpan = block.locator("span.tracking-widest");
    const text = await valueSpan.textContent();
    return Number.parseInt((text ?? "").trim(), 10);
}

async function openPresenceManageForE2eGroup(page: Page): Promise<void> {
    await openE2eGroupShow(page);
    await page.getByRole("button", { name: "VER ESCALAÇÃO" }).click();
    await expect(page.getByRole("heading", { name: "VISUALIZAR ESCALAÇÃO" })).toBeVisible();
}

async function ensurePresenceLinkVisible(page: Page): Promise<string> {
    const generateBtn = page.getByRole("button", { name: "GERAR LINK DE PRESENÇA" });
    if (await generateBtn.isVisible()) {
        page.once("dialog", (d) => d.accept());
        await generateBtn.click();
        await expect(
            page.getByText(/Link de presença gerado|Link pronto|Copie e envie/i),
        ).toBeVisible({ timeout: 20_000 });
    }

    const linkInput = page.locator('input[readOnly][value*="presence"]');
    await expect(linkInput).toBeVisible({ timeout: 15_000 });
    const url = await linkInput.inputValue();
    expect(url).toMatch(/\/presence\//);
    return url;
}

test.describe("Presenca em partidas — fluxo principal", () => {
    test.describe.configure({ mode: "serial" });

    test("admin gera link de presenca e copiar reproduz a url", async ({ page, context }) => {
        const origin = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:8010";
        await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });

        await loginOwner(page);
        await openPresenceManageForE2eGroup(page);

        const expectedUrl = await ensurePresenceLinkVisible(page);

        await page.getByRole("button", { name: "COPIAR" }).click();
        const fromClipboard = await page.evaluate(() => navigator.clipboard.readText());
        expect(fromClipboard).toBe(expectedUrl);
    });

    test("jogador marca presenca pelo link e admin ve confirmados subirem", async ({ browser }) => {
        const adminContext = await browser.newContext();
        const page = await adminContext.newPage();

        await loginOwner(page);
        await openPresenceManageForE2eGroup(page);

        await ensurePresenceLinkVisible(page);
        const linkInput = page.locator('input[readOnly][value*="presence"]');
        const presenceUrl = await linkInput.inputValue();

        const confirmedBefore = await readConfirmedCount(page);

        const guestContext = await browser.newContext();
        const guestPage = await guestContext.newPage();
        await guestPage.goto(presenceUrl);

        await guestPage.locator("#phone").fill("(11) 97777-7777");
        await guestPage.locator('[data-component="retro-radio"]').getByText("CONFIRMAR", { exact: true }).click();
        await guestPage.getByRole("button", { name: "ATUALIZAR" }).click();

        await expect(guestPage.getByText("Presença atualizada.")).toBeVisible();
        await guestContext.close();

        await page.reload();
        const confirmedAfter = await readConfirmedCount(page);
        expect(confirmedAfter).toBe(confirmedBefore + 1);

        await adminContext.close();
    });
});

test("link de presenca expirado exibe aviso e bloqueia formulario", async ({ page }) => {
    await page.goto(`/presence/${E2E_PRESENCE_EXPIRED_TOKEN}`);
    await expect(
        page.getByText("Este link expirou. A presença não pode mais ser atualizada."),
    ).toBeVisible();
    await expect(page.locator("#phone")).toHaveCount(0);
});
