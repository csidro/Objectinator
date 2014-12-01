
class History
	constructor: () ->
		@_backwards = []
		@_forwards = []

observe = (obj) ->
	# if starting to record extend the object with a non-enumerable History object,
	# which handles the overall history,
	# and extend whitelisted values with the capability of undoing and redoing

	Object.defineProperty obj, "__History__",
		enumerable: false
		configurable: false
		value: new History

	Object.defineProperty obj, "undo",
		enumerable: false
		configurable: false
		writable: false
		value: () ->
			fn = () ->
				step = @__History__._backwards.pop()
				@__History__._forwards.push key: step.key, value: @[step.key]
				@[step.key] = step.value
				@__History__._backwards.pop()

			if arguments[0] and typeof arguments[0] is "number"
				i = arguments[0]
				while i--
					fn.call(@)
			else
				fn.call(@)
			@

	Object.defineProperty obj, "redo",
		enumerable: false
		configurable: false
		writable: false
		value: () ->
			fn = () ->
				step = @__History__._forwards.pop()
				@__History__._backwards.push key: step.key, value: @[step.key]
				@[step.key] = step.value
				@__History__._backwards.pop()

			if arguments[0] and typeof arguments[0] is "number"
				i = arguments[0]
				while i--
					fn.call(@)
			else
				fn.call(@)
			@


	for prop in Object.keys(obj)
		do (prop) ->
			value = obj[prop]
			property = prop
			Object.defineProperty obj, prop,
				get: () ->
					prop
				set: (newVal) ->
					step = 
						key: property
						value: prop
					@__History__._backwards.push step
					prop = newVal
					return
			obj[property] = value

	return


a = foo: 50, bar: 100

observe a

i = 50
while --i
	a.foo = i
	a.bar = i*2


