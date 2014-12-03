((context, factory)->
	if typeof define is 'function' and define.amd
		define([], factory);

	else if typeof module isnt 'undefined' and module.exports
		module.exports = factory()

	else
		context["objectoPatronum"] = factory()

)(@, () ->

	###
	# ObjectoPatronum is a tree helper
	###


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
		return


	###
	# Delete property from object
	# @param obj {Object}
	# @param path {String|Reversed array}
	###

	evapores: (obj, path) ->
		path = (path.split ".").map( @fixKey ) if not @isArray path
		key = path.pop()
		path.reverse()

		parent = @invito obj, path

		# use delete for arrays too, to keep indexing right
		delete parent[key]
		# delete parent[key] if @isObject( parent )
		# parent.splice( key, 1 ) if @isArray( parent ) and @isNumeric( key )

		return


	###
	# Delete backwards until sibling is found
	# @param obj
	# @param path
	###

	evaporesMaxima: (obj, path) ->
		path = (path.split ".").map( @fixKey ) if not @isArray path

		# go backwards until sibling is found
		while @siblingumRevelio( obj, path.join(".") ).length is 0
			path.pop()

		# when sibling found, delete from current path
		@evapores( obj, path )
		return


	###
	# Repairs array indexing
	# @param arr {Array}
	###

	reparo: (arr) ->
		i = 0
		while i < arr.length
			if not arr[i]? or arr[i] is undefined
				arr.splice( i, 1 )
			else
				i++
		arr


	###
	# Reduce objects not used trees
	# First
	# @param obj {Object}
	###

	reductoValues: [undefined, null, "", [], {}]
	reductoKeys: ["i"]
	reductoMap: []

	reducto: (obj) ->
		_ = @
		
		# build the reductomap
		@designo( obj )

		# loop through the map and evaporesMaxima
		@reductoMap.map (path) ->
			_.evaporesMaxima( obj, path )

		# walk through obj again and fix array indexing
		fn = (obj) ->
			obj = _.reparo( obj ) if _.isArray( obj )
			if _.isObject( obj ) or _.isArray( obj )
				keys = Object.keys( obj )
				for key in keys
					fn( obj[key] )
			return

		fn( obj )
		return


	###
	# Builds the reductoMap
	###

	designo: (obj, path, origin) ->
		origin = obj if not origin? or origin is undefined
		path = [] if not path? or path is undefined
		path = path.split( "." ) if not @isArray path

		if @isObject( obj ) or @isArray( obj )
			keys = Object.keys( obj )
			for key in keys
				path.push( key )
				@designo obj[key], path.join("."), origin
				path.pop()

		else
			evaporesPath = path.join(".")
			
			# dont start evapores just build a reducto map
			# @evaporesMaxima( origin, evaporesPath ) if @reductoValues.indexOf( obj ) isnt -1 or @reductoKeys.indexOf( path.pop() ) isnt -1
			@reductoMap.push( evaporesPath ) if @reductoValues.indexOf( obj ) isnt -1 or @reductoKeys.indexOf( path.pop() ) isnt -1
		return




	###
	# Reveals current paths sibling properties
	# @param obj {Object}
	# @param path {String}
	###

	siblingumRevelio: (obj, path) ->
		path = (path.split ".").map( @fixKey ) if not @isArray path
		key = path.pop()

		parent = @invito obj, path.join(".")

		siblings = Object.keys( parent )
		siblings.splice( siblings.indexOf( key ), 1 )
		siblings
		return

)()