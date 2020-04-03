// Basic rectangle intersection function
function intersect(x, y, w, h) {
	let inX = (x <= mouseX && mouseX <= x + w)
	let inY = (y <= mouseY && mouseY <= y + h)
	return (inX && inY)
}

function addConnection(to, from, weight = 1, type = "Normal") {
	if (to != from) {
		let weight = 1;
		nodes[from].connections[to] = weight;
		nodes[to].connections[from] = weight;
		outputs[from][to] = weight;
		outputs[to][from] = weight;
	}
	from = -1
}

function extractName(string) {
	let split = string.split(",").map(x => x.trim());
	let type = split[0].toUpperCase();
	if (type.includes("ROLL")) {
		// roll, 1d6, To hit
		let diceNum = split[1].split("d")
		let number = int(diceNum[0])
		let dice = int(diceNum[1])
		let name = split.length > 2 ? split[2] : "Roll"
		let temp = new Roll(id, mouseX, mouseY, name, number, dice)
		return temp

	} else if (type.includes("DAMAGE")) {
		let diceNum = split[1].split("d")
		let number = int(diceNum[0])
		let dice = diceNum.length > 1 ? int(diceNum[1]) : false
		let mw = split.length >= 3
		let name = "Damage"
		let temp = new Damage(id, mouseX, mouseY, name, number, dice, mw)
		return temp

	} else if (type.includes("TOTAL")) {
		let operator = split[1]
		if (!(operator in operators)) {
			return null
		}
		let number = int(split[2])
		let name = split.length > 3 ? split[2] : "Total"
		let temp = new Total(id, mouseX, mouseY, name, operator, number)
		return temp

	} else if (type.includes("EACH")) {
		let operator = split[1]
		if (!(operator in operators)) {
			return [null]
		}
		let number = int(split[2])
		let name = split.length > 3 ? split[2] : "Each"
		let temp = new Each(id, mouseX, mouseY, name, operator, number)
		return temp
	} else if (type.includes("RESULT")) {
		let name = split.length > 1 ? split[1] : "Result"
		let temp = new Result(id, mouseX, mouseY, name)
		return temp
	} else {
		return null
	}
}

function getSelected(coord1, coord2) {
	let sel = []
	for (let [key, value] of Object.entries(nodes)) {
		if (between(value.x, coord1[0], coord2[0]) && between(value.y, coord1[1], coord2[1])) {
			sel.push(key)
		}
	}
	return sel
}

function between(x, a, b) {
	let betA = min(a, b) <= x;
	let betB = x <= max(a, b);
	return (betA && betB)
}



function drawArrow(base, end, str) {
	base = base.copy()
	end = end.copy()
	var vec = end.sub(base)
	var norm = vec.copy().rotate(HALF_PI);
	norm = norm.normalize();
	norm = norm.mult(30)

	push();
	translate(base.x, base.y);
	line(0, 0, vec.x, vec.y);
	translate(vec.x / 2, vec.y / 2)
	if (str) {
		push()
		translate(norm.x, norm.y)
		text(str, 0, 0)
		pop()
	}
	push()
	rotate(vec.heading())
	triangle(0, 6, 0, -6, 6, 0);
	pop()
	pop();
}

function bevRect(x, y, wi, he, be, highlight = false) {
	let w = wi / 2;
	let h = he / 2;
	let b = be
	let col = 0
	//let ctx = drawingContext
	for (let i of [1,0,0]) {
		w = wi / 2 + i;
		h = he / 2 + i;
		b = be + i / 2

		

		if (i == 1) {
			drawingContext.shadowBlur = 30
			drawingContext.shadowColor = color(250,239,213)
			fill(80)
		} else {		
			noFill()
			drawingContext.shadowBlur = 10
			drawingContext.shadowColor = color(0)
		}
		
		if(i){
			col = color(150)
		} else {
			col = highlight ? highlight : color(30)
		}

		stroke(col)
		beginShape()
		vertex(x - w, y - h + b)
		vertex(x - w + b, y - h)
		vertex(x + w - b, y - h)
		vertex(x + w, y - h + b)

		vertex(x + w, y + h - b)
		vertex(x + w - b, y + h)
		vertex(x - w + b, y + h)
		vertex(x - w, y + h - b)
		endShape(CLOSE)
	}
	drawingContext.shadowBlur = 0
}


function calculate() {
	for (let node of Object.values(nodes)) {
		node.calculated = false;
	}
	for (let node of Object.values(nodes)) {
		if (node.type == "RESULT") {
			node.calculate()
		}
	}
	unchanged = true
}

function SaveOutput() {
	let name = prompt("Filename:")
	name = name.replace(/\s/g, "_")
	saving = true;
	redraw()
	saveCanvas(name, "jpg")
	saving = false;
}

function mouseWheel(event) {
	return false
}

window.onscroll = function(){window.scrollTo(0, 0);}

function helpToggle() {
	window.open("https://github.com/FreddieRa/GrimChart/wiki", "_blank");
}

function addButtons() {
	buttonx = 20 
	button2x = width-20
	let all = {}
	all[buttonx] = buttons
	all[button2x] = buttons2

	for (let [bx, b] of Object.entries(all)) {
		buttony = 30
		for (let [key, value] of Object.entries(b)) {
			let temp = new Button(key, 0, 0, key, value)
			temp.calcSize();
			temp.x = int(bx) + int(temp.width/2)*(bx == buttonx ? 1 : -1)
			temp.y = buttony
			nodes[key] = temp
			buttony += temp.height + 10
		}
	}
	chooseFile = nodes["Choose File"]
}

function updateMode(val) {
	let item = val	
	if(val in flipped) {
		sel.selected(val);
		sel.value(val);
	} else {
		item = sel.selected();	
	}
	mode = int(flipped[item])
	let w = Math.ceil((textWidth(item) + 15)/textWidth(" "))
	nodes["Mode"].name = "Mode:" + " ".repeat(w)
	nodes["Mode"].calcSize();
	nodes["Mode"].x = buttonx + nodes["Mode"].width/2
	//sel.style('color', '#ff0000');
}

function triggerFileInput() {

	
}



function showSelect() {
	// sel.elt.style.color = sel.style('color', '#ffffff');
}




//