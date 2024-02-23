const MESSAGES = {
  telegramHelp: (challenge) => {
    return (
      `<p>After fixing the issues please resubmit the challenge. ` +
      `If you are still having issues, join the challenge <a href="${challenge.telegram}" target="_blank">Telegram channel</a>.</p>`
    );
  },
  failedTest: (challenge) => {
    return (
      `<p>This submission did not pass all tests. Review the output below to see which tests failed and why. ` +
      `Viewing the file that is used for testing (packages/hardhat/test/Challenge${challenge.id}.ts) ` +
      `may help you find the exact section in which the tests failed.</p>` +
      `${MESSAGES.telegramHelp(challenge)}<p>--</p>`
    );
  },
  successTest: (challenge) => {
    return (
      challenge.successMessage ??
      `<p>You passed all tests on Challenge ${challenge.id}, keep it up!</p><p>--</p>`
    );
  },
};

module.exports = { MESSAGES };
