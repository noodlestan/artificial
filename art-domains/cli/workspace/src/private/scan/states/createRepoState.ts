import type { CheckoutStateRepo } from '../types';

export const createRepoState = (known: boolean): CheckoutStateRepo => ({ type: 'repo', known });
