function Roll(id, x, y, name, number, dice) {
	Node.call(this, id, x, y, name)
	this.number = number;
	this.dice = dice;
	this.type = "ROLL";

	this.getString = function() {
		let string = "";
		string = `${this.name}: ${this.number}d${this.dice}`;
		return string;
	}
	
	this.calculate = function() {
		this.multiplier = int(this.number)
		this.probability.true = Object.keys(inputs[this.id]).length ? 0 : 1
		for (let [id, val] of Object.entries(inputs[this.id])) {
			let node = nodes[id];
			if(node.calculated == false){node.calculate()}
			// An "ROLL" cannot follow a "ROLL"
			if (node.type == "ROLL") {
				break;
			} else {
				// this.number = node.number;
				// this.dice = node.dice;
				this.multiplier =  int(this.number)*node.multiplier

				this.probability.true += node.probability[val];
			}
		}
		this.cost = this.probability.true
		this.calculated = true;
	}
}