import { expect, test, type Page } from "@playwright/test";

const OWNER_PHONE = "11988888888";
const SEEDED_PASSWORD = "password";
const EXISTING_PLAYER_PHONE = "11977777777";

async function login(page: Page): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(OWNER_PHONE);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
    await expect(page).toHaveURL(/\/groups$/);
}

async function openGroupPlayers(page: Page, groupName: string): Promise<number> {
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

    const match = page.url().match(/\/groups\/(\d+)$/);
    if (!match) {
        throw new Error("Unable to parse group id from URL");
    }

    await page.getByRole("button", { name: /5\. jogadores/i }).click();
    await page.getByRole("button", { name: "GERENCIAR JOGADORES" }).click();
    await expect(page).toHaveURL(new RegExp(`/groups/${match[1]}/players$`));

    return Number(match[1]);
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function playerListByTitle(page: Page, title: "DISPONÍVEIS" | "NO GRUPO") {
    return page.locator('[data-component="retro-player-list"]').filter({ hasText: title });
}

async function postAddPlayerByPhone(
    page: Page,
    groupId: number,
    player: { name: string; nick: string; phone: string; rating?: number },
): Promise<void> {
    const xsrfCookie = (await page.context().cookies()).find(
        (cookie) => cookie.name === "XSRF-TOKEN",
    );
    if (!xsrfCookie) {
        throw new Error("Missing XSRF-TOKEN cookie");
    }

    const response = await page.request.post(`/groups/${groupId}/players`, {
        form: {
            name: player.name,
            nick: player.nick,
            phone: player.phone,
            rating: String(player.rating ?? 3),
        },
        headers: {
            "X-XSRF-TOKEN": decodeURIComponent(xsrfCookie.value),
            "X-Requested-With": "XMLHttpRequest",
        },
    });

    expect(response.ok()).toBeTruthy();
}

test.describe.configure({ mode: "serial" });

test.describe("Jogadores no grupo", () => {
    test("adiciona jogador novo por telefone", async ({ page }) => {
        await login(page);

        const groupTwoId = await openGroupPlayers(page, "E2E Group 2");
        const uniqueSuffix = Date.now().toString().slice(-6);
        const newPlayerNick = `e2e-novo-${uniqueSuffix}`;
        const newPlayerName = `E2E Novo ${uniqueSuffix}`;
        const newPlayerPhone = `11${Date.now().toString().slice(-9)}`;

        await postAddPlayerByPhone(page, groupTwoId, {
            name: newPlayerName,
            nick: newPlayerNick,
            phone: newPlayerPhone,
            rating: 3,
        });

        await page.goto(`/groups/${groupTwoId}/players`);
        await expect(
            playerListByTitle(page, "NO GRUPO").getByRole("button", { name: new RegExp(newPlayerNick, "i") }),
        ).toBeVisible();
    });

    test("reaproveita jogador existente por telefone sem sobrescrever dados", async ({ page }) => {
        await login(page);

        const groupTwoId = await openGroupPlayers(page, "E2E Group 2");

        await postAddPlayerByPhone(page, groupTwoId, {
            name: "Nao Deve Substituir",
            nick: "nao-deve-substituir",
            phone: EXISTING_PLAYER_PHONE,
            rating: 5,
        });

        await page.goto(`/groups/${groupTwoId}/players`);
        await expect(
            playerListByTitle(page, "NO GRUPO").getByRole("button", { name: /grouped-player/i }),
        ).toBeVisible();
        await expect(page.getByRole("button", { name: /nao-deve-substituir/i })).toHaveCount(0);
    });

    test("jogador pode existir em multiplos grupos", async ({ page }) => {
        await login(page);

        const groupTwoId = await openGroupPlayers(page, "E2E Group 2");
        await postAddPlayerByPhone(page, groupTwoId, {
            name: "Nao Deve Substituir",
            nick: "nao-deve-substituir",
            phone: EXISTING_PLAYER_PHONE,
            rating: 5,
        });

        // await page.goto(`/groups/${groupTwoId}/players`);
        await expect(
            playerListByTitle(page, "NO GRUPO").getByRole("button", { name: /grouped-player/i }),
        ).toBeVisible();

        await openGroupPlayers(page, "E2E Group");
        await expect(
            playerListByTitle(page, "NO GRUPO").getByRole("button", { name: /grouped-player/i }),
        ).toBeVisible();
    });

    test("remove jogador de um grupo sem remover de outro", async ({ page }) => {
        await login(page);

        const groupTwoId = await openGroupPlayers(page, "E2E Group 2");
        await postAddPlayerByPhone(page, groupTwoId, {
            name: "Nao Deve Substituir",
            nick: "nao-deve-substituir",
            phone: EXISTING_PLAYER_PHONE,
            rating: 5,
        });

        await page.goto(`/groups/${groupTwoId}/players`);
        await playerListByTitle(page, "NO GRUPO").getByRole("button", { name: /grouped-player/i }).click();
        await page.getByRole("button", { name: "REMOVER DO GRUPO" }).click();
        await expect(
            playerListByTitle(page, "NO GRUPO").getByRole("button", { name: /grouped-player/i }),
        ).toHaveCount(0);
        await expect(
            playerListByTitle(page, "DISPONÍVEIS").getByRole("button", { name: /grouped-player/i }),
        ).toBeVisible();

        await openGroupPlayers(page, "E2E Group");
        await expect(
            playerListByTitle(page, "NO GRUPO").getByRole("button", { name: /grouped-player/i }),
        ).toBeVisible();
    });
});
