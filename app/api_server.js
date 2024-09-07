const EXPRESS = require('express');
let APP;

module.exports = class APISERVER {
	constructor(_app) {
		APP = _app;
		this.express = EXPRESS();
		this.express.use(EXPRESS.json());
		this.routes = []
		this.start();
	}
	

	async init() {
		try {
			
		} catch (error) {
			APP.LOGGER.log(error.stack, "error"); 
		}
	}

	async start() {
		try {
			this.express.get('/', (req, res) => {
				this.express.use(EXPRESS.static(APP.SETTINGS.path.public));
				APP.LOGGER.log("[API][/][GET] Public folder requested", "info");
				res.sendFile(APP.SETTINGS.path.public + 'index.html');
			});
			this.express.get('/api', (req, res) => {
				APP.LOGGER.log("[API][/][GET] API requested", "info");
				res.status(200).json({ message: 'API v 1.0', result : true, data: APP.SETTINGS.api });
			});
			this.express.post('/api/login', (req, res) => {
				APP.LOGGER.log("[API][/][POST] Login requested", "info");
				this.api_login_request(req, res);
			});
			this.express.post('/api/register', (req, res) => {
				APP.LOGGER.log("[API][/][POST] Register requested", "info");
				this.api_register_request(req, res);
			});
			this.express.get('/api/user/:uuid', async (req, res) => {
				APP.LOGGER.log("[API][/][GET] User " + req.params.uuid + " requested", "info");
				const uuid = req.params.uuid;
				let _data = await APP.FUNCTIONS.user(uuid);
				let _status = _data != false ? true : false; // = false;
				return res.status(200).json({ status: _status, data: _data });
			});
			this.express.post('/api/save', async (req, res) => {
				APP.LOGGER.log("[API][/][POST] User save requested", "info");				
				APP.LOGGER.log("req.body: " + JSON.stringify(req.body), "debug");
				let _result = await APP.FUNCTIONS.user_save(req.body.login, req.body);
				let _status = _result != false ? true : false;
				let _message = _status ? '[API][POST][/api/save]: User saved' : '[API][POST][/api/save]: User not saved';
				return res.status(200).json({ status: _status, message: _message, data: _result });
			});
			this.express.listen(APP.SETTINGS.port, () => {

				APP.LOGGER.log("[API][/][LISTEN][:" + APP.HELPER.str_style(APP.SETTINGS.port +"]", "yellow"), "info");
			});
		} catch (e) {
			APP.LOGGER.log("Error starting API server: " + e, "error");
		}
	}

	async api_login_request(req, res) {
		APP.LOGGER.log("[API][Login][Response]: Login requested with params: " + JSON.stringify(req.body), "debug");
		let _data = await APP.FUNCTIONS.login(req, res);
		if (!_data) {
			APP.LOGGER.log('[API][Login][Response]: login or password invalid', "warning");
			return res.status(200).json({ message: "[API][Login][Response]: login or password invalid", result : false, data: false, });
		}
		else {
			APP.LOGGER.log('[API][Login][Response]: ' + JSON.stringify(_data), "debug");
			return res.status(200).json({ message: "[API][Login][Response]: success" , result : true, data: _data, });
		}
	}

	async api_register_request(req, res) {
		if (!req.body || typeof req.body.login !== 'string' || typeof req.body.password !== 'string') {			
			APP.LOGGER.log('[API][Register][Response]: login or password not provided', "warning");
			return res.status(200).json({ message: "[API][Register][Response]: login or password not provided", result : false, data: false, });
		}
		else if (req.body.password.length != 32) {
			APP.LOGGER.log('[API][Register][Response]: password format invalid', "warning");
			return res.status(200).json({message: "[API][Register][Response]: password format invalid", result : false, data: false, });
		}
		else {
			APP.LOGGER.log('[API][Register][Response]: ' + req.body.login + ' ' + req.body.password + ' ' + req.body.displayName + ' ' + req.body.photoURL, "debug");
			let _login = req.body.login;

			let _user = await APP.FUNCTIONS.user(_login);
			if (_user) {
				APP.LOGGER.log('[API][Register][Response]: user already exists', "warning");
				return res.status(200).json({ message: "[API][Register][Response]: user already exists", result : false, data: false, });
			}

			let _password = req.body.password;
			let _displayName = req.body.displayName || 'Baka';
			let _photoURL = req.body.photoURL || 'https://1337.plus/share/logo_2.png';

			let _result = await APP.FUNCTIONS.register(req, res);
			if (_result != false) {
				APP.LOGGER.log('[API][Register][Response]: success - ' + JSON.stringify(_result) + '', "info");
				return res.status(200).json({ message: "[API][Register][Response]: success", result : true, data : _result });
			}
		}		
	}
}

























