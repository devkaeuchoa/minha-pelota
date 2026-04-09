import { expect, test, type Page } from "@playwright/test";

const TEST_PASSWORD = "password";

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
    test("login com dados validos redireciona para area autenticada", async ({ page }) => {
        const phone = generatePhone();

        await registerPlayer(page, phone);
        await logout(page);
        await login(page, phone, TEST_PASSWORD);

        await expect(page).toHaveURL(/(\/home\/player|\/groups)$/);
    });

    test("login com senha incorreta exibe erro e mantem usuario desautenticado", async ({ page }) => {
        const phone = generatePhone();

        await registerPlayer(page, phone);
        await logout(page);
        await login(page, phone, "senha-incorreta");

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByText(/credenciais|credentials|registros|records/i)).toBeVisible();
    });

    test("login com telefone nao cadastrado exibe erro de credenciais invalidas", async ({ page }) => {
        await login(page, generatePhone(), "qualquer-senha");

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByText(/credenciais|credentials|registros|records/i)).toBeVisible();
    });

    test("logout encerra sessao e bloqueia rota protegida", async ({ page }) => {
        await registerPlayer(page, generatePhone());
        await logout(page);

        await page.goto("/profile");
        await expect(page).toHaveURL(/\/login$/);
    });
});
