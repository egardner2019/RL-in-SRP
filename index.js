import {
  getFeaturesFromFile,
  getNounsVerbs,
  // getFeaturesRewards,
} from "./helperMethods.js";

// The number of features desired for the next iteration
const numFeatures = 20;

const mainLogic = async (dataSet) => {
  // Get the features from the .xlsx file (array of arrays, with each subarray designated to a release)
  const allFeaturesByRelease = await getFeaturesFromFile(dataSet);

  const historicalFeatures = allFeaturesByRelease.slice(4).flat(Infinity);

  // Create an object containing all of the unique lowercased terms in the historical releases and their associated rewards
  // Used slice to exclude the summary sheet and the 3 latest releases, which will be used for evaluation
  const allTerms = await getNounsVerbs(historicalFeatures);

  // Get all of the available features (from the 3 most recent releases) with their real assigned releases
  let availableFeatures = [];
  allFeaturesByRelease.slice(1, 4).forEach((release) => {
    release.forEach((feature) => {
      availableFeatures.push({
        feature: feature,
        realRelease: release,
      });
    });
  });

  // An array to hold the 20 features selected for the next release
  let selectedFeatures = [];

  // Until the correct number of features (numFeatures) have been selected, ...
  // while (selectedFeatures.length !== numFeatures) {
  // Select the term from the historical vocabulary with the highest reward
  const selectedTerm = Object.keys(allTerms).reduce((prev, current) => {
    return allTerms[prev] > allTerms[current] ? prev : current;
  });

  // Calculate the reward for selecting each feature based on the average textual similarity score when comparing to each of the original historical documents containing that term (use sentence-similarity)
  // const featuresRewards = getFeaturesRewards(
  //   historicalFeatures,
  //   availableFeatures,
  //   selectedTerm
  // );

  // Select a feature based on the calculated reward
  // const chosenFeature = "";

  // Add the selected feature to the list of features to be implemented in the next iteration
  // selectedFeatures.push(chosenFeature);

  // Remove the selected feature from the list of available features, and decrease the reward of the selected term by 25% (multiply by .75)
  // }; // End while statement
  // Print the selected (selectedFeatures array) and unselected (availableFeatures array) features to separate files
  // Evaluate the effectiveness of this method (accuracy, precision, recall) -- correct means the feature is from the third release!
};

mainLogic("Zoom");
// mainLogic("Webex");
// mainLogic("Discord");
