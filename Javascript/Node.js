function Node(id, x, y, name) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.name = name;
	this.type = "NODE";
	this.start = false;
	
	this.connections = {};
	this.string = "";
	this.probability = {"true": -1, "false": -1}
	this.calculated = false;
	this.multiplier = 1;
	
	this.width = 85;
	this.height = 35;
	this.textSize = 18;
	this.hover = false;
	this.sw = 1;
	this.colour = "#CCCCCC"
	this.costColour = "#000000"
	this.colours = {
		"NODE": "#CCCCCC",
		"ROLL": "#CCCCCC",
		"DAMAGE": "#CCCCCC",
		"TOTAL": "#CCCCCC",
		"EACH": "#CCCCCC",
		"RESULT": "#CCCCCC",
		"BUTTON": "#CCCCCC",
		"start": "#CCCCCC",
		"hovered": "#13c1d1",
		"from": "#c21328"
	}
	
	this.getString = function() {
		return this.name
	}

	this.update = function() {
		if (mode == 4) {
			// Scale point toward or away from mouse
			if (keyIsDown(UP_ARROW)) {
				this.x -= (mouseX - this.x) * 0.01;
				this.y -= (mouseX - this.y) * 0.01;
			}
			if (keyIsDown(DOWN_ARROW)) {
				this.x += (mouseX - this.x) * 0.01;
				this.y += (mouseY - this.y) * 0.01;
			}
		}
		
		// Determine size of box to contain text
		textSize(this.textSize * scaleFactor)
		this.width = (textWidth(this.getString()) + 15)
		this.height = (textAscent() + 15)
		if (this.hover || route.includes(str(this.id)) || selected.includes(str(this.id))) {
			this.sw = 2
			this.colour = this.colours.hovered
		} else if (from == this.id) {
			this.sw = 2
			this.colour = this.colours.from
		} else {
			this.sw = 1
			this.colour = this.start ? this.colours.start : "#CCCCCC"
		}
	}

	this.move = function() {
		this.x += (mouseX - pmouseX);
		this.y += (mouseY - pmouseY)
	}
	
	this.snapTo = function(val) {
		this.x = Math.round(this.x / val) * val
		this.y = Math.round(this.y / val) * val
	}

	this.show = function() {
		let x = this.x
		let y = this.y

		if (this.type != "Blank") {

			{
				// drawingContext.shadowBlur = 5
				// drawingContext.shadowColor = color(0,0,0, 30)
				stroke(this.colour)
				strokeWeight(this.sw*2)
				fill(50)
				// rect(x, y, this.width, this.height, cur, cur, cur, cur)
				bevRect(x, y, this.width, this.height, cur, this.colour)
				
			} // Draw Rect

			if (this.average && unchanged) {
				textSize(this.textSize * (7 / 9) * scaleFactor)
				fill(this.costColour)
				noStroke()
				if(this.type == "DAMAGE"){
					let string = "Average: " + this.average.toFixed(2)
					if(this.mw){string += " MW"}
					text(string, x - this.width / 2, y + this.height)
				}
			} // Draw cost

			{
				textSize(this.textSize * scaleFactor)
				//fill(this.colour)
					fill(255)
				noStroke()
				text(this.getString(), x, y)
			} // Draw Text
		}
	}
}