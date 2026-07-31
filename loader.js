const { Transform } = require("node:stream");

class Loader extends Transform {
  constructor(size, label = "Processing") {
    super();
    this.size = size;
    this.label = label;
    this.totalBytesRead = 0;
    this.lastLoggedPercentage = -1;
  }

  _transform(data, encoding, callback) {
    this.totalBytesRead += data.length;

    const currentPercentLog =
      this.size > 0 ? Math.floor((this.totalBytesRead / this.size) * 100) : 100;

    if (currentPercentLog > this.lastLoggedPercentage) {
      process.stdout.write(
        `\x1b[1A\x1b[2K${this.label}... ${currentPercentLog}%\n`,
      );
      this.lastLoggedPercentage = currentPercentLog;
    }

    if (currentPercentLog === 100 && this.lastLoggedPercentage !== 101) {
      console.log(`${this.label} Completed`);
      this.lastLoggedPercentage = 101;
    }

    this.push(data);
    callback();
  }
}

module.exports = Loader;
