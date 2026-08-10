// Art Mantras — app logic

const FILE = 'data.json';

// --- Persistence ---

async function loadData() {
	const response = await fetch(FILE);
	return response.json();
}

// --- Derivation (pure) ---

function createViewEntry(slot, chosen) {
	return {
		slotId: slot.id,
		letter: slot.letter,
		word: chosen.word,
		source: chosen.source,
		canPromote: chosen.source === 'pool',
	};
}

function createFibWeights(count) {
	const fibs = [];
	for (let i = 0; i < count; i++) {
		if (i < 2) fibs.push(1);
		else fibs.push(fibs[i - 1] + fibs[i - 2]);
	}
	const reversed = fibs.reverse();
	const total = reversed.reduce((sum, n) => sum + n, 0);
	return reversed.map(n => n / total);
}

function pickFromStrong(slot, weights) {
	const r = Math.random();
	let acc = 0;
	for (let i = 0; i < weights.length; i++) {
		acc += weights[i];
		if (r <= acc) return { word: slot.strong[i], source: 'strong' };
	}
	return { word: slot.strong[slot.strong.length - 1], source: 'strong' };
}

function pickFromPool(slot) {
	const strong = new Set(slot.strong);
	const banned = new Set(slot.banned);
	const candidates = slot.pool.filter(word => !strong.has(word) && !banned.has(word));
	if (candidates.length === 0) {
		if (slot.strong.length === 0) {
			const random = Math.floor(Math.random() * slot.pool.length);
			return { word: slot.pool[random], source: 'pool' };
		}
		const random = Math.floor(Math.random() * slot.strong.length);
		return { word: slot.strong[random], source: 'strong' };
	}
	const random = Math.floor(Math.random() * candidates.length);
	return { word: candidates[random], source: 'pool' };
}

function chooseMantraWord(slot) {
	if (slot.constant) return { word: 'Artificial', source: 'constant' };
	if (slot.strong.length === 0) return pickFromPool(slot);
	const coin = Math.random();
	if (coin < 0.5) return pickFromStrong(slot, createFibWeights(slot.strong.length));
	return pickFromPool(slot);
}

function shuffle(data) {
	return data.slots.map(slot => createViewEntry(slot, chooseMantraWord(slot)));
}

// --- Store ---

function createStore(data) {
	function promoteToStrong(slotId, word) {
		const slot = data.slots.find(candidate => candidate.id === slotId);
		slot.strong.push(word);
	}

	return {
		promoteToStrong,
		serialize() {
			return { ...data, slots: [...data.slots] };
		},
	};
}

// --- UI ---

function createButton(title, onPress) {
	const element = document.createElement('button');
	element.textContent = title;
	element.addEventListener('click', () => onPress());
	element.setTitle = t => {
		element.textContent = t;
	};
	element.setEnabled = enabled => {
		element.disabled = !enabled;
	};
	return element;
}

function createToolbar() {
	const element = document.createElement('div');
	element.className = 'toolbar';
	const toolbar = { element, download: () => {}, saveMantra: () => {}, shuffle: () => {} };
	element.append(
		createButton('DOWNLOAD', () => toolbar.download()),
		createButton('+ mantra', () => toolbar.saveMantra()),
		createButton('shuffle', () => toolbar.shuffle()),
	);
	return toolbar;
}

function createMantraRow() {
	const element = document.createElement('section');
	element.className = 'mantra';
	const table = document.createElement('table');
	const body = document.createElement('tbody');
	table.appendChild(body);
	element.appendChild(table);

	const mantra = { element, promote: () => {} };
	mantra.render = output => {
		body.textContent = '';
		for (const entry of output) {
			const row = document.createElement('tr');
			const letterCell = document.createElement('th');
			letterCell.scope = 'row';
			letterCell.textContent = entry.letter;
			row.appendChild(letterCell);
			const wordCell = document.createElement('td');
			wordCell.textContent = entry.word;
			row.appendChild(wordCell);
			const controlCell = document.createElement('td');
			if (entry.source !== 'constant') {
				const button = createButton('+ strong', () => mantra.promote(entry.slotId, entry.word));
				if (entry.source === 'pool') {
					button.setEnabled(true);
				} else {
					button.setTitle('\u2713 strong');
					button.setEnabled(false);
				}
				controlCell.appendChild(button);
			}
			row.appendChild(controlCell);
			body.appendChild(row);
		}
	};
	return mantra;
}

function createStrongsSection() {
	const element = document.createElement('section');
	element.className = 'strongs';
	const title = document.createElement('h3');
	title.textContent = 'Strongs';
	const list = document.createElement('div');
	list.className = 'strongs-list';
	element.append(title, list);

	const strongs = { element, moveUp: () => {}, moveDown: () => {}, ban: () => {} };
	strongs.render = slots => {
		list.textContent = '';
		for (const slot of slots) {
			const table = document.createElement('table');
			const caption = document.createElement('caption');
			caption.textContent = `${slot.letter} ${slot.id}`;
			const body = document.createElement('tbody');
			table.append(caption, body);
			for (let i = 0; i < slot.strong.length; i++) {
				const word = slot.strong[i];
				const row = document.createElement('tr');
				const wordCell = document.createElement('td');
				wordCell.textContent = word;
				row.appendChild(wordCell);
				if (!slot.constant) {
					const controls = document.createElement('td');
					controls.append(
						createButton('^', () => strongs.moveUp(slot.id, i)),
						createButton('v', () => strongs.moveDown(slot.id, i)),
						createButton('X', () => strongs.ban(slot.id, i)),
					);
					row.appendChild(controls);
				}
				body.appendChild(row);
			}
			list.appendChild(table);
		}
	};
	return strongs;
}

function createBannedSection() {
	const element = document.createElement('details');
	element.className = 'banned';
	const summary = document.createElement('summary');
	summary.textContent = 'Banned';
	const list = document.createElement('div');
	list.className = 'banned-list';
	element.append(summary, list);

	const banned = { element, unban: () => {}, banToStrong: () => {} };
	banned.render = slots => {
		list.textContent = '';
		for (const slot of slots) {
			const table = document.createElement('table');
			const caption = document.createElement('caption');
			caption.textContent = `${slot.letter} ${slot.id}`;
			const body = document.createElement('tbody');
			table.append(caption, body);
			for (const word of slot.banned) {
				const row = document.createElement('tr');
				const wordCell = document.createElement('td');
				wordCell.textContent = word;
				row.appendChild(wordCell);
				const controls = document.createElement('td');
				controls.append(
					createButton('?', () => banned.unban(slot.id, word)),
					createButton('+', () => banned.banToStrong(slot.id, word)),
				);
				row.appendChild(controls);
				body.appendChild(row);
			}
			list.appendChild(table);
		}
	};
	return banned;
}

function mount() {
	const toolbar = createToolbar();
	const mantraRow = createMantraRow();
	const strongs = createStrongsSection();
	const banned = createBannedSection();
	document.body.append(toolbar.element, mantraRow.element, strongs.element, banned.element);
	return {
		renderMantra: output => mantraRow.render(output),
		renderStrongs: slots => strongs.render(slots),
		renderBanned: slots => banned.render(slots),
		toolbar,
		mantraRow,
		strongs,
		banned,
	};
}

// --- Entry Point ---

function apply(ui, store, output, onNextShuffle) {
	let currentOutput = output;

	ui.renderMantra(currentOutput);
	ui.renderStrongs(store.serialize().slots);
	ui.renderBanned(store.serialize().slots);

	ui.toolbar.shuffle = () => {
		currentOutput = onNextShuffle();
	};

	ui.mantraRow.promote = (slotId, word) => {
		store.promoteToStrong(slotId, word);
		const entry = currentOutput.find(candidate => candidate.slotId === slotId);
		entry.source = 'strong';
		entry.canPromote = false;
		ui.renderMantra(currentOutput);
		ui.renderStrongs(store.serialize().slots);
	};
}

function run(data) {
	const store = createStore(data);
	const ui = mount();
	const output = shuffle(data);
	const onNextShuffle = () => {
		const out = shuffle(store.serialize());
		ui.renderMantra(out);
		return out;
	};
	apply(ui, store, output, onNextShuffle);
}

async function main() {
	const data = await loadData();
	run(data);
}

document.addEventListener('DOMContentLoaded', main);
