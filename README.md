# Objectinator

Objectinator is helper to extend Objects behavior.


## Object History

With object history, you can undo and redo changes in objects. This method is not using `Object.observe()`, therefore it isn't capable of observing property creation and deletion.

**Usage**
```
object = {a: 1, b: 2}
observe(object)

object.a = 5
object.b = 10

object.undo() 			// {a: 5, b: 2}
object.redo() 			// {a: 5, b: 10}
object.undo().undo() 	// {a: 1, b: 2}

unobserve(object)
```

**Plan:**
- whitelist-based observing
- whitelist-based observing with object extension
- undo/redo changes given times
- undo/redo changes until reaches given value
- set flags and switch states between flags
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
observe(object, whitelist)
```

### undo/redo changes given times

Although the processes are chainable, it comes handy when you have to undo changes 24 times.

```
object.undo().undo().undo().undo() === object.undo(4)
```

### undo/redo changes until reaches given value

Processing until given property reaches the given value.

```
object.undoToValue("a:1")
```

