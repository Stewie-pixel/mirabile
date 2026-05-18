const SESSION_KEY = 'puter_bound_supabase_uid';

export class PuterAuthService {
  private get puter() {
    return globalThis.puter;
  }

  isAvailable(): boolean {
    return typeof globalThis !== 'undefined' && typeof globalThis.puter !== 'undefined';
  }

  isSignedIn(): boolean {
    if (!this.isAvailable()) return false;
    return this.puter.auth.isSignedIn();
  }

  async signIn(): Promise<void> {
    await this.puter.auth.signIn();
  }

  async signOut(): Promise<void> {
    if (!this.isAvailable()) return;
    await this.puter.auth.signOut();
  }

  getUser() {
    if (!this.isAvailable() || !this.isSignedIn()) return null;
    return this.puter.auth.getUser();
  }

  /**
   * Ensures the active Puter session matches the logged-in Supabase user.
   * Signs out and re-authenticates if there's a mismatch.
   */
  async ensureCorrectUser(supabaseUserId: string): Promise<void> {
    const boundUid = sessionStorage.getItem(SESSION_KEY);

    if (this.isSignedIn() && boundUid !== supabaseUserId) {
      console.log('Puter session belongs to a different user — signing out and re-authenticating.');
      await this.signOut();
    }

    if (!this.isSignedIn()) {
      await this.signIn();
      sessionStorage.setItem(SESSION_KEY, supabaseUserId);
    }
  }

  /**
   * Call from Supabase onAuthStateChange on SIGNED_OUT
   * to clean up the Puter session immediately.
   */
  async handleSupabaseSignOut(): Promise<void> {
    sessionStorage.removeItem(SESSION_KEY);
    if (this.isSignedIn()) {
      await this.signOut();
    }
  }
}