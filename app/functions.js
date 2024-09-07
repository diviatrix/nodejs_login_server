let APP;
module.exports = class FUNCTIONS {
    constructor(_app) {  APP = _app; APP.LOGGER.log("Functions constructed", "info"); }

    async register(req, res) {

        APP.LOGGER.log("Register request: " + req.body, "debug");

        let _user = await this.user(req.body.login);

        if (_user) {
            return false;
        }

        await APP.DB.set(APP.SETTINGS.db.path.db_users + req.body.login, req.body);

        _user = await this.user(req.body.login);

		return _user;
	}


    async api(req, res) {  APP.LOGGER.log("API: requested with params: " + req.path, "debug"); return { status: 200, data: APP.SETTINGS.API }; }

    async login(req, res) 
    {
        if (!req.body.login || !req.body.password) { APP.LOGGER.log("Login failed: login or password not provided", "warning"); return false; }

        let _user = await this.user(req.body.login);
        
        if (!_user) { APP.LOGGER.log("Login failed: user not found", "warning"); return false; }

		if (_user.password != req.body.password) { APP.LOGGER.log("Login failed: password invalid", "warning"); return false; } 
        else {
			//const reply = { login: _user.login, password: _user.password, displayName: _user.displayName, photoURL: _user.photoURL, uid: _user.uid };
            const _reply = _user;
            APP.LOGGER.log("Login success: " + JSON.stringify(_reply), "debug");
            return _reply;
		}
	}

	async user(_id) {
		const userData = await APP.DB.get(APP.SETTINGS.db.path.db_users + _id);

		if (!userData) { return false; } 
        else { const reply = userData; return reply; }
	}

    async user_save(_id, _data) {
        try {
            let _user = await this.user(_id);

            if (!_user) { return false; }
            if (_user.password != _data.password) { return false; }

            await APP.DB.set(APP.SETTINGS.db.path.db_users + _id, _data);
            APP.LOGGER.log("User saved: " + JSON.stringify(_user), "debug");
            _user = await this.user(_id);
            return _user;
                     
        } catch (error) { APP.LOGGER.log("Error saving user: " + error.stack, "error"); return false; }
    }
}
