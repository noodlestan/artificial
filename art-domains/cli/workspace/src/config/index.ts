export { defineConfig, locateCheckouts } from './define-config';
export { loadWorkspaceConfig } from './load-config';
export { verifyCheckouts } from './verify-checkouts';
export type { VerifyNeeds } from '../types';
export type {
	CheckoutConfig,
	RepositoryCheckout,
	RepositoryRecord,
	WorkspaceConfig,
	WorkspaceRecord,
} from './types';
