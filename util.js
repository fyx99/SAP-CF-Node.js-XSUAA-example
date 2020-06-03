// Base64 decoding
function atob(str){
	return new Buffer(str, 'base64').toString();
}

// Parsing JWT -> google stackoverflow
const parseJwtToken = (sToken) => {
    const s = sToken.split('.')[1];
    const d = s.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(d));
}


module.exports = {
    parseJwtToken
}