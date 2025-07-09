ALTER TYPE "AuthorizationPermissions" RENAME TO "AuthorizationScopes";
ALTER TABLE "Authorization" RENAME COLUMN "permissions" to "scopes";
