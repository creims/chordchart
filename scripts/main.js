import Chart from './chart.js';
import Keyboard from './keyboard.js';
import { clock } from './utils.js';

// Constants
const tuningInput = document.getElementById('tuning-input');
const offsetInput = document.getElementById('offset-input');
const patternInput = document.getElementById('pattern-input');
const errorSpan = document.getElementById('error-span');
const colorNotes = document.getElementById('color-notes');
const moreFrets = document.getElementById('more-frets');

const saveLoadBtn = document.getElementById('save-load-btn');
const saveLoadTextArea = document.getElementById('save-load-textarea');
const saveLoadMenu = document.getElementById('save-load-menu');
const closeBtn = document.getElementById('close-btn');

const tuningFour = '555';
const tuningSix = '55545';

const loadFuncs = {
	"tuning": function(tuning) {
		tuningInput.value = tuning;
		updateTuning(tuning);
	},
	"noteOffset": function(offset) {
		offsetInput.value = offset;
		updateOffset(offset);
	},
	"pattern": function(pattern) {
		patternInput.value = pattern;
		updatePattern();
	},
	"colors": function(colors) {
		for(let k of Object.keys(colors)) {
			const e = document.getElementById('colors' + k);
			if(!e) {
				setError('Invalid color key: ' + k);
				continue;
			}
			
			e.value = colors[k];
			updateColor(Number.parseInt(k), e.value);
		}
		
		updateVisuals();
	},
	"colorNotes": function(bool) {
		colorNotes.checked = bool;
		chart.setColorNotes(bool);
	},
	"moreFrets": function(bool) {
		moreFrets.checked = bool;
		chart.setMoreFrets(bool);
	}
};

// Globals
let options = {
	"tuning": '555',
	"noteOffset": '0',
	"pattern": '2212221',
	"colors": {
		'0':'#000000', '1':'#e00000', '2':'#e06000', '3':'#e0b000', '4':'#e0e000', '5':'#a0e000',
		'6':'#00e000', '7':'#00d0b0', '8':'#00a0f0', '9':'#0060f0', '10':'#6000f0', '11':'#c000e0'
	},
	"colorNotes": true,
	"moreFrets": false
};
let chart;
let keyboard;

let intervals = [2, 2, 1, 2, 2, 2, 1];
let guitarOffset = 0;
let keyboardOffset = 7;

// Functions
// Load options from an options object
function loadOptions(opts) {
	for(let key of Object.keys(opts)) {
		if(!loadFuncs[key]) {
			setError('Unknown option: ' + key);
			continue;
		}
		
		(loadFuncs[key])(opts[key]);
	}
}

// Set the error string
function setError(str = '') {
	errorSpan.innerText = str;
}

// Parse a pattern and update the chord chart to display it
function updatePattern() {
	let s = patternInput.value;
	if(!/^[1-9AaBb]+$/.test(s)) {
		setError('Invalid interval pattern. 0-9 or \'A\'/\'B\' for 10/11 only.');
		return;
	}
	
	intervals = s.split('').map(function(n) {
		if(n == 'A' || n == 'a') {
			return 10;
		} else if(n == 'B' || n == 'b') {
			return 11;
		} else {
			return Number.parseInt(n);
		}
	});
	let i;
	let total = 0;
	for(i = 0; i < intervals.length; i++) {
		total += intervals[i];
		if(total > 12) {
			break;
		}
	}
	
	if(total > 12) { // Truncate to an octave
		total -= intervals[i];
		intervals = intervals.slice(0, i);
		
		if(total < 12) {
			intervals.push(12 - total);
		}
		
		setError('Pattern exceeded an octave; truncated to ' 
			+ (intervals.length + 1) + ' notes.');
	} else if(total < 12) { // Finish the octave
		intervals.push(12 - total);
		setError();
	} else { // Octave is perfectly complete
		setError();
	}
	
	let patternString = intervals.reduce((str, curr) => str + curr, '');
	patternInput.value = patternString;
	options['pattern'] = patternString;
	
	updateVisuals();
}

// Update string tuning and redraw chart
function updateTuning(tuning) {
	if(!/^\d+$/.test(tuning)) {
		setError('Invalid tuning pattern. 0-9 only.');
		return;
	}
	
	tuning = tuning.split('').map(e => Number.parseInt(e));
	chart.setTuning(tuning);
	setError();
	options['tuning'] = tuningInput.value;
}

// Update the keyboard note offset
function updateOffset() {
	const o = Number.parseInt(offsetInput.value, 10);
	if(Number.isNaN(o) || o < 0 || o > 11) {
		setError('Offsets should be between 0 and 11.');
		return;
	}
	
	guitarOffset = o;
	keyboardOffset = clock(o - 5, 12);
	updateVisuals();
	setError();
	options['noteOffset'] = offsetInput.value;
}

// Update a note color setting
function updateColor(interval, color) {
	chart.setColor(interval, color);
	options['colors']['' + interval] = color;
}

function updateVisuals() {
	chart.setPattern(guitarOffset, intervals);
	keyboard.setPattern(keyboardOffset, intervals);
}

function enableElement(e) {
	e.style.zIndex = '2';
	e.style.display = 'block';
}

function disableElement(e) {
	e.style.zIndex = '-2';
	e.style.display = 'none';
}

// Initialize
window.onload = function() {	
	// Initialize charts
	const gbg = document.getElementById('guitar-bg-canvas');
	const gfg = document.getElementById('guitar-fg-canvas');
	chart = new Chart(gbg, gfg);
	
	const kbg = document.getElementById('keyboard-bg-canvas');
	const kfg = document.getElementById('keyboard-fg-canvas');
	keyboard = new Keyboard(kbg, kfg);
	
	// Set up event handlers
	document.getElementById('4strings').onclick = () => { loadFuncs['tuning'](tuningFour); };
	document.getElementById('6strings').onclick = () => { loadFuncs['tuning'](tuningSix); };
	document.getElementById('tuning-btn').onclick = () => { updateTuning(tuningInput.value); };
	document.getElementById('offset-btn').onclick = updateOffset;
	document.getElementById('pattern-btn').onclick = updatePattern;
	colorNotes.onchange = () => {
		chart.setColorNotes(colorNotes.checked);
		options['colorNotes'] = colorNotes.checked;
	};
	moreFrets.onchange = () => {
		chart.setMoreFrets(moreFrets.checked);
		options['moreFrets'] = moreFrets.checked;
	};
	
	
	// Color input handlers
	for(let i = 0; i < 12; i++) {
		const e = document.getElementById('colors' + i);
		e.onchange = () => { updateColor(i, e.value) };
	}
	
	// Save/load handlers
	saveLoadBtn.onclick = () => {
		saveLoadTextArea.value = JSON.stringify(options, null, 2);
		disableElement(saveLoadBtn);
		
		enableElement(saveLoadTextArea);
		enableElement(saveLoadMenu);
	};
	document.getElementById('load-btn').onclick = () => {
		let newOpts = JSON.parse(saveLoadTextArea.value);
		loadOptions(newOpts);
		closeBtn.onclick();
	};
	document.getElementById('copy-btn').onclick = () => {
		saveLoadTextArea.select();
		document.execCommand("copy");
		setError('Load code copied to clipboard.');
	};
	closeBtn.onclick = () => {
		disableElement(saveLoadTextArea);
		disableElement(saveLoadMenu);
		
		enableElement(saveLoadBtn);
	};
	
	// Initialize default options
	loadOptions(options);
}