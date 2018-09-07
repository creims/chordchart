import Chart from './chart.js';

// Constants
const offsetInput = document.getElementById('offset-input');
const patternInput = document.getElementById('pattern-input');
const patternErrSpan = document.getElementById('pattern-error');

// Globals
let chart;
let offset = 0;

// Functions
// Set the error string
function setError(str = '') {
	patternErrSpan.innerText = str;
}

// Parse a pattern and update the chord chart to display it
function setPattern() {
	let s = patternInput.value;
	if(!/^\d+$/.test(s)) {
		setError('Invalid interval pattern. 0-9 or \'A\'/\'B\' for 10/11 only.');
		return;
	}
	
	let intervals = s.split('').map(function(n) {
		if(n == '0') {
			return 10;
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
	chart.drawNotes(intervals, offset);
}

function updateNumStrings(numStrings) {
	chart.setStrings(numStrings);
	setPattern();
}

function updateOffset() {
	const o = Number.parseInt(offsetInput.value, 10);
	if(Number.isNaN(o) || o < 0 || o > 11) {
		setError('Offsets should be between 0 and 11.');
		return;
	}
	
	offset = o;
	setPattern();
}

// Initialize
window.onload = function() {
	const bg = document.getElementById('bg-canvas');
	const fg = document.getElementById('fg-canvas');
	chart = new Chart(bg, fg);
	
	document.getElementById('4strings').onclick = () => { updateNumStrings(4); };
	document.getElementById('6strings').onclick = () => { updateNumStrings(6); };
	document.getElementById('offset-btn').onclick = updateOffset;
	document.getElementById('pattern-btn').onclick = setPattern;
}