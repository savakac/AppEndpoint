// GET
// Home page
//
exports.index = function (req, res, next) {
	res.render('Calendar/calendar', {
		title: 'Home'
	});
};