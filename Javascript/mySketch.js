function preload() {
	ex = loadStrings("Default.txt")
	img = loadImage("Grungy-Paper-Texture-3.jpg")
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	background(255);
	rectMode(CENTER);
	textAlign(CENTER, CENTER);
	ts = 22;
	textSize(25);
	textFont('Georgia');

	// File browser button
	browse = createFileInput(loadTree)
	browse.position(width*850/1080, 40)
	
	// Example loading button
	example = createButton("Load Example")
	example.position(width*850/1080, 60)
	example.mousePressed(function(){loadTree(ex[0], true)})
	
	// A dictionary of nodes where their ID is the key
	nodes = {};
	inputs = {};
	outputs = {};
	
	route = [];
	
	// The scale that everything is drawn at
	scaleFactor = 1;
	
	// Properties of nodes that should be saved
	toCopy = {
		"NODE": ["id", "x", "y"],
		"RESULT" : ["name"],
		"ROLL": ["name", "number", "dice"],
		"DAMAGE": ["name", "damageNumber", "damageDice", "mortal"],
		"TOTAL": ["name", "operator", "target"],
		"EACH": ["name", "operator", "target"],
	}
	

	// The id of the node to be next added
	id = 0;
	startID = -1;
	
	// There is no GUI to begin with
	gui = false;
	help = false;

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
	loc = createElement('p');
	loc.position(0, 100);
	mainGUI = new dat.GUI({
		autoPlace: true,
		width: 280,
		height: 250
	});
	let flipped =  {}
	for(var key in modes){
    flipped[modes[key]] = key;
  }
	mainGUI.add(this, 'mode', flipped);
	mainGUI.add(this, 'Calculate');
	loc.child(mainGUI.domElement)
	//print(img)
}

function draw() {
	background(255);
	image(img, 0, 0, width, height)
	
	hovered = -1;
	
	// Pressing up and down arrow keys scale everything up and down
	if(mode == 4 && keyIsDown(UP_ARROW)){scaleFactor += 0.01}
	if(mode == 4 && keyIsDown(DOWN_ARROW)){scaleFactor -= 0.01}
	if (keyIsDown(219)) {cur -= 0.5; cur = max(cur, 0)}
	if (keyIsDown(221)) {cur += 0.5; cur = min(cur, 10)}


	{
		noStroke();
		fill(0);
		textSize(25);
		text(modes[mode], 140, 40)
		textSize(25);
	} // Modes
	


	{
		fill(0)
		for (let [from, dict] of Object.entries(outputs)) {
			for (let [to, type] of Object.entries(dict)) {
				let f = createVector(nodes[from].x, nodes[from].y)
				let t = createVector(nodes[to].x, nodes[to].y)
				
				noStroke()
				let prob = nodes[from].probability[type]
				let str = false
				if(prob != -1 && (nodes[from].type == "EACH" || nodes[from].type == "TOTAL")){
					let v = f.copy().add(t).mult(0.5)
					textSize(16*scaleFactor)
					// text((prob*100).toFixed(2)+"%", v.x-30, v.y-15)
					str = (prob*100).toFixed(2)+"%"
				}
				
				strokeWeight(scaleFactor)
				let col = type ? color(20, 200, 20) : color(200, 20, 20)
				stroke(col)
				drawArrow(f, t, str)
			}
		}
	} // Draw connections

	for (let [key, val] of Object.entries(nodes)) {
		val.hover = false;
		if (intersect(val.x-val.width/2, val.y-val.height/2, val.width, val.height)) {
			hovered = key;
			val.hover = true;
		}
		val.update();
		val.show()
	} // Draw nodes
	
	
	if(startCoords.length != 0){
		stroke(color(100, 100, 200));
		strokeWeight(2);
		fill(color(100, 100, 200, 10))
		let x = (startCoords[0] + endCoords[0])/2
		let y = (startCoords[1] + endCoords[1])/2
		let w = abs(endCoords[0] - startCoords[0])
		let h = abs(endCoords[1] - startCoords[1])
		rect(x, y, w, h);
	} // Draw box
	
	// Budget Darkmode
	// image(canvas, 0, 0)
	// filter(INVERT)
	
	if(help) {
		bevRect(width/2, height/2, width*3/4, height*4/5, cur)
		textAlign(LEFT)
		textSize(12)
		noStroke()
		fill(255)
		text(notes, width/2,height*1/6, width*3/4-50, height*3/4)
		text(notes2, width*5/6,height*1/6, width*3/4-50, height*3/4)
		textAlign(CENTER)
	}
}