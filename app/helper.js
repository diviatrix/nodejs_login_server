let APP;
const uuid = require('uuid').v4;

class Helper {
  constructor(_app) {
	APP = _app;
	APP.LOGGER.log('Helper constructed', "info");
  }

  str_style(_string, _style) {
	//APP.LOGGER.log(`Styling string [${_string}] to [${_style}]`, "debug");
	let result = _string;
	let style = APP.SETTINGS.consoleStrings.find( s => s.id === _style );
	if (style) {
		result = `${style.open}${_string}${style.close}`;
	} else {
		APP.LOGGER.log(`Invalid style, returning input: [${_style}]${result}`, "warning");
		return result;
	}
	return result;
  }

  reward_record_style(_record) {
	return this.str_style(`[${_record.id}][${_record.rarity}][${_record.name}]`,APP.SETTINGS.rarity[APP.FUNCTIONS.collectible(_record.uuid)?.rarity].text || "normal");
  }

  is_today(_date) {
	const today = new Date();
	try {
		return (_date.getDate() == today.getDate() && _date.getMonth() == today.getMonth() && _date.getFullYear() == today.getFullYear())
	}
	catch (error) {
		APP.LOGGER.log(`Error: ${error}`, "error");
		return false;
	}	
  }

  uuid(){
	return uuid();
  }

  userpath(_msg) {
	APP.LOGGER.log(`Generated userpath:${APP.SETTINGS.path.db.users + "/" + _msg.from.id}`, "debug");
	return APP.SETTINGS.path.db.users + "/" + _msg.from.id;
  }
}
module.exports = Helper;