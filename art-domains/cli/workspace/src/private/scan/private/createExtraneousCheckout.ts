import type { WorkspaceConfig } from '../../../config/types';
import { createCheckout } from '../../store/createCheckout';
import type { Checkout } from '../../store/types';

export function createExtraneousCheckout(config: WorkspaceConfig, location: string): Checkout {
	return createCheckout(config, location, undefined, '', location);
}
