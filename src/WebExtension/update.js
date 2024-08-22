
export class Update {
  constructor(localVersionUrl, githubRepoOwner, githubRepoName, giteeRepoOwner, giteeRepoName) {
    this.localVersionUrl = localVersionUrl;
    this.localVersion;
    this.targetVersion;
    this.githubUrl = `https://github.com/${githubRepoOwner}/${githubRepoName}/releases/latest`;
    this.giteeUrl = `https://gitee.com/${giteeRepoOwner}/${giteeRepoName}/releases/latest`;

    this.gistUrl = 'https://googincheng.github.io/ComfyUX/WebExtension/version.json';
  }

  async getLocalVersion() {
    try {
      const response = await fetch(this.localVersionUrl,{ cache: "reload" });
      const data = await response.json();
      return data.version;
    } catch (error) {
      console.error(`Error fetching local version: ${error}`);
      return null;
    }
  }

  async getLatestVersionFromGitHub() {
    try {
      const response = await fetch(this.gistUrl, { cache: "reload" });

      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset') * 1000;
        const sleepTime = resetTime - Date.now() + 1000;
        console.log(`Rate limit exceeded. Retrying in ${sleepTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        return this.getLatestVersionFromGitHub();
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching latest version from GitHub: ${error}`);
      return null;
    }
  }


  async checkForUpdates() {
    try {
      const localVersion = await this.getLocalVersion();
      this.localVersion = localVersion;
      if (!localVersion) return 'Error checking for updates.';

      const latestVersionInfo = await this.getLatestVersionFromGitHub();
      this.targetVersion = latestVersionInfo;

      if (!latestVersionInfo) return 'Error checking for updates.';

      const { version: latestVersion, description } = latestVersionInfo;

      var updateInfo={
        "latestVersion":latestVersion,
        "localVersion":localVersion,
        "description":description,
        "GiteeURL":this.giteeUrl,
        "GitHubURL":this.githubUrl
      }
      return updateInfo;
    } catch (error) {
      console.error(`Error checking for updates: ${error}`);
      return false;
    }
  }
}

