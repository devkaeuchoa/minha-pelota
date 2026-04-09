import { expect, test, type Page } from "@playwright/test";

const TEST_PASSWORD = "password";

function generatePhone(): string {
    const suffix = Date.now().toString().slice(-9);
    return `11${suffix}`;
}

async function fillBaseRegistrationForm(page: Page, phone: string): Promise<void> {
    await page.goto("/register");
    await page.getByRole("textbox", { name: /nome/i }).fill("E2E Register");
    await page.getByRole("textbox", { name: /telefone/i }).fill(phone);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.locator("#password_confirmation").fill(TEST_PASSWORD);
}

async function submitRegistration(page: Page): Promise<void> {
    const registerButton = page.getByRole("button", { name: "CADASTRAR" });
    await expect(registerButton).toBeEnabled({ timeout: 10_000 });
    await registerButton.click();
}

test.describe("Registro de jogador", () => {
    // Evitamos redundancia: o caso "registro com telefone valido e unico"
    // ja e exercitado na suite `tests/e2e/auth-phone.spec.ts` via helper `registerPlayer`.

    test("telefone duplicado exibe indisponibilidade no registro", async ({ page }) => {
        const phone = generatePhone();

        await fillBaseRegistrationForm(page, phone);
        await page.getByRole("textbox", { name: /telefone/i }).press("Tab");
        await submitRegistration(page);
        await expect(page).toHaveURL(/(\/home\/player|\/groups)$/);

        await page.getByRole("button", { name: "LOG OUT" }).click();
        await expect(page).toHaveURL(/\/login$/);

        await fillBaseRegistrationForm(page, phone);
        await page.getByRole("textbox", { name: /telefone/i }).press("Tab");

        await expect(
            page.getByText(/ja esta cadastrado|já está cadastrado|indisponivel|indisponível/i),
        ).toBeVisible();
    });

    test("telefone invalido no blur exibe mensagem de validacao", async ({ page }) => {
        await page.goto("/register");

        const phoneInput = page.getByRole("textbox", { name: /telefone/i });
        await phoneInput.fill("11999");
        await phoneInput.press("Tab");

        await expect(page.getByText(/informe um telefone valido|válido/i)).toBeVisible();
    });
});
