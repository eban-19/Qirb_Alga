import { test, expect } from "@playwright/test";

test.describe("Profile Persistence and Login Eye Toggle", () => {
  test("should toggle password visibility, update profile info, and persist it across reloads and sessions", async ({ page }) => {
    // 1. Open the login page
    await page.goto("http://localhost:5173/login");
    await expect(page).toHaveTitle(/Owner Login|Login/i);

    // 2. Locate password field and toggle button
    const passwordInput = page.locator("#password");
    const toggleButton = page.locator("button:has(svg)");

    // Initially, input should be password type
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click to show password
    await toggleButton.first().click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click to hide password again
    await toggleButton.first().click();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // 3. Fill credentials and submit
    await page.locator("#email").fill("admin@pension.com");
    await passwordInput.fill("admin123");
    
    // Press login
    await page.locator("button[type='submit']").click();

    // 4. Verify we navigate to dashboard
    await page.waitForURL("**/dashboard/admin");
    await expect(page).toHaveURL(/.*dashboard\/admin/);

    // 5. Navigate to Settings page
    await page.locator("a[href*='/settings']").first().click();
    await page.waitForURL("**/dashboard/admin/settings");

    // Click Account tab if not active
    const accountTabTrigger = page.locator("button:has-text('Account'), [role='tab']:has-text('Account')").first();
    if (await accountTabTrigger.isVisible()) {
      await accountTabTrigger.click();
    }

    // 6. Check current profile info
    const nameInput = page.locator("input:near(label:has-text('Full Name'))").first();
    const phoneInput = page.locator("input:near(label:has-text('Phone Number'))").first();

    // Expect edit button to be visible
    const editBtn = page.locator("button:has-text('Edit')").first();
    await editBtn.click();

    // Fill new profile info
    await nameInput.fill("Super Admin");
    await phoneInput.fill("0911223344");

    // Click update profile
    const updateBtn = page.locator("button:has-text('Update Profile')").first();
    await updateBtn.click();

    // Verify success toast
    await expect(page.locator("text=Profile updated successfully")).toBeVisible();

    // 7. Reload page and check if it persists
    await page.reload();
    await page.waitForURL("**/dashboard/admin/settings");
    
    await expect(nameInput).toHaveValue("Super Admin");
    await expect(phoneInput).toHaveValue("0911223344");

    // 8. Log out
    const signOutBtn = page.locator("button:has-text('Sign Out')").first();
    await signOutBtn.click();
    await page.waitForURL("**/login");

    // 9. Log back in and verify name persists in context/header/dashboard
    await page.locator("#email").fill("admin@pension.com");
    await page.locator("#password").fill("admin123");
    await page.locator("button[type='submit']").click();

    await page.waitForURL("**/dashboard/admin");
    
    // Go back to settings to check persistence
    await page.locator("a[href*='/settings']").first().click();
    await page.waitForURL("**/dashboard/admin/settings");

    await expect(nameInput).toHaveValue("Super Admin");
    await expect(phoneInput).toHaveValue("0911223344");
  });
});
