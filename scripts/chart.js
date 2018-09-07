// Consts
const lineHeight = 40;
const lineWidth = lineHeight;
const margin = 10;
const radius = Math.round(lineHeight * 0.3);
const vertOffset = radius + 5;
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
function Chart(bgCanvas, fgCanvas) {
	this.bgCanvas = bgCanvas;
	this.fgCanvas = fgCanvas;
	this.bgCtx = bgCanvas.getContext('2d');
	this.fgCtx = fgCanvas.getContext('2d');
	this.numFrets = 12;
	this.offset = 0;
	this.highlight = true;
	this.intervals = [2, 2, 1, 2, 2, 2, 1]; // Major scale by default
	this.setTuning([5, 5, 5]); // Bass by default
}

// Resize canvas and draw chart background
Chart.prototype.drawBG = function() {
	// Resize canvases
	let height = lineHeight * (this.numStrings - 1) + vertOffset * 2;
	let width = lineWidth * this.numFrets + 2 * margin;
	this.bgCanvas.height = height;
	this.bgCanvas.width = width;
	this.fgCanvas.height = height;
	this.fgCanvas.width = width;
	
	// Draw grid
	this.bgCtx.beginPath();
	
	// Draw strings
	let y = vertOffset;
	const endX = width - margin;
	for(let i = 0; i < this.numStrings; i++) {
		this.bgCtx.moveTo(margin, y);
		this.bgCtx.lineTo(endX, y);
		y += lineHeight;
	}
	
	// Draw fret lines
	let x = margin;
	const endY = height - vertOffset;
	for(let i = 0; i < this.numFrets + 1; i++) {
		this.bgCtx.moveTo(x, vertOffset);
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
	const x = (fret + 0.5) * lineWidth + margin;
	const y = string * lineHeight + vertOffset;
	
	this.fgCtx.fillStyle = color;
	this.fgCtx.beginPath();
	this.fgCtx.arc(x, y, radius, 0, twopi);
	this.fgCtx.fill();
};

Chart.prototype.setIntervals = function(intervals) {
	this.intervals = intervals;
	this.drawNotes();
};

Chart.prototype.toggleHighlight = function() {
	this.highlight = !this.highlight;
	this.drawNotes();
};

Chart.prototype.toggleFrets = function() {
	if(this.numFrets == 12) {
		this.numFrets = 24;
	} else {
		this.numFrets = 12;
	}
	
	this.drawBG();
	this.drawNotes();
};

Chart.prototype.drawNotes = function() {
	// Clear the chart
	this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);
	
	const tuneIter = this.tuning[Symbol.iterator]();
	let fret;
	let currTune;
	let startFret = this.offset;
	for(let string = this.numStrings - 1; string >= 0; string--) {
		fret = startFret;
		
		let fretsSpanned = 0;
		for(let i = 0; fretsSpanned < this.numFrets; i++) {
			// Wrap interval index if we have to
			if(i == this.intervals.length) {
				i = 0;
			}
			
			// Draw the corresponding note
			let color;
			if(i == 0 && this.highlight) {
				color = 'red';
			} else {
				color = 'blue';
			}
			this.drawNote(fret, string, color);
			fret = clock(fret + this.intervals[i], this.numFrets);
			fretsSpanned += this.intervals[i];
		}
		
		const currTune = tuneIter.next(); 
		if(!currTune.done) {
			startFret = clock(startFret - currTune.value, this.numFrets);
		}
	}
};

export default Chart;