
/**
 * DOTENV Configuration Loader Module
 **/
class ErrorReporter {
  // server FQDN
  private ghallagher_host: string;
  // server port
  private ghallagher_port: string;
  // path to the file containing all secrets values used by ghallagher
  private secrets_file_path: string;/// The Gihub.com Organization where all the git repos live.
  private gh_org: string;

  constructor(ghallagher_host: string, ghallagher_port: string, secrets_file_path: string, gh_org: string) {
    if (ghallagher_host === undefined || ghallagher_host === "") {
      throw new Error("{[.DOTENV]} - [GHALLAGHER_HOST] is undefined, but is required")
    }
    if (ghallagher_port === undefined || ghallagher_port === "") {
      throw new Error("{[.DOTENV]} - [GHALLAGHER_PORT] is undefined, but is required")
    }
    this.ghallagher_host = ghallagher_host;
    this.ghallagher_port = ghallagher_port;
    if (gh_org === undefined || gh_org === "") {
      throw new Error("{[.DOTENV]} - [GH_ORG] is undefined, but is required")
    }
    this.gh_org = gh_org;
    if (secrets_file_path === undefined || secrets_file_path === "") {
      console.warn("{[.DOTENV]} - [SECRETS_FILE_PATH] is undefined, defaulting value to './.secrets.json'")
      process.env.SECRETS_FILE_PATH = './.secrets.json';
      secrets_file_path = process.env.SECRETS_FILE_PATH
    }
    this.secrets_file_path = secrets_file_path;
  }

  report(err: Error) {
    // could use [this.release_manifest_path], [this.product], etc... here to send error somewhere
    console.error(err.message);
    /// console.error(err.stack);
  }
}

/// export default new ErrorReporter(process.env.GHALLAGHER_HOST, process.env.GHALLAGHER_PORT);
export default new ErrorReporter(process.env.GHALLAGHER_HOST!, process.env.GHALLAGHER_PORT!, process.env.SECRETS_FILE_PATH!, process.env.GH_ORG!);
