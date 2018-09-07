// Consts
const lineHeight = 80;
const lineWidth = lineHeight;
const margin = 10;
const radius = Math.round(lineHeight * 0.3);
const vertOffset = radius + 5;
const numFrets = 12;
const twopi = Math.PI * 2;

// TODO: This will be replaced later
let tuneDefaults = {};
tuneDefaults[4] = [5, 5, 5];
tuneDefaults[6] = [5, 5, 5, 4, 5];

// Constructor
function Chart(bgCanvas, fgCanvas) {
	this.bgCanvas = bgCanvas;
	this.fgCanvas = fgCanvas;
	this.bgCtx = bgCanvas.getContext('2d');
	this.fgCtx = fgCanvas.getContext('2d');
	this.setStrings(4);
}

// Resize canvas and draw chart background
Chart.prototype.setStrings = function(numStrings) {
	this.numStrings = numStrings;
	this.tuning = tuneDefaults[numStrings];
	// Resize canvases
	let height = lineHeight * (numStrings - 1) + vertOffset * 2;
	let width = lineWidth * numFrets + 2 * margin;
	this.bgCanvas.height = height;
	this.bgCanvas.width = width;
	this.fgCanvas.height = height;
	this.fgCanvas.width = width;
	
	// Draw grid
	this.bgCtx.beginPath();
	
	// Draw strings
	let y = vertOffset;
	const endX = width - margin;
	for(let i = 0; i < numStrings; i++) {
		this.bgCtx.moveTo(margin, y);
		this.bgCtx.lineTo(endX, y);
		y += lineHeight;
	}
	
	// Draw fret lines
	let x = margin;
	const endY = height - vertOffset;
	for(let i = 0; i < numFrets + 1; i++) {
		this.bgCtx.moveTo(x, vertOffset);
		this.bgCtx.lineTo(x, endY);
		x += lineWidth;
	}
	
	this.bgCtx.stroke();
};

Chart.prototype.drawNote = function(fret, string, color) {
	const x = (fret + 0.5) * lineWidth + margin;
	const y = string * lineHeight + vertOffset;
	
	this.fgCtx.fillStyle = color;
	this.fgCtx.beginPath();
	this.fgCtx.arc(x, y, radius, 0, twopi);
	this.fgCtx.fill();
};

Chart.prototype.drawNotes = function(intervals, startFret = 0) {
	// Clear the chart
	this.fgCtx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);
	
	const tuneIter = this.tuning[Symbol.iterator]();
	let fret;
	let currTune;
	for(let string = this.numStrings - 1; string >= 0; string--) {
		fret = startFret;
		
		for(let i = 0; i < intervals.length; i++) {
			this.drawNote(fret, string, i == 0 ? 'red' : 'blue');
			fret = (fret + intervals[i]) % 12;
		}
		
		const currTune = tuneIter.next(); 
		if(!currTune.done) {
			startFret = (startFret - currTune.value) % 12;
			if(startFret < 0) {
				startFret += 12;
			}
		}
	}
};

export default Chart;