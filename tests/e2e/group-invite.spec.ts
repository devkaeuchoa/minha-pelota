import { expect, test, type Page } from "@playwright/test";

const OWNER_PHONE = "11111111111";
const SEEDED_PASSWORD = "password";

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loginOwner(page: Page): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(OWNER_PHONE);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
    await expect(page).toHaveURL(/\/home\/admin$/);
}

async function openGroupShow(page: Page, groupName: string): Promise<void> {
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

async function getInviteTokenFromGroupShow(page: Page, groupName: string): Promise<string> {
    await loginOwner(page);
    await openGroupShow(page, groupName);

    await page.getByRole("button", { name: "CONVITE", exact: true }).click();

    const generateBtn = page.getByRole("button", { name: "GERAR LINK DE CONVITE" });
    if (await generateBtn.isVisible().catch(() => false)) {
        await generateBtn.click();
        await expect(page.locator("#group_invite_url")).toBeVisible();
    }

    const rawUrl = await page.locator("#group_invite_url").inputValue();
    const pathname = new URL(rawUrl).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const token = segments[segments.length - 1];
    if (!token) {
        throw new Error("Could not parse invite token from URL");
    }
    return token;
}

test.describe("Convites por link", () => {
    test("aceitar convite valido redireciona para sucesso com nome do grupo", async ({ page }) => {
        const groupName = "E2E Batch Delete 1";
        const inviteToken = await getInviteTokenFromGroupShow(page, groupName);

        const unique = Date.now().toString().slice(-8);
        const phone = `11${unique.padStart(9, "0").slice(-9)}`;

        await page.goto(`/invite/${inviteToken}`);
        await expect(page.getByRole("heading", { name: "CONVITE" })).toBeVisible();

        await page.locator("#invite_player_name").fill(`Convidado E2E ${unique}`);
        await page.locator("#invite_player_nick").fill(`convidado-${unique}`);
        await page.locator("#invite_player_phone").fill(phone);
        await page.locator("#invite_player_phone").press("Tab");

        await expect(
            page.getByText(/disponível para cadastro|disponivel para cadastro/i),
        ).toBeVisible({ timeout: 15_000 });

        await page.getByRole("button", { name: "PARTICIPAR" }).click();

        await expect(page).toHaveURL(new RegExp(`/invite/${inviteToken}/success$`));
        await expect(page.getByRole("heading", { name: "Inscrição confirmada" })).toBeVisible();
        await expect(page.getByText(groupName, { exact: false })).toBeVisible();
    });

    test("token de convite invalido responde 404", async ({ page }) => {
        const response = await page.goto(
            "/invite/00000000000000000000000000000000000000000",
        );
        expect(response?.status()).toBe(404);
    });

    test("token de convite expirado responde 404 na pagina de aceite", async ({ page }) => {
        const inviteToken = await getInviteTokenFromGroupShow(page, "E2E Invite Expired");
        const response = await page.goto(`/invite/${inviteToken}`);
        expect(response?.status()).toBe(404);
    });
});
