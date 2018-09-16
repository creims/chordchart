import Chart from './chart.js';

// Constants
const tuningInput = document.getElementById('tuning-input');
const offsetInput = document.getElementById('offset-input');
const patternInput = document.getElementById('pattern-input');
const errorSpan = document.getElementById('error-span');
const colorNotes = document.getElementById('color-notes');
const moreFrets = document.getElementById('more-frets');

const tuningFour = '555';
const tuningSix = '55545';
const defaultColors = ['red', 'blue', 'green', 'yellow', '#bfef45', '#911eb4', 
					   '#ffd8b1', 'orange', 'cyan', 'magenta', 'beige', '#469990'];

// Globals
let chart;

// Functions
// Set the error string
function setError(str = '') {
	errorSpan.innerText = str;
}

// Parse a pattern and update the chord chart to display it
function setPattern() {
	let s = patternInput.value;
	if(!/^[1-9AaBb]+$/.test(s)) {
		setError('Invalid interval pattern. 0-9 or \'A\'/\'B\' for 10/11 only.');
		return;
	}
	
	let intervals = s.split('').map(function(n) {
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
		if(total > 11) {
			break;
		}
	}
	
	if(total > 11) {
		total -= intervals[i];
		intervals = intervals.slice(0, i);
		setError('Pattern exceeded an octave; truncated to ' 
			+ (intervals.length + 1) + ' notes.');
	} else {
		setError();
	}
	
	intervals.push(12 - total);
	chart.setIntervals(intervals);
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
}

// For buttons for common tunings
function loadTuningPreset(preset) {
	updateTuning(preset);
	tuningInput.value = preset;
}

// Update the note offset
function updateOffset() {
	const o = Number.parseInt(offsetInput.value, 10);
	if(Number.isNaN(o) || o < 0 || o > 11) {
		setError('Offsets should be between 0 and 11.');
		return;
	}
	
	chart.setOffset(o);
	setError();
}

// Initialize
window.onload = function() {
	// Reset options
	tuningInput.value = tuningFour;
	offsetInput.value = '0';
	patternInput.value = '221222';
	colorNotes.checked = true;
	moreFrets.checked = false;
	
	// Initialize chart
	const bg = document.getElementById('bg-canvas');
	const fg = document.getElementById('fg-canvas');
	chart = new Chart(bg, fg, defaultColors);
	
	// Set up event handlers
	document.getElementById('4strings').onclick = () => { loadTuningPreset(tuningFour); };
	document.getElementById('6strings').onclick = () => { loadTuningPreset(tuningSix); };
	document.getElementById('tuning-btn').onclick = () => { updateTuning(tuningInput.value); };
	document.getElementById('offset-btn').onclick = updateOffset;
	document.getElementById('pattern-btn').onclick = setPattern;
	colorNotes.onchange = () => { chart.toggleColors(); };
	moreFrets.onchange = () => { chart.toggleFrets(); };
	
	// Color input handlers
	for(let i = 0; i < 12; i++) {
		const e = document.getElementById('colors' + i);
		e.onchange = () => {
			chart.setColor(i, e.value);
		};
		
		e.value = defaultColors[i];
	}
}