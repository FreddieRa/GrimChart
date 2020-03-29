function keyPressed() {
	selected = []
	let h = gui ? height * 10 : 250
	if (Object.keys(modes).includes(key) && !intersect(width*850/1080, 40, 250, h)) {
		mode = int(key)
		from = -1;
		to = -1;
	}
	
	if (key == "h") {
		help = !help
	}

	// Saving tree
	if (key == "#") {
		saveTree()
	}

	// Exporting Image
	//*
	if (key == "`") {
		let name = prompt("Filename:")
		name = name.replace(/\s/g, "_")
		saveCanvas(name, "jpg")
	} //*/

	// Snapping to grid
	if (key == "8") {
		for (let [key, value] of Object.entries(nodes)) {
			// The value here determines how coarse the grid is
			value.snapTo(20 * scaleFactor);
		}
	}

	if (key == "0") {
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

	// Searching and highlighting nodes
	if (keyIsDown(CONTROL) && key == "f") {
		let string = prompt("String:")
		if (string) {
			string = (string).toLowerCase()
			for (let [key, value] of Object.entries(nodes)) {
				if (value.name.toLowerCase().includes(string)) {
					selected.push(key)
				}
			}
		}
		return false
	}
	return true
}



function mousePressed() {
	startCoord = []
	let h = gui ? height * 10 : 250
	if (!intersect(width*850/1080, 40, 250, h) && !intersect(0, 100, 350, 400)) {
		switch (mode) {
			case 1: // Add node
				if (!intersect(width - 150, 0, 250, h)) {
					let string = prompt("Node:");
					let temp = {};
					if (string == null) {
						break
					}
					let ext = extractName(string)
					if (ext == null) {
						print("There is an issue with that node, please try again.");
						break
					} else {
						if (id == 0) {
							ext.start = true;
							startID = 0
						}
						nodes[id] = ext;
						inputs[id] = {};
						outputs[id] = {};
						id += 1;
						break;
					}
				}
				break;

			case 2: // Add true connection
				{
					if (hovered != -1) {
						if (from == -1) {
							from = hovered
						} else {
							to = hovered
							if (to != from) {
								//nodes[from].connections[to] = true;
								//nodes[to].inputs[from] = true;
								outputs[from][to] = true;
								inputs[to][from] = true;
								unchanged = false;
							}
							from = -1
						}
					}
					break;
				}

			case 3: // Add false connection
				{
					if (hovered != -1) {
						if (from == -1) {
							from = hovered
						} else {
							to = hovered
							if (to != from) {
								//nodes[from].connections[to] = false;
								//nodes[to].inputs[from] = false;
								outputs[from][to] = false;
								inputs[to][from] = false;
								unchanged = false;
							}
							from = -1
						}
					}
					break;
				}

			case 4: // Move nodes
				if (keyIsDown(SHIFT)) {
					startCoords = [mouseX, mouseY]
					endCoords = [mouseX, mouseY]
				} 
				break;

			case 5: // Edit node
				{
					if (hovered != -1) {
						if (gui) {
							gui.destroy()
						}
						let node = nodes[hovered]
						gui = new dat.GUI();
						// let name = gui.add(node, 'name').listen();
						for (let key of toCopy[node.type]) {
							if(key == "damageDice") {
								
							} else {
								gui.add(node, key)
							}
						}
					}
					break;
				}

			case 6: // Delete connection
				{
					if (hovered != -1) {
						if (from == -1) {
							from = hovered
						} else {
							to = hovered
							if (to != from) {
								//delete nodes[from].connections[to]
								delete outputs[from][to]
								delete inputs[to][from]
								unchanged = false;
							}
							from = -1
						}
					}
					break;
				}

			case 7: // Delete Node
				{
					if (hovered != -1) {
						let tempId = hovered;
						for (let node of Object.values(nodes)) {
							if (node.id != tempId) {
								delete node.connections[tempId]
								delete outputs[node.id][tempId]
								delete inputs[node.id][tempId]
							}
						}
						delete outputs[tempId]
						delete inputs[tempId]
						delete nodes[tempId]
						unchanged = false;
					}
					break;
				}

			case 9: // Set Start
				{
					if (hovered != -1) {
						let tempId = hovered;
						for (let node of Object.values(nodes)) {
							node.start = false
						}
						nodes[tempId].start = true
						startID = tempId
						unchanged = false;
					}
					break;
				}
		}
	}
}

function mouseReleased() {
	if (startCoords.length != 0) {
		endCoords = [mouseX, mouseY]
		selected = getSelected(startCoords, endCoords)
		startCoords = []
	}
}

function mouseDragged() {
	switch (mode) {
		case 4:
			if (keyIsDown(SHIFT)) {
				endCoords = [mouseX, mouseY]
			} else {
				if (hovered != -1) {
					hoveredNode = nodes[hovered]
					hoveredNode.x = mouseX;
					hoveredNode.y = mouseY;
				} else {
					if (selected.length != 0) {
						
						for (let id of selected) {
							let node = nodes[id]
							node.move()
						}
					} else {
						for (let node of Object.values(nodes)) {
							node.move()
						}
					}
				}
			}
	}
}