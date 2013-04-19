On Purely Functional Languages
==============================
Introduction
------------
The idea of a functional language is very foreign, distinct from a standard "object-oriented" approach to language. If you are to have a functional language, all components must themselves be functions, and as will be explained later, pure-functions at that. Take English to be a formal language, for example. If we were to "transliterate" this language to a functional one, all nouns, adjectives, et. al. would need to be replaced with functions and their manipulation of each other. Let's begin with an example:

	I hit it.

Of course we will render "hit" as the main function. Let's attempt a formal definition of the function type.

```language-types
hit: Person -> (Object -> (Person, Object))
```

Note that we have chosen to relate a hitting to a mapping of Person to Person and Object to Object. We are essentially saying that my having hit it attributes a state to both me and to it. Note, however, that there are *no* objects. Thus "I" and "It" are functions, too, functions, perhaps, that map an action and a reality to a "modified" reality (Note that there is no mutation of values, only "repackaging" or more literally, mapping to a combination of parts). Thus we have formal types, perhaps, that look similar to that which follows:

```language-types
Person: Action -> U -> U
```

Let's attempt to write out the original sentence, "I hit it" in purely functional form. Given our type definitions we would have something like:

```language-lambda
hit I it
```

And by substitution:

```language-lambda
hit (λA->λU->A U) (λA->λU->A U)
```

Of course, however, we would want to distinguish between my execution of action on the universe and that of "it". Thus we'll include a "constant of character", as it were, that will account for the idiosyncrasies of an "object" (Note that of course we have removed all objects from our language). We now have:

```language-lambda
hit (λA->λU->C A U) (λA->λU->C A U)
```

Where "C" is the prescribed constant of character. We, of course, can not explicate the definition of "hit", in general, it does not make much sense to attempt a translation of spoken-language to functional form, there are far too many required definitions. Instead, we will briefly continue with English examples and then turn to more purely logical sentences. Let's define a function for the mapping of multiple "objects" to a conjunction of multiple "objects".

	I and he are.

We thus want to use "are" to claim existence of multiple "objects"; however, rather than give the verb of being variable arity, let's map this conjunction of "objects" to a single parameter. We have:

```language-types
join: Object -> Object -> (Object, Object)
```

As an aside, take a moment to think what type "are" could be. Does it have a place in a functional language? We will explore this later. The "(,)" notation has already been used, but without definition, we will now propose a means of defining a coupling of objects.

```language-lambda
join = λA->λB->λf->f A B
```

This is obviously a very loose coupling, as it were, as the definition of coupling is delegated to a passed function. However, this construction proves easily integrated into functional language. Thus we have, substituting the name of "are" to make clear the meaning of the function:

```language-lambda
exist (join I he)
```

Now let's look at another function which would be a good governor of conjunctions, "have".

	I have a car, a house, and money.

We rewrite this:

```language-lambda
have I (join car (join house money))
```

As an aside, you may be familiar with the Lisp programming language, or a language to an extent derived from it. If so, you might know that the implementation of lists is mere syntactic sugar:

```language-lambda
(list a b c d) = (cons a (cons b (cons c (cons d nil))))
```

The inclusion of "nil" as a delimiter helps to make the list construct simpler, a purely recursive construct. If you were to implement `list -> list` functions in a purely functional language, this definition would be very helpful.

Semantics
---------
*Roots of Language* is a piece depicting the origins, acquisition, and development of language. It lists as fundamental verbs ownership, existence, possession, and location.

We have encountered, in examples, ownership, in the form of "have", and existence, in the form of "are". However, the question is, "Do these verbs have a place in a functional language?" Haskell gives us an answer which we take to be true, "No." Haskell has no variables and no mutation, ruling out all forms of attribution and existence. So following this example, we will look only at action verbs. We now address whether propositional logic and proofs are possible with action alone, keep in mind the significant role the existential and universal quantifiers play in traditional propositional logic.

Logic
-----
Let's take an example proof: "Prove that all numbers are either odd or even." This is not a particularly difficult proof, but it requires quite a few definitions which we do not yet have. We'll begin with a means of identifying whether a number is odd or even. In traditional propositional calculus, this is done by claiming existence of a constant "k" such that the number, n, equals 2k in the case of even, 2k+1 in the case of odd. Recall, however, that we do not define existence and thus we need an alternate approach. We resort to recursion and have:
	
```language-lambda	
mod2 = λx->(GT x 2)(mod2 (SUB x 2))(x)
```

As an aside, you ought to note the definition of numbers in functional language. The [Church Numerals](http://en.wikipedia.org/wiki/Church_encoding) defines numbers as folded composition, thus a number, "n", serves as a function of an action that bears the iteration of that action "n" times.

Of course pure-functions cannot use named recursion, and this is merely shorthand for use of some combinator function, such as the Y combinator. Additionally, "SUB" and "GT" are not yet defined, their definitions follow along with dependencies:

```language-lambda
ISZERO = λn->n (λx->FALSE) TRUE
PRED = λn->λf->λx->n (λg->λh->h (g f))(λu->x)(λu->u)
SUB = λa->λb->a PRED b
GT = λa->λb->NOT (ISZERO (SUB m n))
```

We now have an all inclusive means of finding n mod 2. "ISEVEN" and "ISODD" are trivial from this point:

```language-lambda
ISEVEN = λx->ISZERO (mod2 x)
ISEVEN = λx->NOT (ISZERO (mod2 x))
```

Take f to be the function that bears x mod 2 by subtracting and recursing n times, and let g be the addition of n twos. Then:

```language-lambda
x = g (f x)
```

Take x to be an even number and note that, since addition is commutative,

```language-lambda
SUCC = λn->λf->λx->f (n f x)
SUCC x = g (SUCC (f x))
```

We now have that the number subsequent "SUCC x" is odd since: 
	
```language-lambda	
f (SUCC x) = f(g (SUCC (f x)))
```

and

```language-lambda
f (g (SUCC (f x))) = SUCC (f x) = 1 
```

Similarly, the number after an odd number is even. Notice that our proof is based on the construction of an arbitrary reversing function. This may seem round-about, but consider that "subtracting n from both sides", the object-oriented equivalent doesn't seem as arbitrary.

Reflecting on our methods, we see that the key was recursion. Think of this method as the complement to inductive definition, recursive "deduction", as it were. Thus it fits very naturally with many definitions in mathematics. Note also, that functional language can implement the existential and universal quantifiers by another "search" algorithm over all possible values.

Conclusion
----------
Functional language has the expressive potential of other formal languages, hold non-action verbs, such as "have" or "be". Thus the propositional calculus must be rethought, but it can still serve as a logical foundation, as suggested by the example proof.