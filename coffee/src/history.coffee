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

	###
	# Checks if given value is type of something
	###

	isType = ( val, type ) ->
		classToType =
			'[object Boolean]': 'boolean'
			'[object Number]': 'number'
			'[object String]': 'string'
			'[object Function]': 'function'
			'[object Array]': 'array'
			'[object Date]': 'date'
			'[object RegExp]': 'regexp'
			'[object Object]': 'object'
			'[object Null]': 'null'
			'[object Undefined]': 'undefined'

		classToType[Object::toString.call(val)] is type

	fixNumber = ( val ) ->
		val = +val if isType( val, "number" )
		return val

	###
	# Reads value from object through path
	# @param obj {Object}
	# @param path {String} - e.g. 'a.foo.1.bar'
	###

	deepGet = (obj, path) ->
		# reversing the path to use Array::pop()
		path = (path.split ".").reverse().map( fixNumber ) if not isType( path, "array" )
		key = path.pop()

		# if we reach the end of the path, or the current value is undefined
		# return the current value
		if path.length is 0 or not Object::hasOwnProperty.call(obj, key)
			return obj[key]

		deepGet obj[key], path

	###
	# Writes value to object through path
	# @param obj {Object}
	# @param path {String} - e.g. 'a.foo.bar'
	# @param value {Mixed}
	# @param create {Boolean} - whether it should build non-existent tree or not
	###

	deepSet = (obj, path, value, create) ->
		create = true if not create? or create is undefined
		# reversing the path to use Array::pop()
		path = (path.split ".").reverse().map( fixNumber ) if not isType( path, "array" )
		key = path.pop()

		if path.length is 0
			return obj[key] = value

		if not Object::hasOwnProperty.call(obj, key) or obj[key] is undefined
			if create is on
				# if next key is number create an array, else create object
				if isType( path[path.length-1], "number" )
					obj[key] = []
				else
					obj[key] = {}
			else 
				throw new Error("Value not set, because creation is set to false!")

		deepSet obj[key], path, value, create
		return


	###
	# Checks if path is in a whitelisted place
	###

	isInWhitelisted = (path, whitelist) ->
		# if whitelist is empty or not defined, instantly whitelist path
		return true if not whitelist? or whitelist is undefined or (whitelist.length and whitelist.length is 0)

		matches = 0
		for item in whitelist
			# increment matches if path starts with whitelist item or vica versa
			matches++ if path.indexOf( item ) isnt -1 or item.indexOf( path ) isnt -1
		console.log matches, path
		matches > 0

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
		@__History__._forwards.push path: step.path, value: deepGet( @, step.path )
		# set current state
		deepSet( @, step.path, step.value )
		# remove last state from backwards history, because the previous state setting created a history record
		@__History__._backwards.pop()



	redo = () ->
		# get the next step from forwards history
		step = @__History__._forwards.pop()
		# save current state to backwards history
		@__History__._backwards.push path: step.path, value: deepGet( @, step.path )
		# set current state
		deepSet( @, step.path, step.value )
		# remove last state from backwards history, because the previous state setting created a history record
		@__History__._backwards.pop()





	###
	# End of history functions
	###




	observe = (obj, whitelist, extension = false, deep = true, origin, path) ->
		origin = obj if not origin? or origin is undefined
		path = [] if not path? or path is undefined
		path = path.split( "." ) if not isType( path, "array" )

		# extend the object with whitelist values here if extension is on
		# extend only if whitelist is an array
		if extension is on and isType( whitelist, array )
			# handle every item in whitelist as paths, so we can define them with deepSet() easily
			for path in whitelist
				do ( path ) ->
					# if path is undefined in the object define it with null value
					if deepGet( obj, path ) is undefined
						deepSet( obj, path, null, true )
					return
		# turn extension off, to be sure we only try to extend once
		extension = off
		# end of extension

		# if starting to record extend the object with a non-enumerable History object,
		# which handles the overall history,
		# and extend whitelisted values with the capability of undoing and redoing

		# only register __History__, redo and undo, if they're not present
		# using option enumerable: false is for preventing the History related properties to show in Object.keys()
		# configurable set to true to keep the possibility of property deletion
		# writable is set to false because we dont want users to mess with it!
		if not origin.hasOwnProperty( "__History__" )
			Object.defineProperty origin, "__History__",
				enumerable: false
				configurable: true
				value: new History()

		if not origin.hasOwnProperty( "undo" )
			Object.defineProperty origin, "undo",
				configurable: true
				enumerable: false
				writable: false
				value: (n) ->
					n = 1 if not isType( n, "number" )
					while n--
						undo.call( origin )
					@

		if not origin.hasOwnProperty( "redo" )
			Object.defineProperty origin, "redo",
				configurable: true
				enumerable: false
				writable: false
				value: (n) ->
					n = 1 if not isType( n, "number" )
					while n--
						redo.call( origin )
					@

		# default to observe everything in object
		keys = Object.keys( obj )

		for prop in keys
			do (prop) ->
				value = obj[prop]
				property = prop

				# build up path object
				path.push( property )
				# define path as String not to pass by reference
				savePath = path.join(".")

				# only go forward if path is in whitelisted area
				if isInWhitelisted( savePath, whitelist )
					# observe recursively if deep observe is turned on 
					if value? and ( isType( value, 'object') or isType( value, 'array') ) and deep is on
						observe( value, whitelist, extension, deep, origin, savePath )
					
					# otherwise observe object property
					# if deep observe is turned off, we cant observe objects and arrays
					else
						Object.defineProperty obj, prop,
							enumerable: true
							configurable: true
							# getter remains the same
							get: () ->
								prop
							# setter modified to save old values to __History__ before
							set: (newVal) ->
								step = path: savePath, value: prop
								origin.__History__._backwards.push step
								prop = newVal

						# set initial value
						obj[property] = value

						# remove initial value set from history
						origin.__History__._backwards.pop()

				# remove last item from path to correct for next item
				path.pop()
				return
		return

	unobserve = (obj) ->
		# remove the __History__, undo and redo
		delete obj.__History__
		delete obj.undo
		delete obj.redo

		for prop, val of obj
			do (prop, val) ->
				# redefine all property with current value
				if val? and isType( val, "object" ) or isType( val, "array" )
					unobserve( val )
				else
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