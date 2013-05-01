Introduction
============
Lambda Calculus is a very bare-bones language, and at first site it seems full-fledged programs would be impossible in such a syntactically restrictive language. However, as I wish to make clear, with certain design decisions, made from within the language, we can make a more welcoming environment for development.

Recursion
=========
*NOTE: the following functions would be unnecessary if the interpreter had built-in lazy evaluation.*

As one would expect from a functional language, recursion plays a huge role in the implementation of algorithms in the Lambda Calculus. To aid in recursion, we will construct two functions to control evaluation of expressions, preventing infinitely recursive definitions.

The first of the functions is "\`". The function "\`" may be referred to as the quote function and delays evaluation of an expression. It is equivalent to the prefix `λ_->`.

The second of the functions is ",". The function "," unquotes expressions, and thus will evaluate a "queued" value after deciding a branch in recursion.

As an example, we define the factorial function as follows, where `PRED` is the predecessor function and `MULT` is multiplication.

```language-lambda
FACT = λn->, ((ISZERO n) (` ONE) (` MULT n (FACT (PRED n))))
```

Output
======
Functions for outputting values to the outside-world are provided, namely, `NUM`, `BOOL`, `CHAR`, and `LIST`. Their respective uses are self-evident. Future examples will include outputted values beneath certain expressions, the use of an output function is intended to be implied. Additionally, you may wish to note the format of these annotations; "\`" can be used to mark a line as a comment.

Numbers
=======
Everything in Lambda Calculus is a function, and so in order to represent numbers, we will need to design a functional interpretation of numbers themselves. The [standard](http://en.wikipedia.org/wiki/Church_numeral) interpretation is best made clear in the following, where `SUCC` is the successor function.

```language-lambda
ZERO = λf->λn->n
ONE = λf->λn->f n
TWO = λf->λn->f (f n)

ONE SUCC ZERO
` => SUCC ZERO => ONE

TWO SUCC ONE
` => SUCC (SUCC ONE) => THREE
```

As you can see, a number `n`, serves as a means of applying a function `n` times to a base value. This is a very fundamental concept in Lambda Calculus; however, we will build upon this for the sake of convenience in implementation. Our goal will be to construct a function of digits bearing their value as a decimal string.

```language-lambda
NAUGHT = λf->λn->TRUE
ISNAUGHT = λn->n (λx->x) FALSE
# = λA->λB->(ISNAUGHT B) A (# (ADD (MULT TEN A) B))
# ONE ONE ZERO NAUGHT
` => 110
```

Note that `NAUGHT` is used as a delimiter of the numbers, a standard of our designs. Henceforth we will take it as a given that each single digit number represents its functional form. Exploring further this idea of n-ary functions of numbers, we will implement a sum function.

```language-lambda
ADD = λA->λB->A SUCC B
+ = λA->λB->(ISNAUGHT B) A (+ (ADD A B))
+ 9 4 3 NAUGHT
` => 16
```

We now wish to expand this idea of n-ary functions to other types, calling upon the idea of polymorphism.

Polymorphism
============
Polymorphism is the quality of a function that works on multiple types. Our idea of polymorphism will we wrapping values as singletons to allow for a sort of generic type, a list type. For convenience, we will begin by defining shorthands for converting to and from singletons.

```language-lambda
* = λA->PAIR A NIL
& = FST
```

The first advantage of polymorphism we will encounter is the ability to have a universal delimiter, `NIL`, that works with lists of all sorts. This will allow us to make an n-ary function composer, which would have otherwise been impossible, given that the arity of functions varies and thus evaluation of an arbitrary function would be impossible, thus determination of a delimiter, in turn, would be impossible. The definition of this composer is as follows.

```language-lambda
.* = λX->λF->(NULL F) X (.* ((& F) X))
.* 2 (* (ADD 3)) (* (ADD 4)) NIL
` => 9
```

Note that we made use of our singleton shorthands and, furthermore, that we chose to name the composer `.*`. The `*` reflects that this is an n-ary, polymorphic function. We will now define another n-ary, polymorphic function, this time a list constructor.

This list constructor will prove to have a rather complex implementation, one drawing upon many concepts.

```language-lambda
PUSH = λL->λX->, ((NULL (SND L)) (` PAIR (FST L) (PAIR X NIL)) (` PAIR (FST L) (PUSH (SND L) X)))
CONS* = λA->λB->(NULL B) A (CONS* (PUSH A (& B)))
CONS* (* 1) (* TRUE) (* 2) NIL
` => (1,(TRUE,(2,())))
```

As you can see, we began by defining a push function that serves to insert a given value at the end of a list. We then defined `CONS*` recursively as a list having pushed passed values, converted from singletons, to its end. This notation that allows for polymorphic functions can at times prove very cumbersome and even superfluous. For this sake, we will provide a means of converting n-ary, polymorphic functions to their number-specific form. Drawing from Mathematics we will call this function `Z`.

```language-lambda
Z = λF->λX->(ISNAUGHT X) (F NIL) (Z (F (* X)))
Z CONS* 1 2 3 NAUGHT
` => (1,(2,(3,())))
```

Lists
=====
With a solid foundation for lists, having built `PUSH` and `CONS*` functions, we will attempt to implement a couple functions very useful in dealing with lists, namely, `MAP` and `REDUCE`.

```language-lambda
MAP = λF->λL->, ((NULL L) (` NIL) (` PAIR (F (FST L)) (MAP F (SND L))))
REDUCE = λF->λA->λL->, ((NULL L) (` A) (` REDUCE F (F A (FST L)) (SND L)))
NUMS = MAP SUCC (Z CONS* 1 2 3 NAUGHT)
` => (2,(3,(4,())))
REDUCE ADD NUMS
` => 9
```

We now have some simple ways of manipulating lists, and hopefully the methods used in performing such manipulations are somewhat evident. To output these lists, one uses the `LIST` function. For example:

```language-lambda
LIST NUM (Z CONS* 1 2 3 NAUGHT)
` => 1:2:3:[]
```

However, given that the `CONS*` function is polymorphic, we may wish to output mixed values, in which case the providing of a type rendering function, e.g., `NUM`, would not be possible. Thus we will now investigate explicit typing of values.

Types
=====
For the explicit typing of values, the functions `*NUM`, `*BOOL`, `*CHAR`, and `*LIST` are included. Other than `*LIST`, which maps an explicitly typed list to its rendered values, the typing functions serve as a means of explicitly providing the type of a value. Additionally, `ID` either outputs an already rendered value, or can serve as the type of a list to be outputted, namely, one that contains already rendered values. For example:

```language-lambda
ID (*NUM 1)
` => 1
LIST ID (*LIST (CONS (* (PAIR *NUM 9)) (PAIR *BOOL TRUE) NIL))
` => 9:true:[]
```

Note that explicitly typed lists contain type-value pairs, e.g., `PAIR *NUM 9`. Recall, also, that `*LIST` renders an explicitly typed list, and `ID` should then be paired with `LIST` to output these values. This system of typing may seem overly complex, but provides the power to render arbitrary structures when debugging, for example.

Text
====
Text strings are a very natural continuation of previously covered topics. A string is merely a list of numbers, and so we have already discussed a means of constructing them. Additionally, a special outputting function is provided for strings to exclude the punctuation of a generic list, namely, `STRING`.

```language-lambda
GREET = (Z CONS* (# 9 7 NAUGHT) (# 9 8 NAUGHT) (# 9 9 NAUGHT) NAUGHT)
STRING GREET
` => "abc"
```

Conclusion
==========
We have implemented functions to simplify the handling of numbers, booleans, and lists. Additionally, we discussed polymorphism and typing in the Lambda Calculus, a very difficult but necessary topic to address. With these functions in your toolkit, either by your own inclusion of them or your use of [my interpreter](https://github.com/mattneary/Lambda-Calculus-Interpreter), the potential to develop full-fledged programs in the Lambda Calculus is hopefully a lot clearer.