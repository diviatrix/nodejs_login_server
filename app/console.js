const readline = require('readline');
let APP;
class CONSOLE {
	constructor(_app) {
		APP = _app;
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
		rl.on('line', async (answer) => {
			await this.parseCommand(answer);
		});

		APP.LOGGER.log("Console started", "info");
	}

	async parseCommand(userAnswer) {
		// exit command
		if (userAnswer == 'exit') { process.exit(0); }
		else if (userAnswer == 'start') { await APP.start(); APP.LOGGER.log("Application started", "info"); }
		else if (userAnswer == 'stop') { await APP.stop(); APP.LOGGER.log("Application stopped", "info"); }
		else if (userAnswer == 'help') { APP.LOGGER.log("Available commands: exit, help, reload, status, start, stop", "info"); }
		else if (userAnswer.startsWith('reload')) { await this.reload(); }
		else if (userAnswer.startsWith('status')) { APP.LOGGER.log("Status: " + (APP.run ? "running" : "stopped"), "info"); }
		else APP.LOGGER.log("Unknown command, type 'help' for available commands", "warning");
	}

	async reload() {
		await APP.context.cleanUp().then(async () => {
			// reinitialize
			await APP.context.initialize();
			APP.LOGGER.log("Reload completed", "info");
		});
	}
}

module.exports = CONSOLE;
