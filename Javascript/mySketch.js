for (let item of ["./Javascript/Button.js", "./Javascript/Damage.js", "./Javascript/Each.js", "./Javascript/Functions.js", "./Javascript/IO.js", "./Javascript/Node.js", "./Javascript/Notes.js", "./Javascript/Operators.js", "./Javascript/Result.js", "./Javascript/Roll.js", "./Javascript/SaveAndLoad.js", "./Javascript/Stats.js", "./Javascript/Total.js"]) {
	let imported = document.createElement('script');
	imported.src = item;
	document.head.appendChild(imported);
}

function preload() {
	ex = loadStrings("examples/Default.txt")
	ex2 = loadStrings("examples/Magnus's_Smite.txt")
	img = loadImage("Images/Grungy-Paper-Texture-3.jpg")
	logo = loadImage("Images/GrimChartLogoSmall.png")
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.style('display', 'block');
	canvas.position(0, 0)
	background(255);
	rectMode(CENTER);
	textAlign(CENTER, CENTER);
	ts = 22;
	textSize(25);
	textFont('Georgia');

	// A dictionary of nodes where their ID is the key
	nodes = {};
	protected = [];
	inputs = {};
	outputs = {};

	// The scale that everything is drawn at
	scaleFactor = 1;

	// Properties of nodes that should be saved
	toCopy = {
		"NODE": ["id", "x", "y"],
		"RESULT": ["name"],
		"ROLL": ["name", "number", "dice"],
		"DAMAGE": ["name", "damageNumber", "damageDice", "mortal"],
		"TOTAL": ["name", "operator", "target"],
		"EACH": ["name", "operator", "target"],
	}


	// Adding calc and help buttons
	buttons = { "Mode": showSelect, "Calculate": calculate, "Help": helpToggle }
	buttons2 = {
		"Load Example 1": function () { loadTree(ex[0], true) },
		"Load Example 2": function () { loadTree(ex2[0], true) },
		"Choose File": function () { },
		"Save Tree": saveTree,
		"Save Image": SaveOutput
	}
	addButtons();

	defaultNodes = { 
		"Spell": {"number": 2, "dice": 6, "type": "ROLL"}, 
		"To hit": {"number": 10, "dice": 6, "type": "ROLL"},
		"IF Each": {"operator": ">=", "target": 4, "type": "EACH"}, 
		"IF Total": {"operator": ">=", "target": 4,"type": "TOTAL"}, 
		"Damage": {"damageNumber": 1, "damageDice": "", "mortal": false, "type": "DAMAGE"},
		"Result": {"type": "RESULT"} }
	addDefaultNodes();


	// File browser button
	browse = createFileInput(loadTree)
	browse.position(chooseFile.x - chooseFile.width / 2, chooseFile.y - chooseFile.height / 2)
	browse.size(chooseFile.width, chooseFile.height)
	browse.style("background-color", "rgba(255, 1, 1, 0)");
	browse.style("color", "rgba(255, 255, 255, 0)");
	browse.style("opacity", "0");


	route = [];

	// The id of the node to be next added
	id = 0;
	startID = -1;

	// There is no GUI to begin with
	gui = false;
	help = false;
	saving = false;

	// The current "from" and "to" IDs for adding a connection
	from = -1;
	to = -1;

	// This is the position of a selection box, and those selected
	selected = []
	startCoords = []
	endCoords = []

	// Curve
	cur = 6

	// This signifies whether there have been edits to the tree
	unchanged = true

	mode = 1;
	showMode = true;
	modes = {
		1: "Add node",
		2: "Add TRUE connection",
		3: "Add FALSE connection",
		4: "Move node",
		5: "Edit node",
		6: "Remove connection",
		7: "Remove node",
	}


	// All of the GUI to replace keypresses
	sel = createSelect();
	sel.position(90, 18)
	sel.changed(updateMode)
	flipped = {}
	for (var key in modes) {
		sel.option(modes[key])
		flipped[modes[key]] = key;
	}
	sel.style("font-family", "Georgia");
	sel.style("font-size", 18 + "px");
	sel.style("background-color", "rgba(255, 1, 1, 0)");
	sel.style("color", "rgba(255, 255, 255)");
	sel.style("border: none")
	sel.style("-webkit-appearance: none");
	sel.style("-moz-appearance: none");
	sel.style("box-shadow: inset 20px 20px rgba(255, 1, 1, 0)")
	sel.selected(modes[1])
	updateMode();

	loc2 = createElement('p');
	//print(img)
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	for (button of Object.keys(buttons2)) {
		let node = nodes[button]
		node.x = width - 20 - int(node.width / 2)
	}
	browse.position(chooseFile.x - chooseFile.width / 2, chooseFile.y - chooseFile.height / 2)

}

function draw() {
	background(255);
	image(img, 0, 0, width, height)
	image(logo, 20, height - logo.height - 20)

	strokeWeight(scaleFactor)
	let bh = Object.keys(defaultNodes).length * (nodes["Spell"].height + 20)
	bevRect(60, buttony + bh/2, 190, bh, cur, "#CCCCCC")

	hovered = -1;

	// Pressing up and down arrow keys scale everything up and down
	if (mode == 4 && keyIsDown(UP_ARROW)) { scaleFactor += 0.01 }
	if (mode == 4 && keyIsDown(DOWN_ARROW)) { scaleFactor -= 0.01 }
	if (keyIsDown(219)) { cur -= 0.5; cur = max(cur, 0) }
	if (keyIsDown(221)) { cur += 0.5; cur = min(cur, 10) }


	{
		fill(0)
		for (let [from, dict] of Object.entries(outputs)) {
			for (let [to, type] of Object.entries(dict)) {
				let f = createVector(nodes[from].x, nodes[from].y)
				let t = createVector(nodes[to].x, nodes[to].y)

				noStroke()
				let prob = nodes[from].probability[type]
				let str = false
				if (prob != -1 && (nodes[from].type == "EACH" || nodes[from].type == "TOTAL")) {
					let v = f.copy().add(t).mult(0.5)
					textSize(16 * scaleFactor)
					// text((prob*100).toFixed(2)+"%", v.x-30, v.y-15)
					str = (prob * 100).toFixed(2) + "%"
				}

				strokeWeight(scaleFactor)
				let col = type ? color(20, 200, 20) : color(200, 20, 20)
				stroke(col)
				drawArrow(f, t, str)
			}
		}
	} // Draw connections

	// Bit of a hack to draw all of the protected items underneath everything
	for (let key of protected) {
		let val = nodes[key]
		val.hover = false;
		if (intersect(val.x - val.width / 2, val.y - val.height / 2, val.width, val.height)) {
			hovered = key;
			val.hover = true;
		}
		val.update();
		if (saving != true) {
			val.show()
		}
	}

	for (let [key, val] of Object.entries(nodes)) {
		if(protected.includes(val.id)) {continue}
		val.hover = false;
		if (intersect(val.x - val.width / 2, val.y - val.height / 2, val.width, val.height)) {
			hovered = key;
			val.hover = true;
		}
		val.update();
		val.show()
	} // Draw nodes



	if (startCoords.length != 0) {
		stroke(color(100, 100, 200));
		strokeWeight(2);
		fill(color(100, 100, 200, 10))
		let x = (startCoords[0] + endCoords[0]) / 2
		let y = (startCoords[1] + endCoords[1]) / 2
		let w = abs(endCoords[0] - startCoords[0])
		let h = abs(endCoords[1] - startCoords[1])
		rect(x, y, w, h);
	} // Draw box

	// Budget Darkmode
	// image(canvas, 0, 0)
	// filter(INVERT)
}