Proving a Rudimentary Fact
==========================
I was recently asked how to compute 2+2. The following is a simplified version of a proof, drawing from Russell's *Principia Mathemtica* in saying that union with a disjoint singleton increments cardinality, the Axiom of Choice, and simple set notation.

<div>
$$
\begin{align*}
   		&\vdash \mathbb{0} = \{\emptyset\}
\\ (a)	&\vdash \mathbb{1} = \{a \mid (\exists b)( a = \{b\})\}
\\ 		&\vdash (\forall x)(x \cup \emptyset = x)
\\ (b)	&\vdash \forall x \text{ inc } x = x \cup \{x\}
\\ (c)	&\vdash (\forall A \in \{\mathbb{0}, \mathbb{1},\ldots\})(\text{suc } A = \{a \mid a \setminus g(a) \in A, \text{ with choice function } g\})
\\ (d)	&\vdash \mathbb{2} = \text{suc } \mathbb{1}, \mathbb{3} = \text{suc } \mathbb{2}, \mathbb{4} = \text{suc } \mathbb{3}, \cdots
\\ (e)	&\vdash (\forall A \in \{\mathbb{0}, \mathbb{1}, \ldots\})(\forall a \in A, b \in \mathbb{1})((a \cap b = \emptyset) \iff (a \cup b \in \text{suc } A))
\\ (f)	&\vdash (\forall A,B \in \{\mathbb{0}, \mathbb{1}, \ldots\})(\forall a \in A, b \in B)
\\
& \qquad a + b = \begin{cases}
a, & \text{if }B = \emptyset, \\
\text{inc } (a + c), & \text{if }(\exists c)(b = \text{inc } c)
\end{cases}
\\
\\
\\		&\vdash z_{1},z_{2} \in \mathbb{0}
\\		&\vdash (\forall z \in \mathbb{0})((t = \text{inc }(\text{inc } z)) \implies (t = \mathbb{2}))	\tag{by $\textit{e}$}
\\		&\vdash t_{1} = \text{inc }(\text{inc }z_{1}), t_{2} = \text{inc }(\text{inc }z_{2})
\\		&\vdash t_{1} + t_{2} = \text{inc }(t_{1} + \text{inc } z_{2})	\tag{by $\textit{f}$}
\\		&\implies t_{1} + t_{2} = \text{inc }(\text{inc } (t_{1} + z_{2}))
\\		&\implies t_{1} + t_{2} = \text{inc }(\text{inc } (t_{1} + \emptyset))
\\		&\implies t_{1} + t_{2} = \text{inc }(\text{inc } (t_{1})
\\		&\implies t_{1} + t_{2} = \text{inc }(\text{inc } (\text{inc } (\text{inc } z_{1}))
\\		&\implies t_{1} + t_{2} = \text{inc }(\text{inc } (\text{inc } (\text{inc } \emptyset))
\\		&\implies t_{1} + t_{2} = \{\emptyset, \{\emptyset\}, \{\emptyset, \{\emptyset\}\}, \{\emptyset, \{\emptyset\}, \{\emptyset, \{\emptyset\}\}\}\}		\tag{by $\textit{b}$}
\\		&\vdash (t_{1} + t_{2}) \setminus \{\emptyset, \{\emptyset\}, \{\emptyset, \{\emptyset\}\}\} \setminus \{\emptyset, \{\emptyset\}\} \setminus \{\emptyset\} = \{\emptyset\}
\\		&\vdash (t_{1} + t_{2}) \setminus \{\emptyset, \{\emptyset\}, \{\emptyset, \{\emptyset\}\}\} \setminus \{\emptyset, \{\emptyset\}\} \setminus \{\emptyset\} \in \mathbb{1}		\tag{by $\textit{a}$}
\\		&\vdash (t_{1} + t_{2}) \setminus \{\emptyset, \{\emptyset\}, \{\emptyset, \{\emptyset\}\}\} \setminus \{\emptyset, \{\emptyset\}\} \in \text{suc } \mathbb{1}	\tag{by $\textit{c}$}
\\		&\vdash (t_{1} + t_{2}) \setminus \{\emptyset, \{\emptyset\}, \{\emptyset, \{\emptyset\}\}\} \in \text{suc } (\text{suc } \mathbb{1})		\tag{by $\textit{c}$}
\\		&\vdash (t_{1} + t_{2}) \in \text{suc } (\text{suc } (\text{suc } \mathbb{1}))		\tag{by $\textit{c}$}
\\		&\vdash t_{1} + t_{2} \in \mathbb{4}	\tag{by $\textit{d}$}
\end{align*}
$$
</div>