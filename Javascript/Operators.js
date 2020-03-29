operators = {
	"=": function(a, b){return a == b},
	">": function(a, b){return (a > b)},
	">=": function(a, b){return (a >= b)},
	"<": function(a, b){return (a < b)},
	"<=": function(a, b){return (a <= b)},
}

function applyOperator(number, dice, target, opp) {
	let operator = operators[opp]
	let total = 0;
	for(let [key, value] of Object.entries(diceStats[number][dice])) {
		if(operator(key, target)) {total += value}
	}
	return total/100 // This takes it from a percentage to a probability
}

