import { expect, test, type Page } from "@playwright/test";

const TEST_PASSWORD = "password";

// Phones match seeded fixtures in database/seeders/DatabaseSeeder.php
const OWNER_PHONE = "11111111111"; //          admin com grupos e partidas existentes
const NEW_ADMIN_PHONE = "11922222222"; //      admin sem grupos nem partidas (nunca mutado por outras suites)

function generatePhone(): string {
    const suffix = Date.now().toString().slice(-9);
    return `11${suffix}`;
}

async function registerPlayer(page: Page, phone: string, password = TEST_PASSWORD): Promise<void> {
    await page.goto("/register");

    await page.getByRole("textbox", { name: /nome/i }).fill("E2E Player");
    await page.getByRole("textbox", { name: /telefone/i }).fill(phone);
    await page.locator('#password').fill(password);
    await page.locator('#password_confirmation').fill(password);

    const registerButton = page.getByRole("button", { name: "CADASTRAR" });
    await expect(registerButton).toBeEnabled({ timeout: 10_000 });
    await registerButton.click();

    await expect(page).toHaveURL(/(\/home\/player|\/groups)$/);
}

async function login(page: Page, phone: string, password: string): Promise<void> {
    await page.goto("/login");
    await page.locator('#phone').fill(phone);
    await page.locator('#password').fill(password);
    await page.getByRole("button", { name: "ENTRAR" }).click();
}

async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "LOG OUT" }).click();
    await expect(page).toHaveURL(/\/login$/);
}

test.describe("Autenticacao por telefone", () => {
    test(
        "login com dados validos redireciona para area autenticada",
        {
            annotation: [
                { type: "Given", description: "um jogador cadastrado com telefone e senha válidos" },
                { type: "And", description: "o jogador está deslogado" },
                { type: "When", description: "o jogador faz login com telefone e senha corretos" },
                {
                    type: "Then",
                    description: "é redirecionado para a área autenticada (home do jogador ou grupos)",
                },
            ],
        },
        async ({ page }) => {
            const phone = generatePhone();

            await registerPlayer(page, phone);
            await logout(page);
            await login(page, phone, TEST_PASSWORD);

            await expect(page).toHaveURL(/(\/home\/player|\/groups)$/);
        },
    );

    test(
        "login com senha incorreta exibe erro e mantem usuario desautenticado",
        {
            annotation: [
                { type: "Given", description: "um jogador cadastrado com telefone e senha válidos" },
                { type: "And", description: "o jogador está deslogado" },
                {
                    type: "When",
                    description: "o jogador tenta logar com o telefone correto e senha incorreta",
                },
                { type: "Then", description: "permanece na tela de login" },
                { type: "And", description: "uma mensagem de erro de credenciais é exibida" },
            ],
        },
        async ({ page }) => {
            const phone = generatePhone();

            await registerPlayer(page, phone);
            await logout(page);
            await login(page, phone, "senha-incorreta");

            await expect(page).toHaveURL(/\/login$/);
            await expect(page.getByText(/credenciais|credentials|registros|records/i)).toBeVisible();
        },
    );

    test(
        "login com telefone nao cadastrado exibe erro de credenciais invalidas",
        {
            annotation: [
                { type: "Given", description: "nenhum jogador cadastrado com o telefone informado" },
                { type: "When", description: "alguém tenta logar com esse telefone e qualquer senha" },
                { type: "Then", description: "permanece na tela de login" },
                { type: "And", description: "uma mensagem de erro de credenciais é exibida" },
            ],
        },
        async ({ page }) => {
            await login(page, generatePhone(), "qualquer-senha");

            await expect(page).toHaveURL(/\/login$/);
            await expect(page.getByText(/credenciais|credentials|registros|records/i)).toBeVisible();
        },
    );

    test(
        "logout encerra sessao e bloqueia rota protegida",
        {
            annotation: [
                { type: "Given", description: "um jogador cadastrado e autenticado" },
                { type: "When", description: "o jogador faz logout" },
                { type: "Then", description: "a sessão é encerrada" },
                {
                    type: "And",
                    description: "acessar uma rota protegida (/profile) redireciona para /login",
                },
            ],
        },
        async ({ page }) => {
            await registerPlayer(page, generatePhone());
            await logout(page);

            await page.goto("/profile");
            await expect(page).toHaveURL(/\/login$/);
        },
    );

    test(
        "primeiro login do admin exibe primeiros passos e cards zerados/desabilitados",
        {
            annotation: [
                {
                    type: "Given",
                    description: "um administrador recem-cadastrado, sem grupos e sem partidas",
                },
                { type: "When", description: "o administrador faz login com telefone e senha corretos" },
                { type: "Then", description: "é redirecionado para /home/admin" },
                { type: "And", description: "o painel \"PRIMEIROS PASSOS\" é exibido" },
                {
                    type: "And",
                    description: "todos os 5 cards de resumo aparecem no estado desabilitado (zerados)",
                },
            ],
        },
        async ({ page }) => {
            await login(page, NEW_ADMIN_PHONE, TEST_PASSWORD);

            await expect(page).toHaveURL(/\/home\/admin$/);
            await expect(page.getByRole("heading", { name: "HOME DO ADMIN" })).toBeVisible();
            await expect(page.getByText("PRIMEIROS PASSOS")).toBeVisible();

            const thumbCards = page.locator('[data-component="retro-thumb-card"]');
            await expect(thumbCards).toHaveCount(5);
            await expect(page.locator('[data-component="retro-thumb-card"][data-disabled]')).toHaveCount(
                5,
            );
        },
    );

    test(
        "login de admin com dados existentes exibe resumo com cards habilitados",
        {
            annotation: [
                {
                    type: "Given",
                    description: "um administrador já cadastrado, com grupos e partidas existentes",
                },
                { type: "When", description: "o administrador faz login com telefone e senha corretos" },
                { type: "Then", description: "é redirecionado para /home/admin" },
                { type: "And", description: "o painel \"PRIMEIROS PASSOS\" não é exibido" },
                { type: "And", description: "nenhum dos 5 cards de resumo aparece desabilitado" },
            ],
        },
        async ({ page }) => {
            await login(page, OWNER_PHONE, TEST_PASSWORD);

            await expect(page).toHaveURL(/\/home\/admin$/);
            await expect(page.getByRole("heading", { name: "HOME DO ADMIN" })).toBeVisible();
            await expect(page.getByText("PRIMEIROS PASSOS")).toHaveCount(0);

            const thumbCards = page.locator('[data-component="retro-thumb-card"]');
            await expect(thumbCards).toHaveCount(5);
            await expect(page.locator('[data-component="retro-thumb-card"][data-disabled]')).toHaveCount(
                0,
            );
        },
    );

    test(
        "primeiro acesso redireciona para registro quando ja existe um admin",
        {
            annotation: [
                {
                    type: "Given",
                    description: "já existe um administrador cadastrado no sistema (fixture seedada)",
                },
                {
                    type: "When",
                    description: "alguém acessa a tela de primeiro acesso (/primeiro-acesso)",
                },
                { type: "Then", description: "é redirecionado para /register" },
                {
                    type: "And",
                    description:
                        "a mensagem \"Já existe um administrador cadastrado. Crie uma conta normal abaixo.\" é exibida",
                },
            ],
        },
        async ({ page }) => {
            // O banco e2e é compartilhado entre specs (fullyParallel + seed único no global-setup),
            // então sempre existe um admin seedado — esse é o único estado de "primeiro acesso"
            // seguro de testar aqui. A criação real do primeiro admin (banco vazio) já é coberta
            // isoladamente em tests/Feature/Auth/FirstAccessTest.php.
            await page.goto("/primeiro-acesso");

            await expect(page).toHaveURL(/\/register$/);
            await expect(
                page.getByText("Já existe um administrador cadastrado. Crie uma conta normal abaixo."),
            ).toBeVisible();
        },
    );
});
