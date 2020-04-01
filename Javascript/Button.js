function Button(id, x, y, name, func) {
	Node.call(this, id, x, y, name)
	this.func = func;
	this.type = "BUTTON";

	this.getString = function() {
		// If a skill or attribute, then show magnitude (e.g. "+4 Strength")
		let string = `${this.name}`
		return string
	}

	this.move = function() {
	}
}