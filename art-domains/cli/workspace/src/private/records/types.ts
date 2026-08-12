export interface RepositoryRecord {
	name: string;
	purpose?: string;
	description?: string;
	remote: string;
	consumers?: string;
}

export interface RepositoryCheckoutRecord {
	repo?: RepositoryRecord;
	checkout: CheckoutRecord;
}

export interface CheckoutRecord {
	name: string;
	repository?: string;
	location: string;
	branch: string;
}
