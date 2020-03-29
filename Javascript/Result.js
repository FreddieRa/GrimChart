function Result(id, x, y, name) {
	Node.call(this, id, x, y, name)
	this.normal = 0;
	this.mortal = 0;
	this.type = "RESULT";

	this.getString = function() {
		// If a skill or attribute, then show magnitude (e.g. "+4 Strength")
		let string = ""
		string = `Result: `
		string = this.normal ? string + this.normal.toFixed(2) + "; " : string
		string = this.mortal ? string + this.mortal.toFixed(2) + " MW" : string
		return string
	}

	this.calculate = function() {
		this.normal = 0;
		this.mortal = 0;
		this.probability.true = 0
		for (let [id, val] of Object.entries(inputs[this.id])) {
			let node = nodes[id]
			if (node.calculated == false) {
				node.calculate()
			}
			// A "RESULT" cannot follow anything but a "DAMAGE"
			if (node.type != "DAMAGE") {
				break;
			} else {
				if (node.mortal) {
					this.mortal += node.average
				} else {
					this.normal += node.average
				}
			}
		}
		this.unchanged = true
		this.calculated = true
	}
}