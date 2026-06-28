import { env, isMockAuth } from '../env';

/**
 * Auth provider abstraction (SOLID: services depend on this interface, not a
 * concrete vendor). Two implementations:
 *   • MockAuthProvider     — deterministic, runs with no credentials.
 *   • SupabaseAuthProvider — delegates to Supabase (requires env keys).
 */

export interface OAuthIdentity {
  providerAccountId: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
}

export interface AuthProvider {
  /**
   * Produce (and "deliver") the OTP for a phone number, returning the plaintext
   * code so the service can hash + persist it. In production the code is sent
   * via SMS and a random value is returned.
   */
  issueOtp(phone: string): Promise<string>;

  /** Resolve a provider credential (id_token / auth code) into an identity. */
  verifyOAuth(provider: 'GOOGLE' | 'APPLE', credential: string): Promise<OAuthIdentity>;
}

class MockAuthProvider implements AuthProvider {
  async issueOtp(phone: string): Promise<string> {
    const code = env.MOCK_OTP_CODE;
    // Visible in dev logs so you can complete the flow without an SMS.
    console.info(`[mock-auth] OTP for ${phone} → ${code}`);
    return code;
  }

  async verifyOAuth(provider: 'GOOGLE' | 'APPLE', credential: string): Promise<OAuthIdentity> {
    // Deterministic identity derived from the credential, for local testing.
    const handle = credential.slice(0, 12).replace(/[^a-zA-Z0-9]/g, '') || 'tester';
    return {
      providerAccountId: `${provider.toLowerCase()}_${handle}`,
      email: `${handle}@example.com`,
      phone: null,
      displayName: `${provider === 'GOOGLE' ? 'Google' : 'Apple'} User`,
    };
  }
}

class SupabaseAuthProvider implements AuthProvider {
  constructor() {
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'AUTH_PROVIDER=supabase requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      );
    }
  }

  async issueOtp(_phone: string): Promise<string> {
    // Wiring point for Supabase Auth phone OTP (signInWithOtp). Deferred until
    // real credentials are provided; mock mode is the default for local dev.
    throw new Error('SupabaseAuthProvider.issueOtp is not configured in this milestone.');
  }

  async verifyOAuth(): Promise<OAuthIdentity> {
    throw new Error('SupabaseAuthProvider.verifyOAuth is not configured in this milestone.');
  }
}

let provider: AuthProvider | null = null;

/** Singleton accessor — picks the implementation from AUTH_PROVIDER. */
export function getAuthProvider(): AuthProvider {
  if (!provider) {
    provider = isMockAuth ? new MockAuthProvider() : new SupabaseAuthProvider();
  }
  return provider;
}
