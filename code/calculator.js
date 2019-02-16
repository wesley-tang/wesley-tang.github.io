let equation = "";
let ans = undefined;
let output = "";

function calcButton(value){
	console.log(equation.length);
	if (value === "Ans"){
		if (ans){
			equation += ans.toString();
		}
	}
	else if (value === "=") {
		let answer = undefined; 

		try {
			answer = eval(equation);

			ans = answer;
			equation = answer;
			output = answer;
		}
		catch(err){
			output = "ERROR";
		}

		$("#readout").text(output);
	}
	else if (value === "CE") {
		if (equation.length > 0)
			equation = equation.substring(0, equation.length-1);
	}
	else {
		equation += value;

	}
	console.log(equation.length);

	$("#display").text(equation);
	$("#display").scrollLeft(Number.MAX_SAFE_INTEGER);
}
