function Each(id, x, y, name, operator, target) {
	Node.call(this, id, x, y, name)
	this.operator = operator;
	this.target = target;
	this.type = "EACH"

	this.getString = function() {
		let string = ""
		string = `IF Each ${this.operator} ${this.target}`
		return string
	}

	this.calculate = function() {
		// This should usually only trigger once 
		for (let [id, val] of Object.entries(inputs[this.id])) {
			let node = nodes[id]
			if(node.calculated == false){node.calculate()}
			// An "EACH" cannot follow a "TOTAL" and vice-versa
			if (node.type == "TOTAL") {
				break;
			} else {
				this.multiplier = node.multiplier
				this.number = node.number;
				this.dice = node.dice;
				
				this.probability.true = applyOperator(1, node.dice, this.target, this.operator)
				let type = node.type != "DAMAGE" ? node.type : node.parentType

				switch (type) {
					case "ROLL":
						this.probability.false = 1 - this.probability.true;
						this.probability.true *= node.probability[val]
						this.probability.false *= node.probability[val]
						// Scale to the probability of the above roll happening
						break;
					case "EACH":
						this.probability.false = node.probability[val] - this.probability.true;
						// Need to do something here to account for probabilities higher up
						break;
				}

			}
		}
		this.cost = this.probability.true
		this.calculated = true
	}
}