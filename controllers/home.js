// GET
// Home page
//
exports.calendar = function (req, res, next) {
	res.render('Calendar/calendar', {
		title: 'Home'
	});
};

exports.index = function (req, res, next) {
	res.render('index', {
		title: 'index'
	});
};