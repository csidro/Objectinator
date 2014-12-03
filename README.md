# Objectinator

Objectinator is helper to extend Objects behavior.


## ObjectHistory

With object history, you can undo and redo changes in objects. This method is not using `Object.observe()`, therefore it isn't capable of observing property creation and deletion, unless properties are created with obj.addObservable() and deleted with obj.removeObservable()

**Usage**
```
object = {a: 1, b: 2}
observe(object)

object.a = 5
object.b = 10

object.undo() 				// {a: 5, b: 2}
object.redo() 				// {a: 5, b: 10}
object.undo().undo() 	// {a: 1, b: 2}
object.redo(2) 				// {a: 5, b: 10}

unobserve(object)
```

**Plan:**
- addObservable/removeObservable
- set flags and switch states between flags
- add observable properties while observing
- **deep observe**


### Whitelist-based observing

Only those property will be observed, which are whitelisted.
**Non-existent or not enumerable properties won't be observed!**

```
object = {foo: 1, baz: 2}
whitelist = ["foo", "bar"]
observe(object, whitelist)
```

Only object.foo will be observed!


### Whitelist-based observing with object extension

The difference between this and the basic one is: this method extends the object if it hasn't have own property.
```
observe(object, whitelist, true)
```

### undo/redo changes given times

Although the processes are chainable, it comes handy when you have to undo changes 24 times.

```
object.undo().undo().undo().undo() === object.undo(4)
```

============================
## ObjectoPatronum

Objecto Patronum is a **magical way** to get data from a tree through an object path. Although it uses mostly incantations from Harry Potter - or something like that -, it can be used the similar way, like get and set.

** In all example we have the following object **
```
obj = {
	a: 1,
	b: [null, 1, 2, 3, {c: 4, d: undefined}]
	e: {
		f: 5,
		g: 6,
		h: ""
		i: "test",
		j: []
		k: {}
		l: {
			m: {
				n: {
					o: undefined
				}
			}
		}
	}
}
```

#### invito / get
Get value at path

```
invito(obj, "a")						// 1
invito(obj, "a.0")					// undefined

invito(obj, "b.0")					// null
invito(obj, "b.2")					// 2
invito(obj, "b.4")					// {c: 4, d: undefined}

invito(obj, "b.4.c")				// 4

invito(obj, "e.l.m.n")			// {o: undefined}
invito(obj, "e.l.m.n.o")		// undefined
```

#### missito / set
Set value at path and extend object if path not exists
```
missito(obj, "e.l.m.p", "sugar")		// "sugar"
```

Set value at path, but only if path exists
```
missito(obj, "e.l.m.p", "sugar", false)		// undefined
```

#### evapores / remove
Remove property
```
evapores(obj, "e.l.m.n.o") 			// delete obj.e.l.m.n.o
```

#### evaporesMaxima / removeBackwards
Remove properties backwards until there are siblings
```
evaporesMaxima(obj, "e.l.m.n.o")		// delete obj.e.l
```

#### siblingumRevelio / getSiblings
Get the sibling properties of path
```
siblingumRevelio(obj, "a") 				// ["b", "e"]
siblingumRevelio(obj, "e.i") 			// ["f", "g", "h", "j", "k", "l"]
```

#### reparo / repair
Fixes array indexing
```
arr = [0, 1, 2, 3, 4]

delete arr[0]
delete arr[2]

// [undefined, 1, undefined, 3, 4]

reparo(arr) 			// [1, 3, 4]
```

#### reducto / reduce
Reduce objects size.
Set what values or keys you don't need, and this removes all of them from the tree.
default values: undefined, null, "", [], {}
default keys: "i" (just for fun)
```
reducto(obj)
```
The object's structure will look like this:
```
{
	a: 1,
	b: [1, 2, 3, {c: 4}]
	e: {
		f: 5,
		g: 6
	}
}
```