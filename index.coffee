###
# Implementation of History 
###

getter = () ->
	return value + 1


Object.defineProperty Object.prototype, "__defineGetter__",
	value: getter
	configurable: true
	enumerable: false