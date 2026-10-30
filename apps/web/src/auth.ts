import { useCallback, useEffect, useRef, useState } from 'react';
import { createAuthClient } from 'better-auth/react';

export type Provider = 'google' | 'github';
export interface AccountUser { id: string; name: string; email: string; emailVerified: boolean; image: string | null }
interface Account { user: AccountUser; providers: Provider[]; expiresAt: string }
type AccountStatus = 'checking' | 'guest' | 'authenticated' | 'unavailable';
const client = createAuthClient({ baseURL: window.location.origin });

const messages: Record<string, string> = {
  UNTRUSTED_ORIGIN: 'Sign-in is not available at this address. For the local preview, open http://127.0.0.1:5173/ and try again.',
  INVALID_ORIGIN: 'Start sign-in from the registered application address. For this local preview, use http://127.0.0.1:5173/.',
  account_not_linked: 'Use your original sign-in method, then connect the second provider from your account.',
  email_not_found: 'The provider did not return a usable email address. Check your provider email settings and try again.',
  email_not_verified: 'A verified email address is required for this action.',
  email_does_not_match: 'The providers use different emails. Keep them as separate accounts, or connect an identity with the same verified email.',
  unable_to_link_account: 'The provider could not be connected. Check that its email is verified and matches this account.',
  access_denied: 'Sign-in was cancelled or permission was not granted. You can try again.',
  state_invalid: 'This sign-in attempt expired or could not be verified. Start again from this page.',
  state_mismatch: 'This sign-in attempt could not be verified. Please start again.',
  state_not_found: 'This sign-in attempt expired. Please start again.',
  FRESH_SIGN_IN_REQUIRED: 'Sign out and sign in again before connecting another provider.',
};

export function authErrorMessage(code?: string) {
  return (code && messages[code]) || 'The account request could not be completed. Please try again.';
}

export function useAccount() {
  const [status, setStatus] = useState<AccountStatus>('checking');
  const [account, setAccount] = useState<Account | null>(null);
  const [providers, setProviders] = useState<Record<Provider, boolean>>({ google: false, github: false });
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const controller = useRef<AbortController | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    const timeout = window.setTimeout(() => current.abort(), 6000);
    try {
      const [profile, configured] = await Promise.all([
        fetch('/api/me', { credentials: 'include', cache: 'no-store', signal: current.signal }),
        fetch('/api/auth/providers', { credentials: 'include', cache: 'no-store', signal: current.signal }),
      ]);
      if (!configured.ok || (!profile.ok && profile.status !== 401)) throw new Error();
      const available = await configured.json() as Record<Provider, boolean>;
      const currentAccount = profile.ok ? await profile.json() as Account : null;
      if (controller.current !== current) return;
      setProviders({ google: available.google === true, github: available.github === true });
      setAccount(currentAccount);
      setStatus(currentAccount ? 'authenticated' : 'guest');
    } catch {
      if (controller.current !== current) return;
      setAccount(null);
      setStatus('unavailable');
    } finally { window.clearTimeout(timeout); }
  }, []);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.has('auth_error') || search.has('auth_complete')) {
      if (search.has('auth_error')) setError(authErrorMessage(search.get('error') ?? undefined));
      else setNotice('Your account has been updated.');
      search.delete('auth_error'); search.delete('auth_complete'); search.delete('error'); search.delete('error_description');
      const query = search.toString();
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    }
    void refresh();
    const focus = () => { void refresh(); };
    const visible = () => { if (document.visibilityState === 'visible') void refresh(); };
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', visible);
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('codetogether.auth');
      channel.current.onmessage = focus;
    }
    return () => {
      controller.current?.abort(); controller.current = null;
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', visible);
      channel.current?.close(); channel.current = null;
    };
  }, [refresh]);

  const social = async (provider: Provider, linking = false) => {
    if (pending) return;
    setPending(provider); setError(''); setNotice('');
    try {
      const options = { provider, callbackURL: window.location.origin + '/?auth_complete=1', errorCallbackURL: window.location.origin + '/?auth_error=1' };
      const response = linking ? await client.linkSocial(options) : await client.signIn.social(options);
      if (response.error) { setError(authErrorMessage(response.error.code)); setPending(null); }
      else {
        // The client redirects to the provider. Clear the busy state if navigation is prevented.
        window.setTimeout(() => setPending(null), 3000);
      }
    } catch { setError('Could not reach sign-in. Check the server connection and try again.'); setPending(null); }
  };

  const signOut = async () => {
    if (pending) return;
    setPending('sign-out'); setError(''); setNotice('');
    controller.current?.abort(); controller.current = null;
    try {
      const response = await client.signOut();
      if (response.error) throw new Error();
      setAccount(null); setStatus('guest');
      setNotice('You are signed out. Browser drafts remain on this device.');
      channel.current?.postMessage('changed');
      await refresh();
    } catch { setError('Sign-out could not be confirmed. Please retry before leaving this device.'); await refresh(); }
    finally { setPending(null); }
  };

  return { status, account, providers, pending, error, notice, refresh, social, signOut };
}

export type AccountState = ReturnType<typeof useAccount>;
