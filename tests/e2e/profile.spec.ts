import { expect, test, type Page } from "@playwright/test";

const SEEDED_PASSWORD = "password";
const OWNER_PHONE = "11111111111";
const TEST_PLAYER_PHONE_MASKED = "(11) 99999-9999";
const PROFILE_PASSWORD_PHONE = "11944444444";
const PROFILE_DELETE_PHONE = "11955555555";
const NEW_PASSWORD = "NovaSenhaE2E_9";

async function login(page: Page, phone: string, password = SEEDED_PASSWORD): Promise<void> {
    await page.goto("/login");
    await page.locator("#phone").fill(phone);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "ENTRAR" }).click();
}

async function openProfile(page: Page): Promise<void> {
    await page.getByRole("button", { name: "PERFIL" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByText("PERFIL DO USUÁRIO", { exact: true })).toBeVisible();
}

async function openProfileEditMode(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Editar perfil" }).click();
}

test.describe("Perfil do jogador", () => {
    test.describe.configure({ mode: "serial" });

    test("edita nome sem mudar telefone", async ({ page }) => {
        await login(page, OWNER_PHONE);
        await expect(page).toHaveURL(/\/home\/admin$/);
        await openProfile(page);
        await openProfileEditMode(page);
        await page.locator("#profile_name").fill("Owner Player E2E");
        await page.getByRole("button", { name: "SALVAR DADOS BÁSICOS" }).click();
        await expect(page.getByText("Owner Player E2E")).toBeVisible();
    });

    test("edicao com telefone duplicado exibe erro apos confirmar modal", async ({ page }) => {
        await login(page, OWNER_PHONE);
        await expect(page).toHaveURL(/\/home\/admin$/);
        await openProfile(page);
        await openProfileEditMode(page);

        await page.locator("#profile_phone").fill(TEST_PLAYER_PHONE_MASKED);
        await page.getByRole("button", { name: "SALVAR DADOS BÁSICOS" }).click();

        await expect(page.getByText("CONFIRMAR ALTERAÇÃO DE TELEFONE")).toBeVisible();
        await page.getByRole("button", { name: "SIM, ALTERAR" }).click();

        await expect(
            page.getByText(/already been taken|has already been taken|já está|contém um valor duplicado/i),
        ).toBeVisible({ timeout: 10_000 });
    });

    test("alterar senha invalida login antigo e aceita a nova", async ({ page }) => {
        await login(page, PROFILE_PASSWORD_PHONE);
        await expect(page).toHaveURL(/\/home\/player$/);
        await openProfile(page);

        await page.locator('[data-component="retro-accordion"]').nth(0).locator("> button").first().click();

        const pwdInputs = page.locator('[data-component="retro-password-input"] input[type="password"]');
        await pwdInputs.nth(0).fill(SEEDED_PASSWORD);
        await pwdInputs.nth(1).fill(NEW_PASSWORD);
        await pwdInputs.nth(2).fill(NEW_PASSWORD);
        await page.getByRole("button", { name: "ATUALIZAR SENHA" }).click();

        await expect(page.getByRole("button", { name: "LOG OUT" })).toBeVisible();
        await page.getByRole("button", { name: "LOG OUT" }).click();
        await expect(page).toHaveURL(/\/login$/);

        await login(page, PROFILE_PASSWORD_PHONE, "senha-errada");
        await expect(page).toHaveURL(/\/login$/);

        await login(page, PROFILE_PASSWORD_PHONE, NEW_PASSWORD);
        await expect(page).toHaveURL(/\/home\/player$/);
    });

    test("excluir conta encerra sessao e bloqueia novo login", async ({ page }) => {
        await login(page, PROFILE_DELETE_PHONE);
        await expect(page).toHaveURL(/\/home\/player$/);
        await openProfile(page);

        await page.locator('[data-component="retro-accordion"]').nth(1).locator("> button").first().click();
        await page.getByRole("button", { name: "EXCLUIR MINHA CONTA" }).click();

        await page.locator("#delete_account_password").fill(SEEDED_PASSWORD);
        await page.getByRole("button", { name: "CONFIRMAR EXCLUSÃO" }).click();

        await expect(page).toHaveURL(/\/login$/, { timeout: 20_000 });

        await login(page, PROFILE_DELETE_PHONE);
        await expect(page).toHaveURL(/\/login$/);
    });
});
