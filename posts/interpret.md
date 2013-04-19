Introduction
============
Implementing an interpreter can seem a very daunting task for beginners. For a long time I felt there was a part of the process I failed to understand. However, having finally jumped in, the process seems rather straight-forward, parse then evaluate.

Parsing
=======
Let's take an example language, Lambda Calculus. Lambda Calculus has very simple notation which we can summarize as follows:

```language-types
<exp> ::= <var>
		| <exp> <exp>
		| λ<var> -> <exp>
```

For the sake of simplicity we will add variable declaration, rather than rely purely on function arguments. We now have:

```language-types
<exp> ::= <var>
		| <exp> <exp>
		| λ<var> -> <exp>
		| <var> = <exp>
```

Knowing these syntactic rules, parsing of expressions is rather straight forward. To begin, we will come up with rules for recognizing each of the expression types, then we will delegating to a parser of that type. We use the following RegEx rules.

```language-javascript
var rules = [
	[/^[^=]+=[^=]+$/, equation_parse],
	[/^[^-]+->[\S\s]+$/, lambda_parse],
	[/^[\S]+ [\S\s]+$/, invocation_parse],
	[/^/, identity]
];
```

Now we can declare the parsing functions that correspond. Notice that each function breaks the expression down into an operation followed by parameters in a list, or alternatively returns the identity.

```language-javascript
var identity = function(x) {
	return x;
};
var equation_parse = function(expr) {
	var parts = expr.split(/\s*=\s*/);
	return ['=', parts[0], parse(parts[1])];
};
var lambda_parse = function(expr) {
	var parts = expr.split('->');
	return ['lambda', parts[0].substr(1), parse(parts.slice(1).join('->'))];
};
var invocation_recursive_parse = function(fn, arguments) {
	var arg = arguments.shift(),
		application = [fn, arg.match(/^\([\s\S]+\)$/) ? parse(arg.substr(1, arg.length-2)) : arg];
	return arguments.length > 0 ? invocation_recursive_parse(application, arguments) : application;
};
var invocation_parse = function(expr) {
	var parts = expr.match(/\([\S\s]+\)|[^)(\s]+/g);
	// To handle currying and parenthesis, we delegate to a recursive parser
	return invocation_recursive_parse(parts[0], parts.slice(1));
};
```

As an example, the parsed form of a simple expression follows.

```language-javascript
// expression:
"SUCC = λn->λf->λx->f(n f x)";
// parsed form:
["=", "SUCC", ["lambda", "n", ["lambda", "f", ["lambda", "x", ["f", [["n", "f"], "x"]]]]]]
```

Now, putting it all together, we create a function `parse` that accepts an expression and parses it recursively reducing to fundamental operations applied to variables.

```language-javascript
var parse = function(expr) {
	/*
		<exp> ::= <var>
				| <exp> <exp>
				| λ<var> -> <exp>
				| <var> = <exp>
	*/
	var rules = [
		[/^[^=]+=[^=]+$/, equation_parse],
		[/^[^-]+->[\S\s]+$/, lambda_parse],
		[/^[\S]+ [\S\s]+$/, invocation_parse],
		[/^/, identity]
	];
	// parse expression with matching rule
	var parsed;
	rules.forEach(function(rule) {
		if( rule[0].test(expr) && !parsed ) {
			parsed = rule[1](expr);
		}
	});

	return parsed;
};
```

Evaluating
==========
With an appropriate data structure to represent our expressions in place, we can begin to evaluate expressions. Basically, we just need a way of constructing lambdas, and then a way of referencing and invoking them. The following encompasses that:

```language-javascript
var eval = function(x, env) {
	if( typeof x == 'string' ) {
		// variable references
		return env[x];
	} else if( x[0] == '=' ) {
		// variable assignment
		env[x[1]] = eval(x[2], env);
		return env;
	} else if( x[0] == 'lambda' ) {
		// lambda definition
		return function() { return eval(x[2], Env(x[1], arguments, env)) };
	} else {
		// function invocation
		var exps = x.map(function(expr) { return eval(expr, env); });
		return exps.shift().apply({}, exps);
	}	
};
```

As an example, the evaluation of a single parsed expression follows. It may be helpful to know that the following expression is often abbreviated to `SUCC ZERO`.

```language-javascript
eval(parse("(λn->λf->λx->f(n f x))(λf->λn->n)"));
// => λf->λx->f x
```

As you would expect, the response is a function. However, there is a much friendlier way of interpreting it, as an integer. To enable us to render the response we will slightly modify our evaluation function.

```language-javascript
var eval = function(x, env) {
	if( typeof x == 'function' ) {
		return x;
	} else if( typeof x == 'number' ) {
		return x;
	}
	// previous rules...	
};
```

The `function` and `number` cases are handled explicitly, returning the identity. Performing our evaluation with this new function we have:

```language-javascript
var ONE = eval(parse("(λn->λf->λx->f(n f x))(λf->λn->n)"), {});
ONE(function(x){ return x+1; })(0)
// => 1
```

That's much better! Our last step is implementing an environment system that handles variable declaration and subsequent expression evaluation. 

Environment
===========
As you may have noticed, in the `eval` function we referenced a constructor `Env`. We define it as follows:

```language-javascript
var Env = function(name, values, env) {
	// clone then augment environment making scope without side-effects
	var _env = {};
	for( var key in env ) {
		_env[key] = env[key];
	}
	_env[name] = eval(values[0], _env);
	return _env;
};
```

The purpose of this function is to construct environments for lambdas based on the parent environment, or "closure". Now the issue becomes passing an environment on to expressions to be evaluated subsequently. Let's begin by breaking a program up into expressions.

```language-javascript
var interpret = function(program) {
	var exprs = program.split('\n');
	return recursive_interpret(exprs);
};
```

As you can see, we now need to implement `recursive_interpret`. The purpose of this function is to modify the environment under each expression and then pass the new environment onto following expressions. We implement it as follows.

```language-javascript
var recursive_interpret = function(exprs) {
	var parsed = parse(exprs.pop());
	return exprs.length == 0 ? eval(parsed, {}) : eval(parsed, recursive_interpret(exprs));
};
```

Conclusion
==========
Putting it all together, we expose a program interpreter as a function of filename and callback.

```language-javascript
module.exports = function(file, cb) {
	fs.readFile(__dirname + file, function(err, data) {
		cb(interpret(""+data));
	});	
};
```

Hopefully the implementation of this language's interpreter has made clear the process of interpretation, especially its recursive nature. You can see the full project on [Github](https://github.com/mattneary/Lambda-Calculus-Interpreter).