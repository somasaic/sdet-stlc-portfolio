import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordButton: Locator;
  readonly signInWithGoogleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Sign in', exact: true });
    this.errorMessage = page.getByText('Your email, password, IP');
    this.forgotPasswordButton = page.getByRole('button', { name: 'Forgot Password?' });
    this.signInWithGoogleButton = page.getByRole('button', { name: 'Sign in with Google' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/#/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Wait for the login response - wait for network idle and give time for error messages
    await Promise.race([
      this.page.waitForNavigation().catch(() => {}),
      this.page.waitForLoadState('networkidle').catch(() => {}),
      this.page.waitForTimeout(5000)
    ]);
    await this.page.waitForTimeout(500);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    // Wait for login response
    await Promise.race([
      this.page.waitForNavigation().catch(() => {}),
      this.page.waitForLoadState('networkidle').catch(() => {}),
      this.page.waitForTimeout(5000)
    ]);
    await this.page.waitForTimeout(500);
  }

  async getErrorMessage(): Promise<string | null> {
    // Try to get any visible error or validation message on the page
    const errorElements = await this.page.locator('[role="alert"], .error, .alert').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text && text.trim()) {
        return text;
      }
    }
    return this.errorMessage.textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    // Check if we're still on login page (meaning login failed)
    const url = this.page.url();
    if (!url.includes('login')) {
      // Successfully logged in - navigated away from login page
      return false;
    }
    
    // Still on login page - check for any visible error messages
    const errorElements = await this.page.locator('[role="alert"], .error, .alert').all();
    for (const element of errorElements) {
      const isVisible = await element.isVisible();
      if (isVisible) {
        return true;
      }
    }
    
    // Check for the original error message locator as fallback
    return this.errorMessage.isVisible().catch(() => false);
  }
}
