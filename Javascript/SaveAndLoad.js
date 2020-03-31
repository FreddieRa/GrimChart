function saveTree() {
	let name = ""
	let newNodes = {}
	for (let [key, value] of Object.entries(nodes)) {
		newNodes[key] = simplifyNode(value)
	}
	let string = `[${JSON.stringify(newNodes)}, ${JSON.stringify(inputs)}, ${JSON.stringify(outputs)}, ${str(id)}, ${scaleFactor}, ${startID}]`
	let json = {"nodes": newNodes, "inputs": inputs, "outputs": outputs, "id": id, "scaleFactor": scaleFactor, "startID": startID}
	name = Object.values(nodes)[0].name
	if(name == null) {
		name = prompt("Filename:")
	}
	name = name.replace(/\s/g, "_")
	saveStrings([string], `${name}.txt`)
	// saveJSON(json, `${name}.json`)
}

function simplifyNode(node) {
	let temp = {}
	for (let item of [...toCopy.NODE, ...toCopy[node.type]]) {
		temp[item] = node[item]
	}
	temp.type = node.type
	return temp;
}

function loadTree(file, isText = false) {
	let string = isText ? file : file.data
	string = string.replace(/(\r\n|\n|\r)/gm, "");
	let loaded = eval(string)
	startID = loaded[5];

	nodes = {}
	for (let [key, val] of Object.entries(loaded[0])) {
		let temp = null
		let keys = []
		for (let item of [...toCopy.NODE, ...toCopy[val.type]]) {
			keys.push(val[item])
		}
		switch (val.type) {
			case "ROLL":
				temp = new Roll(...keys); break;
			case "DAMAGE":
				temp = new Damage(...keys); break;
			case "TOTAL":
				temp = new Total(...keys); break;
			case "EACH":
				temp = new Each(...keys); break;
			case "RESULT":
				temp = new Result(...keys); break;
		}
		if(val.id == startID){temp.start = true}
		nodes[val.id] = temp
	}
	
	inputs = loaded[1];
	outputs = loaded[2];

	id = loaded[3];
	scaleFactor = loaded[4];
	
}