((context, factory)->
	if typeof define is 'function' and define.amd
		define([], factory);

	else if typeof module isnt 'undefined' and module.exports
		module.exports = factory()

	else
		context["ObjectHistory"] = factory()

	return
)(@, () ->

	###
	Basic helper functions
	###


	isType: ( val, type ) ->



	###
	End of helper functions
	###


	# History prototype

	class History
		constructor: () ->
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




	observe = (obj, whitelist, deep = true, extension = false, origin, path) ->
		origin = obj if not origin? or origin is undefined
		path = [] if not path? or path is undefined
		path = path.split( "." ) if not ( Object::toString.call( val ) is "[object Array]" )
		# if starting to record extend the object with a non-enumerable History object,
		# which handles the overall history,
		# and extend whitelisted values with the capability of undoing and redoing

		Object.defineProperty obj, "__History__",
			enumerable: false
			configurable: true
			value: new History(false)

		# register undo property
		Object.defineProperty obj, "undo",
			configurable: true # set to true, than it can be removed later
			enumerable: false
			writable: false
			value: (n) ->
				# if a number passed as the first argument, redo the changes n times
				if typeof n is "number"
					while n--
						undo.call( obj )
				else
					undo.call( obj )
				@

		# register redo property
		Object.defineProperty obj, "redo",
			configurable: true # set to true, than it can be removed later
			enumerable: false
			writable: false
			value: (n) ->
				# if a number passed as the first argument, redo the changes n times
				if typeof n is "number"
					while n--
						redo.call( obj )
				else
					redo.call( obj )
				@

		keys = Object.keys( obj )
		if whitelist? and deep is off
			keys = whitelist
			keys = ( key for key in Object.keys( obj ) when whitelist.indexOf( key ) isnt -1 ) if extension is off

		for prop in keys
			do (prop) ->
				
				value = obj[prop]
				property = prop

				if isType( value, 'object') or isType( value, 'array') and deep is on
					path.push( prop )
					observe( value, whitelist, deep, extension, origin, path.join(".") )
				else if isType( value, 'object') or isType( value, 'array') and deep is off
					return

				Object.defineProperty obj, prop,
					enumerable: true
					configurable: true

					get: () ->
						prop
					set: (newVal) ->
						step = key: property, value: prop
						@__History__._backwards.push step
						prop = newVal

				obj[property] = value
				return

		return

	unobserve = (obj) ->
		# remove the __History__ object
		delete obj.__History__
		delete obj.undo
		delete obj.redo

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