module.exports = function handler(req,res){ res.setHeader('Cache-Control','public, max-age=31536000, immutable'); return res.redirect(302,'/assets/presentes/cafeteira-final.webp'); };
