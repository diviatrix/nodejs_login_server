
let APP;
module.exports =class CACHE {
    constructor(_app) {
        APP = _app;
        this.cache = {};
    }

    async get(path) {
        APP.LOGGER.log(`Getting ${path} from cache`, "debug");
        
        // check if cache exist
        let _data = this.cache[path];
        
        if (_data === undefined) {
          APP.LOGGER.log(`Cache miss for ${path}`, "debug");
          
          // if not, lookup in DB
          _data = await APP.DB.get(path);
          
          if (_data) {
            APP.LOGGER.log(`Setting ${path} in cache`, "debug");
            this.cache[path] = _data;
            return _data;
          } else if (_data = false) {
            APP.LOGGER.log(`DB miss for ${path}`, "debug");
            return false;
          }
        } else {
          APP.LOGGER.log(`Cache hit for ${path}`, "debug");
          return _data;
        }
      }

    async delete(_path) {
        if (this.cache[_path]) delete this.cache[_path];
        APP.LOGGER.log(`Removed ${_path} from cache`, "debug");
        return true;
    }

    async set(_path, _data) {
        this.cache[_path] = _data;
        APP.LOGGER.log(`Put ${_path} in cache`, "debug");
        return true;
    }
}