const { AthStore: store, AthSync: sync } = window;

function displayName(email, name) {
  return name?.trim().slice(0, 40) || email.split('@')[0].slice(0, 40) || 'Leerling';
}

export async function makeGuest(name) {
  return store.createProfile({ name: name || 'Leerling', apps: ['paideia', 'scriptorium'] });
}

export async function authenticate({ email, password, mode, name, current }) {
  email = email.trim();
  const { url, key } = sync.defaults();
  const auth = await sync.rawRequest(url, key, mode === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!auth.access_token) return { needsConfirmation: true };
  if (!auth.user?.id) throw new Error('De accountgegevens konden niet geladen worden.');

  const existing = store.loadProfiles().find(profile => profile.cloud_user_id === auth.user.id);
  const mayKeepGuest = current && !current.cloud_user_id && !current.pin_hash;
  const profile = existing || (mayKeepGuest ? current : await makeGuest(displayName(email, name)));
  sync.adoptSession(profile.id, { url, key, email, auth });
  // Existing cloud profiles can re-open Scriptorium and legacy Paideia on a new device.
  if (!existing && mode === 'login') {
    try {
      const remote = await sync.pull(profile.id);
      if (remote?.profile) await sync.apply(profile.id, remote);
    } catch (error) {
      console.warn('Klassiek profiel ophalen:', error.message);
    }
  } else if (!existing && name && mayKeepGuest) {
    await store.updateProfile(profile.id, { name: displayName(email, name) });
  }
  return { profile: store.loadProfiles().find(p => p.id === profile.id) || profile };
}

export function authMessage(error) {
  const msg = String(error?.message ?? '');
  if (/invalid login|invalid credentials/i.test(msg)) return 'E-mail of wachtwoord klopt niet.';
  if (/not confirmed/i.test(msg)) return 'Bevestig eerst je e-mailadres en meld je daarna aan.';
  if (/rate limit|429/i.test(msg)) return 'Er waren te veel pogingen. Wacht even en probeer opnieuw.';
  if (/already registered|already exists/i.test(msg)) return 'Dit e-mailadres heeft al een account. Kies Aanmelden.';
  if (/email_address_not_authorized|email address.*not authorized|smtp|sending confirmation email/i.test(msg)) {
    return 'De mailserver kan momenteel geen bevestiging versturen. Je kunt meteen op dit toestel leren en later opnieuw proberen.';
  }
  if (/password/i.test(msg)) return 'Kies een wachtwoord van minstens 10 tekens.';
  if (!navigator.onLine) return 'Je bent offline. Lokaal oefenen kan gewoon verder.';
  return 'Aanmelden is tijdelijk niet gelukt. Probeer het zo opnieuw.';
}
