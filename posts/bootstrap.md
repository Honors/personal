Bootstrapping Lambda Calculus
=============================
Elementary Functions
--------------------
We begin by defining some boolean operators in Lambda Calculus.

```language-lambda
TRUE = λx->λy->x
FALSE = λx->λy->y
AND = λp->λq->p q p
OR = λp->λq->p p q
NOT = λp->λa->λb->p b a
```

Now we begin with some elementary functions of S-Expressions.

```language-lambda
CONS = λx->λy->λf->f x y
CAR = λp->p TRUE
CDR = λp->p FALSE
```

For the sake of uniformity in our S-Expressions, we will provide a `*` function for the construction of a singleton, `&` for its reduction, and `ATOM` to identify whether a value is atomic, that is, a mere singleton, rather than being an S-Expression.

```language-lambda
* = λx->CONS x NIL
& = CAR
ATOM = λx->NULL (CDR x)
```

Our delimiter will be `NIL`, but the singleton form of this would be `* NIL`. Thus we have:

```language-lambda
NIL = λx->TRUE
NULL = λp->p (λx->λy->FALSE)
END = * NIL
ISEND = λx->NULL (& x)
```

We provide sufficient definitions for inductive definition of the integers as follows.

```language-lambda
0 = λf->λn->n
SUCC = λx->λf->λn->f (x f n)
```

The additional single digits are defined as `1 = SUCC 0`, `2 = SUCC 1`, etc.

Now we provide sufficient definitions for recognition of equality through subtraction.

```language-lambda
PRED = λn->λf->λx->n (λg->λh->h (g f)) (λu->x) (λu->u)
SUB = λm->λn->n PRED m
ISZERO = λn->n (λx->FALSE) TRUE
LEQ = λm->λn->ISZERO (SUB m n)
EQ = λm->λn->AND (LEQ (& m) (& n)) (LEQ (& n) (& m))
```

We will now define a shorthand for decimal integers through the `#` function with `.` as the delimiter to an argument list of arbitrary size.

```language-lambda
ADD = λA->λB->A SUCC B
MULT = λA->λB->λf->λn->A (ADD B) n
. = λf->λn->TRUE
ISNUMEND = λn->n (λx->x) FALSE
TEN = SUCC 9
# = λA->λB->(ISNUMEND B) (* A) (# (ADD (MULT TEN A) B))
```

Note that numbers constructed with `#` are singletons, as that is the standard form with which we will deal.

We now define a function for construction of lists similar to our means of construction of numbers. Take a moment to note the use of "\`" and "," in the `PUSH` function, this allows us to avoid infinite recursion by delaying evaluation of the quoted value (marked by "\`").

```language-lambda
PUSH = λL->λX->, ((NULL (CDR L)) (` CONS (CAR L) (CONS X NIL)) (` CONS (CAR L) (PUSH (CDR L) X)))
; = NIL
list = λA->λB->(NULL B) (PUSH A NIL) (list (PUSH A B))
```

Thus we have defined the following which will serve as our elementary functions of S-Expressions.

- `ATOM` - A function of a single value to determine whether it is atomic of a list.
- `EQ` - A function of two atomic values returning whether they are equal.
- `CONS` - A pair constructor.
- `CAR` - A function of a pair returning the first value.
- `CDR` - A function of a pair returning the second value.

These functions will prove very useful in manipulation of lists, and so we will reflect on the behavior of this combination.

- `CONS (* 1) (list (* (* 2)) (* 3) ;)` = `list (* (* 1)) (* 2) (* 3) ;`
- `CAR (list (* (* 1)) (* 2) (* 3) ;)` = `(* 1)`
- `CDR (list (* (* 1)) (* 2) (* 3) ;)` = `(list (* (* 2)) (* 3) ;)`

- `ATOM (list (* (* 1)) (* 2) (* 3) ;)` = `FALSE`
- `ATOM (CAR (list (* (* 1)) (* 2) (* 3) ;))` = `TRUE`

Functions of S-Expressions
--------------------------
We provide the following shorthands for repeated use of `CAR` and `CDR`.

```language-lambda
CAAR = λx->CAR (CAR x)
CADR = λx->CDR (CAR x)
CDAR = λx->CAR (CDR x)
CADDR = λx->CAR (CDR (CDR x))
CADAR = λx->CAR (CDR (CAR x))
CDDDR = λx->CDR (CDR (CDR x))
CADDDR = λx->CAR (CDR (CDR (CDR x)))
```

We will now venture to create some basic functions of S-Expressions.

```language-lambda
ff = λL->, ((ATOM (CAR L)) (` CAR L) (` ff (CAR L)))
NUM (& (ff (list (* (# 1 2 .)) (# 2 4 .) ;)))
` => 12
```

```language-lambda
subst = λa->λb->λx->, ((ATOM x) (` (EQ x b) a x) (` CONS (subst a b (CAR x)) (subst a b (CDR x))))
LIST (LIST NUM) (subst (* 4) (* 2) (list (* (* 1)) (* 2) (* 3) ;))
` => (list (* (* 1)) (* 4) (* 3) ;)
```

```language-lambda
equal = λX->λY->, ((AND (AND (ATOM X) (ATOM Y)) (EQ X Y)) (` TRUE) (` AND (AND (NOT (ATOM X)) (NOT (ATOM Y))) (AND (equal (CAR X) (CAR Y)) (equal (CDR X) (CDR Y)))))
BOOL (equal (list (* (* 1)) (* 4) (* 3) ;) (list (* (* 1)) (* 2) (* 3) ;))
` => FALSE
```

```language-lambda
append = λX->λY->, ((NULL (CAR X)) (` Y) (` CONS (CAR X) (append (CDR X) Y)))
LIST (LIST NUM) (append (list (* (* 1)) (* 4) (* 3) ;) (list (* (* 1)) (* 2) (* 3) ;))
` => (list (* (* 1)) (* 4) (* 3) (* 1) (* 2) (* 3) ;)
```

```language-lambda
pair = λx->λy->, ((AND (NULL x) (NULL y)) (` NIL) (` (AND (NOT (ATOM x)) (NOT (ATOM y))) (CONS (CONS (CAR x) (CONS (CAR y) NIL)) (pair (CDR x) (CDR y))) NIL))
pair (list (* (* 1)) (* 4) (* 3) ;) (list (* (* 1)) (* 2) (* 3) ;)
` => (list (* (list (* 1) (* 1) ;)) (list (* 4) (* 2) ;) (list (* 3) (* 3) ;) ;)
```

```language-lambda
assoc = λx->λy->, ((EQ (CAAR y) x) (` CADAR y) (` assoc x (CDR y)))
LIST NUM (assoc (* 1) (* (list (* (* 1)) (* 2) ;)))
=> (* 2)
```

Higher-Order Functions
----------------------
We provide the following functions of functions.

```language-lambda
map = λx->λf->, ((NULL x) (` NIL) (` CONS (f (CAR x)) (MAP (CDR x) f)))
apply = λf->λargs->, ((NULL args) (` f) (` apply (f (CAR args)) (CDR args)))
```

Interpretation
--------------

We begin by defining a language scheme in which symbols are given numeric representations.

```language-lambda
"0 = * 0
"1 = * 1
"2 = * 2
"3 = * 3
"4 = * 4
"5 = * 5
"6 = * 6
"7 = * 7
"8 = * 8
"9 = * 9
"λ = # 1 0 .
"-> = # 1 1 .
"( = # 1 2 .
") = # 1 3 .
"_ = # 1 4 .
"a = # 1 5 .
"b = # 1 6 .
"c = # 1 7 .
"d = # 1 8 .
"e = # 1 9 .
"f = # 2 0 .
"g = # 2 1 .
```

The process of interpreting a string of these codes will be as follows. __NOTE__: __NESTPARENS__ has yet to be defined and the components of the __EVAL__ function have not been combined.

1. __NESTPARENS__ - Convert a parenthetical substring to a nested list. For example, `list (* "λ) "a "-> "λ "b "-> "a "( "a "b ") ;` goes to `list (* "λ) "a "-> "λ "b "-> "a (list (* "a) "b ;) ;`
2. __EVAL__ - Evaluate the list of codes.

Evaluation is broken down further into the following cases.

- `expr = (list (* "λ) ... ;)` is evaluated as `λp->eval (CDDDR expr) (CONS (list (* (CDAR x)) p ;) env)`
- `expr = (list (* LETTER) ...args ;)` is evaluated as `apply (assoc LETTER env) (map args (λa->eval a env))`
- `expr = (list (* LETTER) ;)` is evaluated as `assoc LETTER env`

Conclusion
----------
We have successfully defined an __EVAL__ function that evaluates lambda calculus expressions encoded within lambda calculus in numeric codes. This means that the feature set of the interpreter could be expanded from within the familiar syntax of lambda calculus, for example. Realistically, there is probably not a good use of this interpreter, but you could interpret our construction of the interpreter as proof of understanding the language in its entirety, given that we could now build upon the language from within it.