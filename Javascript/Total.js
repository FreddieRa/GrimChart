function Total(id, x, y, name, operator, target) {
	Node.call(this, id, x, y, name)
	this.operator = operator;
	this.target = target;
	this.type = "TOTAL"

	this.getString = function() {
		let string = ""
		string = `IF Total ${this.operator} ${this.target}`
		return string
	}

	// This can probably be refactored down the line
	this.calculate = function() {
		// This should usually only trigger once 
		for (let [id, val] of Object.entries(inputs[this.id])) {
			let node = nodes[id]
			if(node.calculated == false){node.calculate()}
			// An "EACH" cannot follow a "TOTAL" and vice-versa
			if (node.type == "EACH") {
				break;
			} else {
				this.multiplier = 1;
				this.number = node.number;
				this.dice = node.dice;

				this.probability.true = applyOperator(node.number, node.dice, this.target, this.operator)
				let type = node.type != "DAMAGE" ? node.type : node.parentType

				switch (type) {
					case "ROLL":
						this.probability.false = 1 - this.probability.true;
						// Scale to the probability of the above roll happening
						this.probability.true *= node.probability[val]
						this.probability.false *= node.probability[val]
						break;
					case "TOTAL":
						this.probability.false = node.probability[val] - this.probability.true;
						break;
				}
			}
		}
		this.cost = this.probability.true
		this.calculated = true
	}
}