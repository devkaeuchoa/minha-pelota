import { expect, test, type Page } from "@playwright/test";

const OWNER_PHONE = "11111111111";
const GROUPED_PLAYER_PHONE = "11977777777";
const SEEDED_PASSWORD = "password";
const E2E_TEAMS_GROUP_NAME = "E2E Match Teams";
const E2E_TEAMS_DEFAULT_SIZE_GROUP_NAME = "E2E Match Teams Default Size";

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function login(page: Page, phone: string): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(phone);
    await page.locator("#password").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "ENTRAR" }).click();
}

async function loginOwner(page: Page): Promise<void> {
    await login(page, OWNER_PHONE);
    await expect(page).toHaveURL(/\/home\/admin$/);
}

async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "LOG OUT" }).click();
    await expect(page).toHaveURL(/\/login$/);
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

async function openTeamsManageForGroup(page: Page, groupName: string): Promise<void> {
    await openGroupShowByExactName(page, groupName);
    await page.getByRole("button", { name: "SORTEAR TIMES" }).click();
    await expect(page.getByRole("heading", { name: "DIVISÃO DE TIMES" })).toBeVisible();
}

async function openTeamsManageForE2eGroup(page: Page): Promise<void> {
    await openTeamsManageForGroup(page, E2E_TEAMS_GROUP_NAME);
}

function teamPlayerList(page: Page, title: string) {
    return page
        .locator('[data-component="retro-player-list"]')
        .filter({ has: page.getByText(title, { exact: true }) });
}

test.describe("Divisão de times por partida", () => {
    test.describe.configure({ mode: "serial" });

    test("todos os confirmados aparecem como reservas antes de gerar os times", async ({ page }) => {
        await loginOwner(page);
        await openTeamsManageForE2eGroup(page);

        const reserves = teamPlayerList(page, "RESERVAS");
        await expect(reserves.locator("button")).toHaveCount(5);
        await expect(teamPlayerList(page, "TIME A").locator("button")).toHaveCount(0);
        await expect(teamPlayerList(page, "TIME B").locator("button")).toHaveCount(0);
    });

    test("gerar times com tamanho 2 balanceia por rating e envia excedente para reservas", async ({
        page,
    }) => {
        await loginOwner(page);
        await openTeamsManageForE2eGroup(page);

        await page.locator("#team_size").fill("2");
        await page.getByRole("button", { name: "GERAR TIMES" }).click();
        await expect(page.getByText("Times gerados com sucesso.")).toBeVisible();

        const teamA = teamPlayerList(page, "TIME A");
        const teamB = teamPlayerList(page, "TIME B");
        const reserves = teamPlayerList(page, "RESERVAS");

        await expect(teamA.locator("button")).toHaveCount(2);
        await expect(teamB.locator("button")).toHaveCount(2);
        await expect(reserves.locator("button")).toHaveCount(1);

        // Balanceamento por rating desc (5,4,3,2,1) com pesos de condição física iguais:
        // times alternam A/B respeitando o cap de 2, o jogador de menor rating sobra.
        await expect(teamA.getByText("teams-player-1", { exact: true })).toBeVisible();
        await expect(teamA.getByText("teams-player-3", { exact: true })).toBeVisible();
        await expect(teamB.getByText("teams-player-2", { exact: true })).toBeVisible();
        await expect(teamB.getByText("teams-player-4", { exact: true })).toBeVisible();
        await expect(reserves.getByText("teams-player-5", { exact: true })).toBeVisible();
    });

    test("clicar em jogador troca de time e reflete apos reload", async ({ page }) => {
        await loginOwner(page);
        await openTeamsManageForE2eGroup(page);

        const teamA = teamPlayerList(page, "TIME A");
        const teamB = teamPlayerList(page, "TIME B");
        const reserves = teamPlayerList(page, "RESERVAS");

        // Estado herdado do teste anterior: A=[1,3], B=[2,4], reservas=[5].
        await reserves.getByText("teams-player-5", { exact: true }).click();
        await expect(page.getByText("Time atualizado.")).toBeVisible();

        await page.reload();
        await expect(teamPlayerList(page, "RESERVAS")).toHaveCount(0);
        await expect(teamA.locator("button")).toHaveCount(3);
        await expect(teamA.getByText("teams-player-5", { exact: true })).toBeVisible();

        await teamA.getByText("teams-player-1", { exact: true }).click();
        await expect(page.getByText("Time atualizado.")).toBeVisible();

        await page.reload();
        await expect(teamA.locator("button")).toHaveCount(2);
        await expect(teamB.locator("button")).toHaveCount(3);
        await expect(teamB.getByText("teams-player-1", { exact: true })).toBeVisible();
        await expect(teamA.getByText("teams-player-3", { exact: true })).toBeVisible();
        await expect(teamA.getByText("teams-player-5", { exact: true })).toBeVisible();
    });

    test("membro nao owner recebe 403 ao acessar divisao de times", async ({ page }) => {
        await loginOwner(page);
        await openTeamsManageForE2eGroup(page);
        const teamsUrl = page.url();
        await logout(page);

        await login(page, GROUPED_PLAYER_PHONE);
        await expect(page).toHaveURL(/\/home\/player/);

        const response = await page.goto(teamsUrl);
        expect(response?.status()).toBe(403);
    });
});

test.describe("Tamanho de time padrão do grupo", () => {
    test("input vem pré-preenchido e editável, e o botão já aparece como SALVAR", async ({
        page,
    }) => {
        await loginOwner(page);
        await openTeamsManageForGroup(page, E2E_TEAMS_DEFAULT_SIZE_GROUP_NAME);

        const teamSizeInput = page.locator("#team_size");
        await expect(teamSizeInput).toHaveValue("3");
        await expect(teamSizeInput).not.toHaveAttribute("readonly", "");
        await expect(page.getByRole("button", { name: "SALVAR" })).toBeVisible();
        await expect(page.getByRole("button", { name: "EDITAR" })).toHaveCount(0);
    });

    test("botões +/- ajustam o valor respeitando o mínimo e o máximo", async ({ page }) => {
        await loginOwner(page);
        await openTeamsManageForGroup(page, E2E_TEAMS_DEFAULT_SIZE_GROUP_NAME);

        const teamSizeInput = page.locator("#team_size");
        await expect(teamSizeInput).toHaveValue("3");

        await page.getByRole("button", { name: "Aumentar" }).click();
        await expect(teamSizeInput).toHaveValue("4");

        await page.getByRole("button", { name: "Diminuir" }).click();
        await page.getByRole("button", { name: "Diminuir" }).click();
        await expect(teamSizeInput).toHaveValue("2");
    });

    test("gerar times usa o valor editado no input", async ({ page }) => {
        await loginOwner(page);
        await openTeamsManageForGroup(page, E2E_TEAMS_DEFAULT_SIZE_GROUP_NAME);

        const teamSizeInput = page.locator("#team_size");
        await teamSizeInput.fill("3");
        await page.getByRole("button", { name: "SALVAR" }).click();
        await expect(page.getByText("Times gerados com sucesso.")).toBeVisible();

        const teamA = teamPlayerList(page, "TIME A");
        const teamB = teamPlayerList(page, "TIME B");
        const reserves = teamPlayerList(page, "RESERVAS");

        await expect(reserves.locator("button")).toHaveCount(0);
        const teamACount = await teamA.locator("button").count();
        const teamBCount = await teamB.locator("button").count();
        expect(teamACount + teamBCount).toBe(4);
        expect(teamACount).toBeLessThanOrEqual(3);
        expect(teamBCount).toBeLessThanOrEqual(3);
    });
});
