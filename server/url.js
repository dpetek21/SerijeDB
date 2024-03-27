//const portovi = require("/var/www/RWA/2023/portovi.js");
class Url {
	constructor() {
		this.konf = {};
		//this.konf["url"]="http://spider.foi.hr";
		//this.konf["port"]=portovi.dpetek21;
		this.konf["url"]="http://localhost";
        this.konf["port"]="12000";
	}
    postaviUrl(url, port) {
		this.konf = {};
        this.konf["url"]=url;
        this.konf["port"]=port;
	}
	dajUrl() {
		return this.konf["url"]+":"+this.konf["port"];
	}
	dajPort() {
		console.log(this.konf["port"]);
		return this.konf["port"];
	}
}


module.exports = Url;