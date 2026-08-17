export interface CheckoutScan {
	exists: boolean;
	branch: string | null;
	hasRemote: boolean;
	remoteBranch: string | null;
	detached: boolean;
	conflicts: boolean;
	dirty: boolean;
	unpushed: number;
	isBehind: boolean;
	issues: string[];
}
