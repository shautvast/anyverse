var app = angular.module("app", []);

var markupMappings = [ {
	regex : /\*(.+)\*/,
	style : 'info fat'
}, {
	regex : /!(.+)!/,
	style : 'warning fat'
} ];

var VIEW = 'view';
var EDIT = 'edit';

function stringStartsWith(string, prefix) {
	return string.slice(0, prefix.length) == prefix;
}

function style(markup) {
	for (var i = 0; i < markupMappings.length; i++) {
		var m = markupMappings[i].regex.exec(markup);
		if (m != null) {
			return {
				classname : markupMappings[i].style,
				content : m[1]
			};
		}
	}

	return {
		classname : "default",
		content : markup
	};
}

function render(elem, data, mode) {
	if (mode === VIEW) {
		elem.bind('mouseover', function() {
			elem.css('cursor', 'pointer');
		});

		content = '<table class="table table-bordered">';

		var rows = data.split("\n");
		for (var r = 0; r < rows.length; r++) {
			content += "<tr>";
			var rowCols = rows[r].split("|");
			for (var c = 0; c < rowCols.length; c++) {
				if (rowCols[c] !== "") {
					var wikiWord = style(rowCols[c]);
					if (stringStartsWith(wikiWord.content, "http://")) {
						content += '<td class="' + wikiWord.classname
								+ '" id="version:'
								+ wikiWord.content + '"></td>';
					} else {
						content += '<td class="' + wikiWord.classname + '">'
								+ wikiWord.content + '</td>';
					}
				}
			}
		}
		$('button').html('Edit');
		$('button').attr('title', 'or press \'e\'');
	} else {
		content = "<textarea id='editScreen' >" + data + "</textarea>";
		$("button").html("Save");
		$('button').attr('title', 'or press ctrl-s');
	}
	elem.html(content);

}

function save(data, mode, http) {
	render($('wiki'), data, mode);
	http.post('/api/update', data, {
		headers : {
			'Content-Type' : 'text/plain'
		}
	});
}

app.controller('WikiCtrl', function($scope, $filter, $http, $q) {
	var scope = $scope;

	$http.get("/api/page").then(function successCallback(response) {
		scope.data = response.data;
		render($('wiki'), scope.data, scope.mode)
	}, function errorCallback(response) {
		console.log(response);
	});
	scope.mode = VIEW;

	scope.switchMode = function() {
		if ($scope.mode === VIEW) {
			$scope.mode = EDIT;
		} else {
			scope.data = $("textarea").val();
			scope.mode = VIEW;
			save(scope.data, scope.mode, $http);
			renderLookups();
		}
		render($('wiki'), scope.data, scope.mode);
	}

	scope.keypressed = function(e) {
		if (e.which == 69 && scope.mode == VIEW) {
			scope.mode = EDIT;
			render($('wiki'), scope.data, scope.mode);
			e.preventDefault();
			e.stopPropagation();
			return false;
		} else if (e.which == 83 && e.ctrlKey && scope.mode == EDIT) {
			scope.mode = VIEW;
			scope.data = $("textarea").val();
			save(scope.data, scope.mode, $http);
			renderLookups();
			e.preventDefault();
			e.stopPropagation();
			return false;
		} else {
			return true;
		}
	}
});

function renderLookups() {
	setTimeout(function() {//sorry
		$("td").each(function(index) {
			var td = $(this), id = td.attr("id");
			if (id && stringStartsWith(id, 'version:')) {
				var url = id.substring(8);
				$.ajax({
					url : 'api/version?url=' + url,
				}).done(function(data) {
					td.text(data);
				});
			}
		});
	}, 200);
}

app.directive('wiki', function($compile, $http) {
	return {
		restrict : 'E',
		link : function($scope, elem, attrs) {
			elem.ready(function() {
				renderLookups();
			})
		}
	}

});