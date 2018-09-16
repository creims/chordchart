// Consts
const defaultNoteColor = 'blue';

const lineHeight = 40;
const lineWidth = lineHeight;
const horizontalMargin = 10;
const verticalMargin = 5;

const fontSize = 28;
const fretLabelX = horizontalMargin + lineWidth / 2;

const noteRadius = Math.round(lineHeight * 0.3);
const fretTop = fontSize + noteRadius + verticalMargin * 2;

const twopi = Math.PI * 2;

// Helpers
// Converts an integer n to clock c (positive integer modulo math)
// Returns NaN if n or c are not both integers or if c is not > 0
function clock(n, c) {
	if(!Number.isInteger(n) || !Number.isInteger(c) || c < 1) {
		return NaN;
	}
	n = n % c;
	return n < 0 ? n + c : n;
}

// Constructor
function Chart(bgCanvas, fgCanvas, colors) {
	this.bgCanvas = bgCanvas;
	this.bgCtx = bgCanvas.getContext('2d');
	this.bgCtx.font = '48px serif';
	
	
	this.fgCanvas = fgCanvas;
	this.fgCtx = fgCanvas.getContext('2d');
	
	this.numFrets = 13;
	this.offset = 0;
	this.colorNotes = true;
	this.colors = colors;
	this.notes = [true, false, true, false, true, true, false, true, false, true, false, true, true]; // Major scale by default
	
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

Chart.prototype.setOffset = function(offset) {
	this.offset = offset;
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

Chart.prototype.setIntervals = function(intervals) {
	let notes = new Array(12).fill(false);
	
	let idx = 0;
	for(let i of intervals) {
		idx = clock(idx + i, 12);
		notes[idx] = true;
	}
	
	this.notes = notes;
	this.drawNotes();
};

Chart.prototype.toggleColors = function() {
	this.colorNotes = !this.colorNotes;
	this.drawNotes();
};

Chart.prototype.toggleFrets = function() {
	if(this.numFrets == 13) {
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
		fret = startFret;
		// Draw the note if it's in the scale
		for(let i = 0; i < this.numFrets; i++) {
			if(this.notes[fret] == true) {
				let color;
				if(this.colorNotes) {
					color = this.colors[fret];
				} else {
					color = defaultNoteColor;
				}
				
				this.drawNote(i, string, color);
			}
			
			fret = clock(fret + 1, 12);
		}
		
		// Subtract the tuning value from the start fret
		const currTune = tuneIter.next(); 
		if(!currTune.done) {
			startFret = clock(startFret + currTune.value, 12);
		}
	}
};

// Set colors
Chart.prototype.setColor = function(index, color) {
	this.colors[index] = color;
	this.drawNotes();
};

export default Chart;