import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import simpleGit from 'simple-git';
import { afterEach, describe, expect, it } from 'vitest';

import { commitFile } from '../../test/commitFile';
import { createCommandContext } from '../../test/createCommandContext';
import { initGitRepo } from '../../test/initGitRepo';
import { initWorkingRepo } from '../../test/initWorkingRepo';
import { makeTempDir } from '../../test/makeTempDir';
import { removeTempDirs } from '../../test/removeTempDirs';
import { scanCheckoutState } from '../scan/scanCheckoutState';
import { createCheckout } from '../store/createCheckout';

import { pullCheckout } from './pullCheckout';

const tempDirs: string[] = [];

afterEach(() => {
	removeTempDirs(tempDirs);
});

describe('pullCheckout', () => {
	it('pulls a behind checkout and clears the behind state', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const bareDir = makeTempDir(tempDirs);
		const repoDir = join(tempDir, ctx.config.clone.path, 'behind');
		await initWorkingRepo(repoDir, bareDir);

		const otherDir = makeTempDir(tempDirs);
		await simpleGit(otherDir).clone(bareDir, otherDir);
		const otherGit = simpleGit(otherDir);
		await otherGit.addConfig('user.email', 'test@example.com');
		await otherGit.addConfig('user.name', 'Test');
		writeFileSync(join(otherDir, 'origin.txt'), 'origin');
		await otherGit.add('.');
		await otherGit.commit('origin change');
		await otherGit.push('origin', 'main');

		const git = simpleGit(repoDir);
		await git.fetch('origin', 'main');

		const checkout = createCheckout(ctx.config, 'behind', {
			name: 'Behind',
			remote: 'git@example.com:behind.git',
		});
		const scanned = await scanCheckoutState(ctx, checkout);
		expect(scanned.isBehind).toBe(true);

		await pullCheckout(ctx, scanned);

		const after = ctx.store.getCheckoutForLocation('behind');
		expect(after).toBeDefined();
		expect(after?.isBehind).toBe(false);
		expect(after?.issues.some(i => i.includes('behind'))).toBe(false);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('success');

		expect(existsSync(join(repoDir, 'origin.txt'))).toBe(true);
	});

	it('logs a failure when the pull fails', async () => {
		const tempDir = makeTempDir(tempDirs);
		const ctx = createCommandContext(tempDir);
		const repoDir = join(tempDir, ctx.config.clone.path, 'nopull');
		await initGitRepo(repoDir);
		await commitFile(repoDir, 'file.txt');

		const checkout = createCheckout(ctx.config, 'nopull', {
			name: 'NoPull',
			remote: 'git@example.com:nopull.git',
		});
		checkout.exists = true;
		checkout.issues = ['1 commit behind'];

		await pullCheckout(ctx, checkout);

		const ops = ctx.log.all();
		expect(ops).toHaveLength(1);
		expect(ops[0].operation).toBe('pull');
		expect(ops[0].outcome).toBe('failure');
		expect(ops[0].message()).toBeTruthy();

		const after = ctx.store.getCheckoutForLocation('nopull');
		expect(after).toBeDefined();
		expect(after?.issues).toContain(ops[0].message());
	});
});
