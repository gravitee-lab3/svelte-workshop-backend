
/**
 * DOTENV Configuration Loader Module
 **/
class ErrorReporter {
  // server FQDN
  private GHALLAGHER_HOST: string;
  // server port
  private GHALLAGHER_PORT: string;

  constructor(GHALLAGHER_HOST: string, GHALLAGHER_PORT: string) {
    if (GHALLAGHER_HOST === undefined || GHALLAGHER_HOST === "") {
      throw new Error("{[.DOTENV]} - [GHALLAGHER_HOST] is undefined, but is required")
    }
    if (GHALLAGHER_PORT === undefined || GHALLAGHER_PORT === "") {
      throw new Error("{[.DOTENV]} - [GHALLAGHER_PORT] is undefined, but is required")
    }
    this.GHALLAGHER_HOST = GHALLAGHER_HOST;
    this.GHALLAGHER_PORT = GHALLAGHER_PORT;

  }

  report(err: Error) {
    // could use [this.release_manifest_path], [this.product], etc... here to send error somewhere
    console.error(err.message);
    /// console.error(err.stack);
  }
}

/// export default new ErrorReporter(process.env.GHALLAGHER_HOST, process.env.GHALLAGHER_PORT);
export default new ErrorReporter(process.env.GHALLAGHER_HOST!, process.env.GHALLAGHER_PORT!);
