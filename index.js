import { getFeaturesFromFile, getNounsVerbs } from "./helperMethods.js";

// The number of requirements desired for the next iteration
const numReqs = 20;

const mainLogic = async (dataSet) => {
  // Get the reviews from the .xlsx file (array of arrays, with each subarray designated to a release)
  const allFeaturesByRelease = await getFeaturesFromFile(dataSet);

  // 1. Create an array containing all of the unique nouns and verbs (lowercased) in the historical releases
  // Used slice to exclude the summary sheet and the 3 latest releases, which will be used for evaluation
  const allNounsAndVerbs = await getNounsVerbs(allFeaturesByRelease.slice(4));

  // 2. For the number of requirements desired (numReqs), ...
  for (let i = 1; i <= numReqs; i++) {
    // 2a. Calculate the reward for selecting each term in the historical vocabulary (how often it appears in the historical documents)
    // 2b. Select a term from the historical vocabulary based on the calculated rewards
    // 2c. Calculate the reward for selecting each requirement based on the average textual similarity score when comparing to each of the original historical documents containing that term (use sentence-similarity)
    // 2d. Select a requirement based on the calculated reward
    // 2e. Add the selected requirement to the list of requirements to be implemented in the next iteration
    // Remove the selected requirement from the list of available requirements, and decrease the reward of the selected term by 25%
  }
  // 3. Print the selected and unselected requirements to separate files
  // 4. Evaluate the effectiveness of this method (accuracy, precision, recall)
};

mainLogic("Zoom");
// mainLogic("Webex");
// mainLogic("Discord");
