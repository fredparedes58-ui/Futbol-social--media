import { test, expect } from '@playwright/test'

test.describe('Flujos críticos', () => {
  test.beforeEach(async ({ context }) => {
    // Sesión limpia cada test
    await context.clearCookies()
    await context.addInitScript(() => localStorage.clear())
  })

  test('onboarding → registro → home', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/crear cuenta/i).first()).toBeVisible()
    await page.getByText(/crear cuenta/i).first().click()
    await expect(page).toHaveURL(/\/register/)

    await page.getByPlaceholder('Nombre completo').fill('Alex E2E')
    await page.getByPlaceholder('tu@email.com').fill('alex@test.com')
    await page.getByPlaceholder('Contraseña').fill('Secret123!')
    await page.getByText(/unirse a la comunidad/i).click()

    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 })
    await expect(page.locator('body')).toContainText(/Hola|Highlights|Próximo|Live/i)
  })

  test('landing page pública carga', async ({ page }) => {
    await page.goto('/landing')
    await expect(page.getByText(/El fútbol amateur/i)).toBeVisible()
    await expect(page.getByText(/Empezar ahora/i)).toBeVisible()
  })

  test('chat bot responde con asistente RAG', async ({ page }) => {
    // Login rápido vía register
    await page.goto('/register')
    await page.getByPlaceholder('Nombre completo').fill('Alex Bot')
    await page.getByPlaceholder('tu@email.com').fill('bot@test.com')
    await page.getByPlaceholder('Contraseña').fill('Secret123!')
    await page.getByText(/unirse a la comunidad/i).click()
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 })

    // Ir al chat
    await page.goto('/chat')
    await expect(page.locator('body')).toContainText(/chats?/i)
  })

  test('perfil muestra overall y stats', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('Nombre completo').fill('Alex Profile')
    await page.getByPlaceholder('tu@email.com').fill('prof@test.com')
    await page.getByPlaceholder('Contraseña').fill('Secret123!')
    await page.getByText(/unirse a la comunidad/i).click()
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 })

    await page.goto('/profile')
    await expect(page.getByText(/Perfil/).first()).toBeVisible()
    await expect(page.getByText('Partidos', { exact: true })).toBeVisible()
    await expect(page.getByText('Goles', { exact: true })).toBeVisible()
  })
})
