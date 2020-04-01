function Damage(id, x, y, name, damageNumber, damageDice = "", mortal = false) {
	Node.call(this, id, x, y, name)
	this.damageNumber = damageNumber;
	this.damageDice = damageDice;
	this.mortal = mortal;
	this.average = 0;
	this.type = "DAMAGE";

	this.getString = function() {
		// If a skill or attribute, then show magnitude (e.g. "+4 Strength")
		let string = ""
		string = `Damage: ${this.damageNumber}`
		string = this.damageDice ? string + "d" + this.damageDice : string
		string = this.mortal ? string + " MW" : string
		return string
	}

	this.calculate = function() {
		this.average = 0;
		this.probability.true = 0;
		for (let [id, val] of Object.entries(inputs[this.id])) {
			let node = nodes[id]
			if (node.calculated == false) {
				node.calculate()
			}
			// A "RESULT" cannot follow a "ROLL" and vice-versa
			if (node.type == "ROLL") {
				break;
			} else if (node.type == "DAMAGE") {
				this.probability.true += node.probability[val] * node.multiplier
				let selfAverage = this.damageDice ? Math.round(diceStats[this.damageNumber][this.damageDice].mean) : this.damageNumber
				selfAverage *= node.probability[val] * node.multiplier
				this.average += selfAverage
				this.average += node.average
			} else {
				this.multiplier = node.multiplier
				this.number = node.number;
				this.dice = node.dice;

				this.probability.true += node.probability[val] * node.multiplier
				this.average = this.damageDice ? Math.round(diceStats[this.damageNumber][this.damageDice].mean) : this.damageNumber
				this.average *= this.probability.true
			}
		}
		this.unchanged = true
		this.calculated = true
	}
}