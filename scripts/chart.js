import { clock } from './utils.js';

// Consts
const defaultNoteColor = 'blue';
const defaultColors = ['#000000', '#e00000', '#e06000', '#e0b000', '#e0e000', '#a0e000',
					   '#00e000', '#00d0b0', '#00a0f0', '#0060f0', '#6000f0', '#c000e0'];

const lineHeight = 40;
const lineWidth = lineHeight;
const horizontalMargin = 10;
const verticalMargin = 5;

const fontSize = 28;
const fretLabelX = horizontalMargin + lineWidth / 2;

const noteRadius = Math.round(lineHeight * 0.3);
const fretTop = fontSize + noteRadius + verticalMargin * 2;

const twopi = Math.PI * 2;

// Constructor
function Chart(bgCanvas, fgCanvas) {
	this.bgCanvas = bgCanvas;
	this.bgCtx = bgCanvas.getContext('2d');
	this.bgCtx.font = '48px serif';
	
	
	this.fgCanvas = fgCanvas;
	this.fgCtx = fgCanvas.getContext('2d');
	
	this.numFrets = 13;
	this.offset = 0;
	this.colorNotes = true;
	this.colors = defaultColors;
	this.notes = [true, false, true, false, true, true, false, true, false, true, false, true]; // Major scale by default
	
	this.setTuning([5, 5, 5]); // Bass by default
}

// Resize canvas and draw chart background
Chart.prototype.drawBG = function() {
	// Resize canvases
	let height = lineHeight * (this.numStrings - 1) + fretTop + noteRadius + verticalMargin;
	let width = lineWidth * this.numFrets + 2 * horizontalMargin;
	
	this.bgCanvas.height = height;
	this.bgCanvas.width = width;
	this.fgCanvas.height = height;
	this.fgCanvas.width = width;

	// Draw labels
	this.bgCtx.font = fontSize + 'px serif';
	this.bgCtx.textAlign = 'center';
	this.bgCtx.textBaseline = 'top';
	
	let label = 0;
	let labelX = fretLabelX;
	for(let i = 0; i < this.numFrets; i++) {
		this.bgCtx.fillText(label.toString(), labelX, verticalMargin);
		label++;
		labelX += lineWidth;
		if(label == 13) {
			label = 1;
		}
	}
	
	// Draw grid
	this.bgCtx.beginPath();
	
	// Draw strings
	let y = fretTop;
	const endX = width - horizontalMargin;
	for(let i = 0; i < this.numStrings; i++) {
		this.bgCtx.moveTo(horizontalMargin, y);
		this.bgCtx.lineTo(endX, y);
		y += lineHeight;
	}
	
	// Draw fret lines
	let x = horizontalMargin;
	const endY = height - verticalMargin - noteRadius;
	for(let i = 0; i < this.numFrets + 1; i++) {
		this.bgCtx.moveTo(x, fretTop);
		this.bgCtx.lineTo(x, endY);
		x += lineWidth;
	}
	
	this.bgCtx.stroke();
};

// Set the tuning and redraw
Chart.prototype.setTuning = function(tuning) {
	this.numStrings = tuning.length + 1;
	this.tuning = tuning;
	
	// Tuning necessitates both notes and background redraw
	this.drawBG();
	this.drawNotes();
};

// Draw a single note on the foreground canvas
Chart.prototype.drawNote = function(fret, string, color) {
	const x = (fret + 0.5) * lineWidth + horizontalMargin;
	const y = string * lineHeight + fretTop;
	
	this.fgCtx.fillStyle = color;
	this.fgCtx.strokeStyle = 'black';
	this.fgCtx.beginPath();
	this.fgCtx.arc(x, y, noteRadius, 0, twopi);
	this.fgCtx.fill();
	this.fgCtx.stroke();
};

Chart.prototype.setPattern = function(offset, intervals) {
	this.offset = offset;
	
	let notes = new Array(12).fill(false);
	
	notes[0] = true;
	let idx = 0;
	for(let i = 0; i < intervals.length - 1; i++) {
		idx += intervals[i];
		notes[idx] = true;
	}
	
	this.notes = notes;
	this.drawNotes();
};

Chart.prototype.setColorNotes = function(bool) {
	this.colorNotes = bool;
	this.drawNotes();
};

Chart.prototype.setMoreFrets = function(bool) {
	if(bool) {
		this.numFrets = 25;
	} else {
		this.numFrets = 13;
	}
	
	this.drawBG();
	this.drawNotes();
};

Chart.prototype.drawNotes = function() {
	// Clear the chart
	this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);
	const tuneIter = this.tuning[Symbol.iterator]();
	let currTune;
	let startFret = this.offset;
	let fret;
	
	// Draw notes from bottom string up
	for(let string = this.numStrings - 1; string >= 0; string--) {
		// Draw the note if it's in the scale
		for(let i = 0; i < this.numFrets; i++) {
			// The fret we're concerned with is offset from the start fret
			fret = clock(i - startFret, 12);
			if(this.notes[fret] == true) {
				let color;
				if(this.colorNotes) {
					color = this.colors[fret];
				} else {
					color = defaultNoteColor;
				}
				
				this.drawNote(i, string, color);
			}
		}
		
		// Subtract the tuning value from the start fret
		const currTune = tuneIter.next(); 
		if(!currTune.done) {
			startFret = clock(startFret - currTune.value, 12);
		}
	}
};

// Set colors
Chart.prototype.setColor = function(index, color) {
	this.colors[index] = color;
	this.drawNotes();
};

export default Chart;