let us = "begin..."


/*
What Is This?

 - This is a tool to calculate probabilities based on dice rolls and conditions.
 - It is primarily designed with Warhammer 40K in mind.
 - It follows a flowchart structure, reflecting the sequential nature that many rolls take.
 - It is primarily provided to fill the gap I can see in "Math-hammer" style applications,
   that currently can't deal with multiple conditional branches.
 - It is built up by adding a series of nodes, and connections between them.
 - The whole system, from creating nodes to connecting and structuring them is designed
   to be both intuitive and efficient. If you feel it's lacking in either of these please
	 let me know.
 
 
How Does It Work

 - It's complicated
 - "Roll" nodes are used to generate the relevant probability distribution
 	 - e.g. Got 5 marines rapid firing? You want the roll node created by "roll, 10d6, To hit"
	 
 - "If" nodes are used to actually implement the probabilities and branching:
 	 - "Total" nodes are based on the combined total of the two dice and are used for things
	 	 like psychic tests. They are made as such: "if total, >=, 7". This then works out the
		 probability of the "Roll" node plugged into it being greater than or equal to 7.
	 - "Each" nodes are based on a number of individual rolls, like rolling for a squad to hit.
	   This then works out what percentage should be expected to succeed (by working out the probability
		 for one dice, and passing on how many dice were involved).
	 - "If" nodes can then be followed by rolls again, and then "if"s, and so on.
	 
 - "Damage" nodes are used to show how much average damage you should expect by the time the
 	 probabilities have all trickled down. This supports set damage like 1, 2, 5, or dice based,
	 like D3, D6, 2D3, etc. You can also differentiate between normal and mortal wounds.
	 	 - e.g. "damage, 1" or "damage, 1d6"
	 
 - "Result" nodes are used to combine all of the damage nodes from the tree. If you have a psychic
 	 test where you do 1 wound if its more than 8, and 3 wounds if more than 11, you can plug both
	 of those damage nodes into the "Result" node, and it will show you the total average you should
	 be getting.
	 
 - All of this will make more sense after reading the next section, and experimenting a bit.
 
 - Finally, there will be many bugs and quirks yet to be ironed out, so if you find something
   behaving weirdly, let me know.
*/
notes = `
How To Use:

 - There a number of modes, these can be changed between by pressing the corresponding number key:
 	 - 1: Add a new "node
	 	 		- After clicking, a box will come up. Type what you see between the quotation marks.
		 		- Roll: "roll, XdX, [Name]"
		 			 - e.g. "roll, 5d6, To Hit"
		 		- IF Total: "if total, [Operator], [Target]"
		 			 - Viable operators: <, <=, =, >=, >
					 - e.g. "if total, >=, 8"
		 		- IF Each: "if each, [Operator], [Target]"
					 - Viable operators: <, <=, =, >=, >
					 - e.ge. "if each, =, 1"
		 		- Damage: "damage, [Number] or XdX, [Mortal Wounds]"
					 - e.g. "damage, 3, mw", "damage, 1d3", "damage, 2d3, mw"
					 - Even if a single it must be "1d3" and not just "d3".
		 		- Result: "result"
		 			 - That is all
			 
 	 - 2: Add a "TRUE" connection
	 	 		- This is used both for the true part of a conditional, but also as the "standard" connection.
		 		- i.e. this should be used to link a "Roll" node to a "Total" node.
		 		- Simply click on one node, and then on another to connect from the first to the second.
		 		- Direction DOES matter!
		 
	 - 3: Add a "FALSE" connection
		 		- Identical to the above but for "FALSE" from conditionals.
		 
	 - 4: Move nodes
		 		- Click and drag an individual node to move it.
		 		- Click and drag the background to move all nodes.
		 		- Hold SHIFT and click and drag to draw a selection box. Release, and then click and drag background
		 		  to move only those nodes selected as one block.
		 		- To de-select nodes, press SHIFT again.
`
notes2 = `




	 - 5: Edit nodes
	 	 		- Click on a node to bring up the relevant "edit" GUI in the top right corner.
		 		- This lets you change the name, and most important details about the node.
		 
	 - 6: Delete a connection
	  		 - Click on one node and then another to delete whatever connection was going from the first to the second.
		 
	 - 7: Delete a node
	 	 		- Click on a node to delete it, this cannot be undone,
	 	 		- This will also delete all connections involving that node.
		 
	 - 8: Snapping!
	 	 		- This is just a Quality of Life improvement, if you press 8 it will immediately snap all nodes to the nearest
		   30 pixels, meaning you don't have to spend ages lining everything up perfectly.
			 
	 - 0: Calculating
	 	 		- This is what does all the maths when you've built the tree.
		 		- It will calculate the result for every "Result" node.
		 		- This will also work out everything above it (this is done first, and then it filters back down).
		 
 - Other buttons:
   - #: Save the tree
		 		- This will save the tree so that it can be loaded in later.
	 - BACKTICK: Export image
	 	 		- This will save an image of the current canvas to your downloads.
	 - If in Mode 4 (Moving):
	 	 		- UP ARROW: Scale up
	 	 	 		- This will make the whole tree bigger
	 	 		- DOWN ARROW: Scale down
	 	 	 		- This will make the whole tree smaller	 
`
/*
Misc:

 - You cannot have opposing IF Each.
 	- E.g IF Each >= 4 followed by IF Each >= 6 is FINE.
	- However you CANNOT do If Each <= 4 followed by If Each >= 2.
		-	Instead you would do If Each <= 4 followed by If Each <= 1, and use the "false" branch.
	
 - An "EACH" cannot follow a "TOTAL" and vice-versa
 - A "DAMAGE" cannot follow a "ROLL" 
 - A "ROLL" cannot follow a "ROLL" 
 
 - A "ROLL" cannot have "FALSE" outputs

 - Currently cannot combine non-mortal and mortal wounds in order.
*/



