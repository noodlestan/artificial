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
	it('pulls a behind checkout and returns the updated state', async () => {
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
		const scanned = await scanCheckoutState(checkout);
		expect(scanned.isBehind).toBe(true);

		const result = await pullCheckout(scanned);

		expect(result.isBehind).toBe(false);
		expect(result.issues.some(i => i.includes('behind'))).toBe(false);
		expect(existsSync(join(repoDir, 'origin.txt'))).toBe(true);
	});

	it('throws when the pull fails', async () => {
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

		await expect(pullCheckout(checkout)).rejects.toBeTruthy();
	});
});
