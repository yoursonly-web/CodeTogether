import { useState } from 'react';
import { Github, HardDrive, Link2, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react';
import type { AccountState, AccountUser, Provider } from '../auth';
import { Dialog } from './Dialog';

export function AccountAvatar({ user, className = '' }: { user?: AccountUser; className?: string }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const initials = user?.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'Y';
  const image = user?.image?.startsWith('https://') ? user.image : null;
  return <span className={'avatar ' + className} aria-hidden="true">{image && image !== failedImage ? <img src={image} alt="" referrerPolicy="no-referrer" onError={() => setFailedImage(image)} /> : initials}</span>;
}

export function AccountDialog({ auth, onClose }: { auth: AccountState; onClose: () => void }) {
  const user = auth.account?.user;
  return <Dialog title={user ? 'Your CodeTogether account.' : 'Make yourself at home.'} eyebrow={user ? 'YOUR ACCOUNT' : 'SIGN IN'} onClose={onClose}>
    {auth.error && <p className="account-message error" role="alert">{auth.error}</p>}
    {auth.notice && <p className="account-message" role="status">{auth.notice}</p>}
    {auth.status === 'checking' ? <div className="account-loading" role="status"><LoaderCircle className="spin" size={18} />Checking your account…</div> : auth.status === 'unavailable' ? <>
      <p className="dialog-description">We could not check your account. Your local editor still works, but sign-in needs a connection to the server and database.</p>
      <button className="button secondary" onClick={() => { void auth.refresh(); }}>Retry account connection</button>
    </> : user ? <>
      <div className="profile-summary"><AccountAvatar user={user} className="avatar-large" /><div><h3>{user.name}</h3><p>{user.email}</p></div></div>
      <p className="account-verified"><ShieldCheck size={14} />{user.emailVerified ? 'Provider-verified email' : 'Email is not verified'}</p>
      <div className="account-providers"><h3>Sign-in methods</h3>{(['google', 'github'] as Provider[]).map(provider => {
        const connected = auth.account?.providers.includes(provider);
        return <div className="provider-row" key={provider}><span className="provider-icon">{provider === 'github' ? <Github size={18} /> : <span className="google-letter">G</span>}</span><div><strong>{provider === 'google' ? 'Google' : 'GitHub'}</strong><small>{connected ? 'Connected' : auth.providers[provider] ? 'Not connected' : 'Not configured on this server'}</small></div>{connected ? <span className="provider-connected">Connected</span> : <button className="button secondary" disabled={Boolean(auth.pending) || !auth.providers[provider] || !user.emailVerified} onClick={() => { void auth.social(provider, true); }}>{auth.pending === provider ? <LoaderCircle size={14} className="spin" /> : <Link2 size={14} />}Connect</button>}</div>;
      })}</div>
      <p className="field-hint">Connecting a second provider requires the same verified email and a recent sign-in. Accounts are never silently merged.</p>
      <button className="button secondary signout-button" disabled={Boolean(auth.pending)} onClick={() => { void auth.signOut(); }}>{auth.pending === 'sign-out' ? <LoaderCircle size={15} className="spin" /> : <LogOut size={15} />}Sign out</button>
    </> : <>
      <p className="dialog-description">Sign in with your Google or GitHub account. You can keep using the local editor as a guest.</p>
      <div className="social-buttons">{(['google', 'github'] as Provider[]).map(provider => <button key={provider} className="button social-button" disabled={Boolean(auth.pending) || !auth.providers[provider]} onClick={() => { void auth.social(provider); }}>{auth.pending === provider ? <LoaderCircle size={19} className="spin" /> : provider === 'github' ? <Github size={19} /> : <span className="google-letter">G</span>}Continue with {provider === 'google' ? 'Google' : 'GitHub'}{!auth.providers[provider] && <small>Not configured</small>}</button>)}</div>
      {(!auth.providers.google || !auth.providers.github) && <p className="field-hint">A disabled provider has not been configured by the application owner yet.</p>}
    </>}
    <div className="dialog-note account-draft-note"><HardDrive size={16} /><span>Drafts belong to this browser, not the signed-in account. Everyone using this browser profile can access them. Signing in does not upload them.</span></div>
    <div className="dialog-actions"><button className="button primary" onClick={onClose}>{user ? 'Back to editor' : 'Continue in local editor'}</button></div>
  </Dialog>;
}
