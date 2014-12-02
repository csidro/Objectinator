
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
	# @param invitoPath {String} - e.g. 'a.foo.1.bar'
	###

	invito: (obj, invitoPath) ->
		# reversing the path to use Array::pop()
		path = invitoPath
		path = (path.split ".").reverse().map(@fixKey) if not @isArray path
		key = path.pop()

		# if we reach the end of the path, or the current value is undefined
		# return the current value
		if path.length is 0 or not Object::hasOwnProperty.call(obj, key)
			return obj[key]

		@invito obj[key], path
		return


	###
	# Writes value to object through path
	# @param obj {Object}
	# @param missitoPath {String} - e.g. 'a.foo.bar'
	# @param value {Mixed}
	# @param create {Boolean} - whether it should build non-existent tree or not
	###

	missito: (obj, missitoPath, value, create) ->
		create = true if not create? or create is undefined
		path = missitoPath
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
	# @param evaporesPath {String|Reversed array}
	###

	evapores: (obj, evaporesPath) ->
		path = evaporesPath
		path = (path.split ".").map( @fixKey ) if not @isArray path
		key = path.pop()
		path.reverse()

		parent = @invito obj, path

		delete parent[key] if @isObject( parent )
		parent.splice( key, 1 ) if @isArray( parent ) and @isNumeric( key )

		return


	###
	# Delete backwards until sibling is found
	# @param obj
	# @param evaporesPath
	###

	evaporesMaxima: (obj, evaporesPath) ->
		path = evaporesPath
		path = (path.split ".").map( @fixKey ) if not @isArray path

		# go backwards until sibling is found
		while @siblingumRevelio( obj, path ).length is 0
			path.pop()

		# when sibling found, delete from current path
		@evapores( obj, path )
		return



	###
	# Reduce objects not used trees
	# First
	# @param obj {Object}
	###

	reductoValues: [undefined, null, "", [], {}]
	reducto: (obj, path, origin) ->
		path = [] if not path? or path is undefined
		origin = obj if not origin? or origin is undefined


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