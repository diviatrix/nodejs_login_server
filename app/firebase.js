const admin = require('firebase-admin');
const os = require('os');
let APP;

module.exports = class FirebaseDB {
  constructor(_app) {
    try {
      APP = _app;
      this.start();
    } catch (error) {
      if (APP.LOGGER) {
        APP.LOGGER.log(error.stack, "error");
      } else {
        console.error(error.stack);
      }
    }
  }

  async time () {
    return admin.database.ServerValue.TIMESTAMP;
  }

  async timeISO () {
    return new Date().toISOString();
  }
  

 /**
 * Atomically increments the value stored at the specified Firebase Realtime Database reference path.
 *
 * @param {string} refPath - The path to the Firebase Realtime Database reference to be incremented.
 * @returns {currentValue} return result of increment
 */
  async increment(refPath, amount) {
    try {
      const ref = this.db.ref(refPath);
      let currentValue = (await ref.once('value')).val() || 0;
      let newValue = currentValue + (amount || 1);
      await this.set(refPath, newValue);      
     APP.LOGGER.log("Value:" + refPath + " has been set to:" + newValue, "debug");
      return newValue;
    } catch (error) {
     APP.LOGGER.log(error.stack, "error");
    }
  }

  /**
 * Retrieves the user data from the Firebase Realtime Database.
 *
 * @param {Object} _msg - The message object containing the user ID.
 * @returns {Promise<Object|undefined>} - The user data, or `undefined` if an error occurs.
 */

  async exist(_path)
  {
    const ref = this.db.ref(_path);
    const snapshot = await ref.get('value');
    return snapshot.exists();
  }

  /**
 * Asynchronously pushes data to the specified Firebase Realtime Database path.
 *
 * @param {string} _path - The path in the Firebase Realtime Database to push the data to.
 * @param {Object} _data - The data to be pushed to the specified path.
 * @returns {Promise<void>} - A Promise that resolves when the data has been successfully pushed to the database.
 * @throws {Error} - If there is an error pushing the data to the database.
 */
  async push(_path, _data) {
    try {
      const res = await this.db.ref(_path).push(_data);
      APP.LOGGER.log("Document written to DB: " + _path + res.key, "debug");
      APP.CACHE.set(_path + res.key, _data);
      return res.key;
    } catch (error) {
     APP.LOGGER.log(error.stack, "error");
     return false;
    }
  }

  /**
 * Asynchronously sets the data at the specified path in the Realtime Database.
 *
 * @param {string} _path - The path in the Realtime Database where the data should be set.
 * @param {any} _data - The data to be set at the specified path.
 * @returns {Promise<{ success: boolean }>} - A Promise that resolves to an object with a `success` property indicating whether the operation was successful.
 */
  async set(_path, _data) {
    try {
      const ref = this.db.ref(_path);
      await ref.set(_data);
      await APP.CACHE.set(_path, _data);
     APP.LOGGER.log("Document written to DB: " + _path, "debug");
      return true;

    } catch (error) {
     APP.LOGGER.log(error.stack, "error");
    }
  }

  /**
 * Asynchronously retrieves data from the Firebase Realtime Database at the specified path.
 *
 * @param {string} _path - The path in the Firebase Realtime Database to retrieve data from.
 * @returns {userSnapshot} - Database record snapshot with id
 */
  async get(_path) {
    try {
      const ref = this.db.ref(_path);
      const userSnapshot = await ref.get('value');
      const result = await userSnapshot.val();
      if (result === null) {
        APP.LOGGER.log("Document doesn't exist: " + _path, "debug");
        return false;
      }

      APP.LOGGER.log("Read from db successfully:" + _path + ": " + JSON.stringify(result), "debug");
      APP.CACHE.set(_path, result);
      return result;
    }
    catch (error) {
      APP.LOGGER.log(error.stack, "error");
    }
  }

  /**
     * Executes multiple database operations in a single atomic operation.
     *
     * @param {Object} _ops - An object containing database operations to be executed in a single atomic operation.
     * @param {Array<string>} _ops.del - An array of paths to be deleted from the database.
     * @returns {Promise<void>} - A promise that resolves when all operations have been executed.
     */
  async multi(_ops) {
    if (!_ops.del) return;
    try {
      await this.db.ref().update(_ops.del.reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {}));
      _ops.del.forEach(key =>APP.CACHE.del(key));
     APP.LOGGER.log("Multi-operation completed successfully", "debug");
    } catch (error) {
     APP.LOGGER.log(error.stack, "error");
    }
  }


  
  /**
 * Deletes a database reference at the specified path.
 *
 * @param {string} _path - The path to the database reference to be deleted.
 * @returns {Promise<void>} - A Promise that resolves when the database reference has been deleted.
 * @throws {Error} - If an error occurs while deleting the database reference.
 */
  async delete(_path) {
    try {
      await this.db.ref(_path).remove();
     APP.CACHE.delete(_path);
     APP.LOGGER.log("Document deleted from DB: " + _path, "debug");
    } catch (error) {
     APP.LOGGER.log(error.stack, "error");
    }
  }

  /**
 * Starts the Firebase initialization process and logs relevant system information to the database.
 *
 * This method is responsible for the following tasks:
 * - Logs a "Firebase initialized" message to theAPP logger with the "info" level.
 * - Collects various system information, including start time, hostname, platform, release, type, uptime, and version.
 * - Pushes the collected system information to the database at the path specified by `app.APP.SETTINGS.path.db.stats.session`.
 */
  async start() {
    admin.initializeApp({
      credential: admin.credential.cert(APP.SETTINGS.db.serviceAccount),
      databaseURL: APP.SETTINGS.db.databaseURL
    });
    this.db = admin.database();


   APP.LOGGER.log("Firebase initialized", "info");
    const data = {
      start_time: this.time(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
      uptime: os.uptime(),
      version: os.version()
    };
    await this.push(APP.SETTINGS.db.path.app_stats,data);
  }
}


