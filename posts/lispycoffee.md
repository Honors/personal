A Primer on the Structure and Interpretation of Programs
========================================================
Computational Processes
-----------------------
What's a program? A program manipulates all input, if any, to bear output. This may be embodied in a robot's response to ultraviolet sensors or an app's posting of a tweet. Our first program will have two potential outputs, "It's Friday!" and "It's not Friday!" based on input of a number, 1-7.

```language-coffeescript
whatDay = (day) -> switch day
	when 5 then "It's Friday!"
	else "It's not Friday!"
```

What has been created above is an example of *code*. Code is a collection of text following the syntax of a given language. As well as being a valid syntactical construct under our language of choice, CoffeeScript, the above bears further meaning. The above defines `whatDay` as equal to another expression. This expression is a  *function definition*. Functions, like our definition of a program, map input values to an output. For this reason functions are often called subroutines, essentially, sub-programs.

Our creation of the `whatDay` function follows the same pattern as any function's definition would. Passed values, or parameters, are listed in parenthesis, e.g., `(day)`, and shown to map to a given expression by use of an arrow. Hence our function definition syntax fits the pattern of `<var> = (<var>,...) -> <expr>`, where `<var>` represents a variable and `<expr>` represents an expression.

The body of the `whatDay` function, that is, the expression following the arrow, consists of a `switch` statement. `switch` statements will be used very often and serve to determine a value, optionally based on a criterion, in this case `day`. Summarized, the body says, "When the day is 5, it's Friday, otherwise it's not Friday".

In the code above, the `whatDay` function accepts a day and returns whether it is Friday. Obviously, this program is not very complex and would not be very useful. Our next step is to generalize this coupling of values. 

```language-coffeescript
cons = (a, b) -> 
	(option) -> switch option
		when true then a
		else b
```

You see that in `cons`, our pair constructor, the default and alternate values are passed as parameters, `a` and `b`. Additionally, the criterion that the day must equal 1 has been generalized. Rather, the passed value must be true. However, the structure remains the same. Putting this to use we have evaluation of the following expressions as displayed by the `// =>` annotations.

```language-coffeescript
whatDay = cons("It's Friday!", "It's not Friday!")
whatDay(true) // => "It's Friday!"
whatDay(false) // => "It's not Friday!"
```

We have successfully generalized the idea of branching based on input, so let's try to expand to allow for arbitrarily many options. You should note that henceforth cons will often be used in constructing nested pairs, our implementation of lists. Our nested pairs will be constructed as in the following code, where comments have been added of the form `// ...` to make clear the reason for branching, analogous to our Friday-based branch shown previously.

```language-coffeescript
whatAmI = cons(
	// Do you lack arms?
	"snake",
	cons(
		// Are you fast?
		"leopard",
		cons(
			// Are you slow?
			"sloth",
			nil
		)
	)
)
```

The above serves as a tree of decisions, or given the taxonomical example, a [dichotomous key](http://en.wikipedia.org/wiki/Single-access_key). If a criterion is matched, a value is determined, and if not, additional criteria must be assessed. Eventually, additional branching will be impossible, so we write `nil` instead of a set of branches.

This nesting of pairs serves as our implementation of lists. Lists consist of a "head" value and a "tail" value, with the tail being another list. To signal the end of a list's nesting we make the tail empty, with a value we will call `nil`. By now you should have a firm grasp on the structure we have chosen for lists, as displayed by the following.

```language-coffeescript
cons(1, cons(2, cons(3, nil)))
```

A Note on Our Current Implementation
------------------------------------
The current implementation in which we are involved is odd for the following reason. We are implementing our data structures and simple operators on top of a completely robust language. Thus some odd definitions will arise, mostly only in our primitive values. These odd definitions would usually be those implemented in a machine specific manner, dealing with RAM and the inner-workings of a computer. The following will include a list of primitives, keep in mind that definitions of all these primitives are implementation specific and involve concepts upon which you should not dwell.

Elementary List Functions
-------------------------
We will now take a moment to discuss the elementary functions with which we can make more complex manipulations of our newly made data-structure. 

- `atom(x)` - returns `true` if the value is atomic, `false` if it is a list.
- `x == y` - returns whether two atomic values are equal.
- `car(x)` - returns the first value of a list, the head.
- `cdr(x)` - returns the rest of a list, the tail.
- `cons(x,y)` - constructs a list of the two provided values.

The following are the CoffeeScript specific implementations of the above primitives which have yet to be defined.

```language-coffeescript
atom = (x) -> typeof(x) != 'function'
car = (x) -> x(true)
cdr = (x) -> x(false)
```

Recursive Pair Functions
------------------------
Our chosen structure for lists is intentionally self-similar. Thus the best way of manipulating the lists is with recursive functions. A recursive function invokes itself. For example, a factorial function of 5 multiples 5 by the factorial of 4, that is, 5 by 4 by the factorial of 3, ..., that is 5 by 4 by 3 by 2 by 1. Our functions will have a similar structure. Let's begin with an example.

- `ff(x)` - The first atomic value of a list, ignoring nesting.

```language-coffeescript
ff = (list) -> switch
	when atom(car(list)) then car(list)
	else ff(car(list))
```

Let's see how an example behaves.

```language-coffeescript
ff(cons(cons(a, b), c)) 
	= switch
		when atom(car(cons(cons(a, b), c))) then car(cons(cons(a, b), c))
		else ff(car(cons(cons(a, b), c)))
	= switch
		when atom(cons(a, b)) then cons(a, b)
		else ff(cons(a, b))
	= switch
		when false then cons(a, b)
		else ff(cons(a, b))
	= ff(cons(a, b))
	= switch
		when atom(car(cons(a, b))) then car(cons(a, b))
		else ff(car(cons(a, b)))
	= switch
		when atom(a) then a
		else ff(a)
	= switch
		when true then a
		else ff(a)
	= a
```

- `subst(a, b, x)` - The result of substituting `a` for `b` throughout a list `x`.

```language-coffeescript
subst = (a, b, x) -> switch
	when atom(x) then (switch
		when x == b then a
		else x)
	else cons(subst(a, b, car(x)), subst(a, b, cdr(x)))
```

- `equal(x, y)` - returns `true` if `x` and `y` are the same list, `false` otherwise.

```language-coffeescript
equal = (x, y) -> (atom(x) and atom(y) and x == y) or 
				  (not atom(x) and not atom(y) and 
				  equal(car(x), car(y)) and 
				  equal(cdr(x), cdr(y)))
```

Lists
-----
We will now take a moment to create more legible notation for our nested pairs, or lists. The following axioms should make clear our new syntax. Note that as we are acting within CoffeeScript, a function is required to parse our new syntax, `_`. The mechanics of this function are irrelevant, as it serves only to allow a more concise notation.

1. `car(_(1,2,...n)) = 1`
2. `cdr(_(1,2,...n)) = _(2,3,...n)`
3. `cdr(_(1)) = nil`
4. `cons(1, _(2,3,...n)) = _(1,2,...n)`
5. `cons(1, nil) = _(1)`

The following is the CoffeeScript specific implementation of our `_` shorthand.
```language-coffeescript
_ = (members...) -> switch members.length
	when 0 then nil
	else cons(members[0], _.apply({}, members.slice(1)))
```


Additionally we define `isNil(x)` as follows.

```language-coffeescript
isNil = (x) -> atom(x) and x == nil
```

This function is often useful when dealing with lists.
Compositions of `car` and `cdr` appear so often that we provide the following abbreviations.

- `cadr(x)` for `car(cdr(x))`
- `caddr(x)` for `car(cdr(cdr(x)))`, etc.

The following functions are useful when interpreting these nested pairs as lists.

- `append(x,y)`

```language-coffeescript
append = (x,y) -> switch
	when isNil(x) then y
	else cons(car(x), append(cdr(x), y))
```

As an example, `append(_(a,b), _(c,d,e))` = `_(a,b,c,d,e)`.

- `among(x,y)` - returns `true` if the expression `x` occurs as a member of the list `y`.

```language-coffeescript
among = (x,y) -> not isNil(y) and (equal(x, car(y)) or among(x, cdr(y)))
```

- `pair(x,y)` - pairs up corresponding items of two lists

```language-coffeescript
pair = (x,y) -> switch
	when isNil(x) and isNil(y) then nil
	when not atom(x) and not atom(y) then 
		 cons(cons(car(x), cons(car(y), nil)), pair(cdr(x), cdr(y)))
	else nil
```

- `assoc(x,y)` - For `y` of the form `_(_(u1, v1), ..._(un, vn))` and `x` is one of the u's, then `assoc(x,y)` is the corresponding v.

```language-coffeescript
assoc = (x,y) -> switch
	when caar(y) == x then cadar(y)
	else assoc(x, cdr(y))
```

- `sublis(x,y)` - For `x` of the form `_(_(u1, v1), ..._(un, vn))` where each `u` is atomic and `y` may be any expression, `sublis(x,y)` is the result of substituting each `v` for the corresponding `u` in `y`. We start by defining an intermediary function.

```language-coffeescript
sub2 = (x,z) -> switch
	when isNil(x) then z 
	when equal(caar(x), z) then cadar(x)
	else sub2(cdr(x), z)
```

and

```language-coffeescript
sublis = (x, y) -> switch
	when atom(y) then sub2(x, y)
	else cons(sublis(x, car(y)), sublis(x, cdr(y)))
```

Interpretation of Programming Languages
---------------------------------------
We have successfully amassed a library of useful functions on our lists. This library directly corresponds with that built-up in [John McCarthy](http://en.wikipedia.org/wiki/John_McCarthy_(computer_scientist))'s paper, [Recursive Functions of Symbolic Expressions and Their Computation by Machine](http://www-formal.stanford.edu/jmc/recursive.pdf). At this point he goes on to discuss the interpretation and implementation of the language on which his paper was written. We, however, will not discuss an interpreter of CoffeeScript.

At this point I would suggest you either jump right into McCarthy's [paper](http://www-formal.stanford.edu/jmc/recursive.pdf), or become familiar with interpretation through an article written in JavaScript, the language on which CoffeeScript is based, right [here](http://mattneary.com/#!/interpret.md). I plan on writing an article tracing the second portion of McCarthy's paper eventually.