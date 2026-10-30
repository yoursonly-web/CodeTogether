-- Provider identity is stable; names and emails must not be used as identity keys.
CREATE UNIQUE INDEX account_provider_identity_unique ON "account" ("providerId", "accountId");
CREATE UNIQUE INDEX user_email_lower_unique ON "user" (lower("email"));
CREATE INDEX session_expiry_idx ON "session" ("expiresAt");
CREATE INDEX verification_expiry_idx ON "verification" ("expiresAt");
