/**
 * Genera screenshots para el manifest PWA + README.
 * Sale en public/screenshots/*.png
 */
import { test } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const OUT = path.resolve(__dirname, '../public/screenshots')

async function register(page: import('@playwright/test').Page) {
  await page.goto('/register')
  await page.getByPlaceholder('Nombre completo').fill('Alex Rivera')
  await page.getByPlaceholder('tu@email.com').fill('alex@screens.com')
  await page.getByPlaceholder('Contraseña').fill('Secret123!')
  await page.getByText(/unirse a la comunidad/i).click()
  await page.waitForURL(/\/home/, { timeout: 10_000 })
  await page.waitForTimeout(800) // esperar animaciones
}

test.describe('PWA screenshots', () => {
  test('1-landing', async ({ page }) => {
    await page.goto('/landing')
    await page.waitForTimeout(700)
    await page.screenshot({ path: path.join(OUT, '1-landing.png'), fullPage: false })
  })

  test('2-home', async ({ page }) => {
    await register(page)
    await page.screenshot({ path: path.join(OUT, '2-home.png'), fullPage: false })
  })

  test('3-profile', async ({ page }) => {
    await register(page)
    await page.goto('/profile')
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT, '3-profile.png'), fullPage: false })
  })

  test('4-league', async ({ page }) => {
    await register(page)
    await page.goto('/league')
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT, '4-league.png'), fullPage: false })
  })

  test('5-community', async ({ page }) => {
    await register(page)
    await page.goto('/community')
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT, '5-community.png'), fullPage: false })
  })
})
