function keyPressed() {
	selected = []
	let h = gui ? height * 10 : 250
	if (Object.keys(modes).includes(key) && !gui) {
		mode = int(key)
		updateMode(modes[mode]);
		if (gui) {
			gui.domElement.parentNode.removeChild(gui.domElement)
			gui = false
		}
		from = -1;
		to = -1;
	}

	if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
		return false
	}
	
	if (key == "h") {
		helpToggle()
		return false
	}

	// Saving tree
	if (key == "#") {
		saveTree()
	}

	// Exporting Image
	//*
	if (key == "`") {
		saveOutput();
	} //*/

	// Snapping to grid
	if (key == "9") {
		for (let [key, value] of Object.entries(nodes)) {
			// The value here determines how coarse the grid is
			if(value.type != "BUTTON") {
				value.snapTo(20 * scaleFactor);
			}
		}
	}

	if (key == "0") {
		calculate();
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

	if (hovered != -1 && nodes[hovered].type == "BUTTON") {
		nodes[hovered].func()
	} else if (!intersect(width*850/1080, 40, 250, h) && 
		!intersect(0, 10, 300, 100)
		) {
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
					if (hovered != -1 && nodes[hovered].type != "RESULT") {
						if (gui) {
							gui.domElement.parentNode.removeChild(gui.domElement)
							if(gui.node == nodes[hovered].id){gui = false; return false}
						}
						let node = nodes[hovered]
						gui = new dat.GUI({autoPlace: false});
						gui.node = node.id

						loc2.child(gui.domElement)
						loc2.position(node.x + 10, node.y);
						
						// let name = gui.add(node, 'name').listen();
						for (let key of toCopy[node.type]) {
							switch (key) {
								case "name": 
									if(node.type == "ROLL") {
										gui.add(node, key)
									} break;
								case "number": 
								case "target":
									gui.add(node, key).min(1).step(1);
									break;
								case "dice":
									gui.add(node, key, {"d3": 3, "d6": 6});
									break;
								case "damageDice":
									gui.add(node, key, {"None": "", "d3": 3, "d6": 6});
									break;
								case "operator":
									gui.add(node, key, ["<", "<=", "=", ">=", ">"]);
									break;
								default:
									gui.add(node, key)
							}
						}
					} else if (gui) {
						if(!intersect(loc2.x, loc2.y, gui.width, 150)) {
							gui.domElement.parentNode.removeChild(gui.domElement)
							gui = false; 
							return false
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
						print(tempId)
						for (let node of Object.values(nodes)) {
							if (node.type != "BUTTON" && node.id != tempId) {
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

			case 8: // Duplicate node
				{
					if (hovered != -1) {

						let tempNode = nodes[hovered];
						let simplified = simplifyNode(tempNode);
						let temp = createNode(simplified);	
						temp.id = id
						nodes[id] = temp
						inputs[id] = {}
						outputs[id] = {}

						id += 1
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
				if (hovered != -1 && nodes[hovered].type != "BUTTON") {
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
		case 8:
			if (hovered != -1 && nodes[hovered].id == id-1) {
				hoveredNode = nodes[hovered]
				hoveredNode.x = mouseX;
				hoveredNode.y = mouseY;
			}
	}
	return false
}