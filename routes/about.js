
/*
 * GET home page.
 */

exports.about = function(req, res){
   res.render('about', { title: 'About Stylify' });
};