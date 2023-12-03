import {
  getFeaturesFromFile,
  getNounsVerbs,
  chooseAvailableFeature,
  writeResultsToFiles,
  calculateEvaluationMetrics,
  printEvaluationMetrics,
} from "./helperMethods.js";

// The data sets on which to run this program
const dataSets = ["Discord", "Webex", "Zoom"];

// The number of features desired for the next release
const numFeatures = 20;

// The evaluation metrics of each data set
let allMetrics = [];

const mainMethod = async (dataSet) => {
  // Get the features from the .xlsx file (array of arrays, with each subarray designated to a release)
  const allFeaturesByRelease = await getFeaturesFromFile(dataSet);

  const historicalFeatures = allFeaturesByRelease.slice(4).flat(Infinity);

  // Create an object containing all of the unique lowercased terms in the historical releases and their associated rewards
  // Used slice to exclude the summary sheet and the 3 latest releases, which will be used for evaluation
  const allTerms = await getNounsVerbs(historicalFeatures);

  // Get all of the available features (from the 3 most recent releases) with their real assigned releases
  let availableFeatures = [];
  allFeaturesByRelease.slice(1, 4).forEach((release, index) => {
    release.forEach((feature) => {
      availableFeatures.push({
        feature: feature,
        realRelease: index + 1,
      });
    });
  });

  // An array to hold the 20 features selected for the next release
  let selectedFeatures = [];

  console.log(
    `\nSelecting ${numFeatures} features for the next ${dataSet} release...`
  );

  // Until the correct number of features (numFeatures) have been selected, ...
  for (let currentIndex = 1; currentIndex <= numFeatures; currentIndex++) {
    // while (selectedFeatures.length !== numFeatures) {
    // Select the term from the historical vocabulary with the highest reward
    const selectedTerm = Object.keys(allTerms).reduce((prev, current) => {
      return allTerms[prev] > allTerms[current] ? prev : current;
    });

    // Calculate rewards for choosing available features, and get the one that has the highest reward
    const chosenFeature = chooseAvailableFeature(
      historicalFeatures,
      availableFeatures.map((obj) => obj.feature),
      selectedTerm
    );

    console.log(`${currentIndex}. ${chosenFeature}`);

    // Add the selected feature to the list of features to be implemented in the next iteration
    selectedFeatures.push(
      availableFeatures.find((obj) => obj.feature === chosenFeature) // Do this so that the realRelease value is included
    );

    // Remove the selected feature from the list of available features
    availableFeatures = availableFeatures.filter(
      (feat) => feat.feature !== chosenFeature
    );

    // Decrease the reward of the selected term by half
    allTerms[selectedTerm] *= 0.5;
  }
  // Print the selected (selectedFeatures array) and remaining (availableFeatures array) features to separate files
  writeResultsToFiles(true, selectedFeatures, dataSet);
  writeResultsToFiles(false, availableFeatures, dataSet);

  // Evaluate the effectiveness of this method (accuracy, precision, recall) -- correct means the feature is from the third release!
  allMetrics.push(
    calculateEvaluationMetrics(selectedFeatures, availableFeatures, dataSet)
  );

  // Print the metrics for all data sets to a file if we have evaluated all of the data sets
  if (allMetrics.length === dataSets.length) {
    printEvaluationMetrics(allMetrics);
  }
};

// Run the main method on the Discord, Webex, and Zoom data sets
dataSets.forEach((dataSet) => mainMethod(dataSet));
