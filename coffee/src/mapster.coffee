((context, factory)->
	if typeof define is 'function' and define.amd
		define([], factory);

	else if typeof module isnt 'undefined' and module.exports
		module.exports = factory

	else
		context["Mapster"] = factory

	return
)(@, class Mapster

	constructor: () ->

	addMap: (obj, map) ->

)