// Converts an integer n to clock c (positive integer modulo math)
// Returns NaN if n or c are not both integers or if c is not > 0
function clock(n, c) {
	if(!Number.isInteger(n) || !Number.isInteger(c) || c < 1) {
		return NaN;
	}
	n = n % c;
	return n < 0 ? n + c : n;
}

export { clock };