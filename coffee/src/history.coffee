((context, factory)->
	if typeof define is 'function' and define.amd
		define([], factory);

	else if typeof module isnt 'undefined' and module.exports
		module.exports = factory()

	else
		context["ObjectHistory"] = factory()

	return
)(@, () ->

	class History
		constructor: (@isChild = true) ->
			@_backwards = []
			@_forwards = []

	###
	# History functions
	###


	undo = () ->
		# get the next step from backwards history
		step = @__History__._backwards.pop()
		# save current state to forwards history
		@__History__._forwards.push key: step.key, value: @[step.key]
		# set current state
		@[step.key] = step.value
		# remove last state from backwards history, because the previous state setting created a history record
		@__History__._backwards.pop()



	redo = () ->
		# get the next step from forwards history
		step = @__History__._forwards.pop()
		# save current state to backwards history
		@__History__._backwards.push key: step.key, value: @[step.key]
		# set current state
		@[step.key] = step.value
		# remove last state from backwards history, because the previous state setting created a history record
		@__History__._backwards.pop()





	###
	# End of history functions
	###




	observe = (obj) ->
		# if starting to record extend the object with a non-enumerable History object,
		# which handles the overall history,
		# and extend whitelisted values with the capability of undoing and redoing

		Object.defineProperty obj, "__History__",
			enumerable: false
			configurable: true
			value: new History(false)

		Object.defineProperty obj, "undo",
			enumerable: false
			configurable: false
			writable: false
			value: (n) ->
				# if a number passed as the first argument, redo the changes n times
				if typeof n is "number"
					while n--
						undo.call(@)
				else
					undo.call(@)
				@

		Object.defineProperty obj, "redo",
			enumerable: false
			configurable: false
			writable: false

			value: (n) ->
				# if a number passed as the first argument, redo the changes n times
				if typeof n is "number"
					while n--
						redo.call(@)
				else
					redo.call(@)
				@


		for prop in Object.keys(obj)
			do (prop) ->
				
				value = obj[prop]
				property = prop

				Object.defineProperty obj, prop,
					get: () ->
						prop
					set: (newVal) ->
						step = key: property, value: prop
						@__History__._backwards.push step
						prop = newVal

				obj[property] = value

		return

	unobserve = (obj) ->
		# remove the __History__ object
		delete obj.__History__

		for prop, val of obj
			do (prop, val) ->
				# redefine all property with current value
				Object.defineProperty obj, prop,
					writable: true
					configurable: true
					enumerable: true
					value: val

		return

	return {
		observe: observe
		unobserve: unobserve
	}
)