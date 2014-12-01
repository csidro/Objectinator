
###
# ObjectoPatronum helps in [g|s]etting values [from|to] the deep
###

objectoPatronum = (->


	isArray: (val) ->
		Object::toString.call( val ) is "[object Array]"

	isObject: (val) ->
		Object::toString.call( val ) is "[object Object]"

	isNumeric: (val) ->
		isFinite( val ) and Object::toString.call( +val ) is "[object Number]"

	fixKey: (val) ->
		val = +val if objectoPatronum.isNumeric val
		return val


	###
	# Reads value from object through path
	# @param obj {Object}
	# @param path {String} - e.g. 'a.foo.1.bar'
	###

	invito: (obj, path) ->
		# reversing the path to use Array::pop()
		path = (path.split ".").reverse().map(@fixKey) if not @isArray path
		key = path.pop()

		# if we reach the end of the path, or the current value is undefined
		# return the current value
		if path.length is 0 or not Object::hasOwnProperty.call(obj, key)
			return obj[key]

		@invito obj[key], path


	###
	# Writes value to object through path
	# @param obj {Object}
	# @param path {String} - e.g. 'a.foo.bar'
	# @param value {Mixed}
	# @param create {Boolean} - whether it should build non-existent tree or not
	###

	missito: (obj, path, value, create) ->
		create = true if not create? or create is undefined
		# reversing the path to use Array::pop()
		path = (path.split ".").reverse().map(@fixKey) if not @isArray path
		key = path.pop()

		if path.length is 0
			return obj[key] = value

		if not Object::hasOwnProperty.call(obj, key) or obj[key] is undefined
			if create is on
				# if next key is number create an array, else create object
				if @isNumeric path[path.length-1]
					obj[key] = []
				else
					obj[key] = {}
			else 
				throw new Error("Value not set, because creation is set to false!")

		@missito obj[key], path, value, create


	###
	# Delete property from object
	# @param obj {Object}
	# @param path {String}
	###

	evapores: (obj, path) ->
		path = (path.split ".").map(@fixKey) if not @isArray path
		siblings = @siblingumRevelio obj, path
		
		if siblings.length is 0
			path.pop()
			@evapores obj, path
		else
			obj = @invito obj, path.reverse()
			delete obj[key] if not @isObject obj
			obj.splice( key, 1 ) if @isArray obj and @isNumeric key
		return


	###
	# Reduce objects not used trees
	# First
	# @param obj {Object}
	###

	reductoValues: [undefined, null, ""]
	reducto: (obj, path, origin) ->
		path = [] if not path? or path is undefined
		origin = obj if not origin? or origin is undefined

		_ = @
		
		# check if obj is object or array
		if @isObject( obj ) or @isArray( obj )
			# loop through obj keys and start the reduction process
			for key in Object.keys obj
				do (key) ->
					path.push(key)
					_.reducto obj[key], path, false, origin
					return

		# only delete path if value is in @reductoValues
		else if @reductoValues.indexOf( obj ) isnt -1
			@evapores origin, path
		return

	###
	# Reveals current paths sibling properties
	# @param obj {Object}
	# @param path {String}
	###

	siblingumRevelio: (obj, path) ->
		path = (path.split ".").map( @fixKey ) if not @isArray path
		key = path.pop()

		parent = @invito obj, path.reverse()

		siblings = Object.keys( parent )
		siblings.splice( siblings.indexOf( key ), 1 )
		siblings











)()


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
	# empty the __History__ object
	Object.defineProperty obj, "__History__",
		enumerable: false
		configurable: true
		value: new History(false)

	for prop, val of obj
		do (prop, val) ->
			# redefine all property with current value
			Object.defineProperty obj, prop,
				writable: true
				configurable: true
				enumerable: true
				value: val

	return


# observe a

# i = 50
# while --i
	# a.foo = i
	# a.bar = i*2

# unobserve a

a = 
	b: 1
	c: 
		e: undefined
		d: [null, undefined, "", [1,2,3, {a: 1, b:2}]]
		f: 
			g: "asdf"
			h:
				i: 1
				j: undefined
				k: undefined
				l:
					m:
						n:
							o: undefined