import * as fs from "fs";
import readXlsxFile, { readSheetNames } from "read-excel-file/node";
import WordPOS from "wordpos";
import similarity from "sentence-similarity";
import similarityScore from "similarity-score";

const wordpos = new WordPOS();

/**
 * Get an array containing arrays for the features of each release
 * @param {"Zoom" | "Webex" | "Discord"} dataSet The data set being used
 * @returns An array of arrays, where each sub-array contains the features for the sheet at that index + 1
 */
const getFeaturesFromFile = async (dataSet) => {
  const filePath = `data/${dataSet}.xlsx`;

  // Get the names of the sheets in the .xlsx file
  const sheetNames = await readSheetNames(filePath);

  // A sub-method to get the features from a specific sheet
  const getFeaturesFromSheet = async (sheetName) => {
    let thisSheetsFeatures = [];

    const rows = await readXlsxFile(filePath, { sheet: sheetName });
    rows.forEach((rowArray, index) => {
      // Don't include the first row (it's just a title)
      if (index !== 0) {
        thisSheetsFeatures.push(rowArray[0]);
      }
    });

    return thisSheetsFeatures;
  };

  // Get all of the features
  const allFeaturesByRelease = await Promise.all(
    sheetNames.map(async (sheetName) => await getFeaturesFromSheet(sheetName))
  );

  // Remove the first array since it contains the number of features for each release, not the textual descriptions of the features
  allFeaturesByRelease.shift();

  // Return the array of arrays containing the features by release
  return allFeaturesByRelease;
};

/**
 * Get all of the nouns and verbs of the features included in the given array
 * @param {string[]} allHistoricalFeatures An array containing the historical features
 * @returns An array of all the unique nouns and verbs (lowercased) in all of the given features
 */
const getNounsVerbs = async (allHistoricalFeatures) => {
  // Get a 2-dimensional array containing all of the nouns and verbs in the features
  let allNounsAndVerbs = await Promise.all(
    allHistoricalFeatures.map(async (feature) => {
      const theseNouns = await wordpos.getNouns(feature);
      const theseVerbs = await wordpos.getVerbs(feature);

      // Return an array containing the nouns and verbs in this feature description
      return theseNouns.concat(theseVerbs);
    })
  );

  // Make the array 1-dimensional and lowercased
  allNounsAndVerbs = allNounsAndVerbs
    .flat(Infinity)
    .map((nounVerb) => nounVerb.toLowerCase());

  // Add all of the unique terms with the corresponding rewards (# of occurrences) to the allTermsRewards object
  const allTermsRewards = {};
  allNounsAndVerbs.forEach((term) => {
    // If the term isn't a key of the object, add it with a value of 1, else increment its value
    allTermsRewards[term] = (allTermsRewards[term] || 0) + 1;
  });

  // Return the object with the rewards for the terms
  return allTermsRewards;
};

/**
 * Splits the given feature into an array of words
 * @param {string} feature The feature to be split up into words
 * @returns An array of the words in the feature sentence
 */
const splitFeatureIntoWords = (feature) => {
  // Split each feature sentence by spaces
  let reviewWords = feature.split(" ");

  // For each word in the feature, remove any punctuation and change the word to lowercase
  reviewWords.forEach((word, index) => {
    reviewWords[index] = word
      .toLowerCase()
      .replaceAll(".", "")
      .replaceAll(",", "")
      .replaceAll("?", "")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll("!", "")
      .replaceAll(":", "")
      .replaceAll("&", "")
      .replaceAll("-", "")
      .replaceAll("'", "")
      .replaceAll(";", "");
  });

  // Remove any empty strings that occur after removing punctuation
  reviewWords.filter((word) => word.length > 0);

  // Return the array of formatted words in the feature
  return reviewWords;
};

/**
 * Calculate the reward for selecting each available feature and return the available feature with the highest reward
 * Rewards are calculated by the average textual similarity scores when comparing to each of the original historical documents containing that term
 * @param {string[]} historicalFeatures The features that have been implemented
 * @param {string[]} availableFeatures The features that haven't yet been implemented
 * @param {string} term The selected term
 */
const chooseAvailableFeature = (
  historicalFeatures,
  availableFeatures,
  term
) => {
  // Get all of the historical features that contain the term
  const historicalWithTerm = historicalFeatures.filter((feature) =>
    feature.toLowerCase().includes(term)
  );

  // An array to represent the best available feature (format is: [reward, feature text])
  let max = [0, null];

  // Calculate the reward for each available feature
  availableFeatures.forEach((availableFeature) => {
    const availableFeatWords = splitFeatureIntoWords(availableFeature);
    let totalReward = 0;
    historicalWithTerm.forEach((historicalFeature) => {
      const historicalFeatWords = splitFeatureIntoWords(historicalFeature);

      const score = similarity(availableFeatWords, historicalFeatWords, {
        f: similarityScore.winklerMetaphone,
        options: { threshold: 0 },
      }).score;

      totalReward += score;
    });

    // Divide the totalReward by the number of historical features with the term to get the average
    totalReward /= historicalWithTerm.length;

    if (totalReward > max[0]) max = [totalReward, availableFeature];
  });

  // Return the available feature with the highest reward
  return max[1];
};

/**
 * Print the features to the appropriate results file
 * @param {boolean} isSelected Does the featuresArray contain the selected features (true) or the remaining features (false)?
 * @param {{feature: string, realRelease: number}[]} featuresArray Either the array of the selected features or the remaining features
 * @param {"Zoom" | "Webex" | "Discord"} dataSet The data set that created these results
 */
const writeResultsToFiles = (isSelected, featuresArray, dataSet) => {
  const filePath = `results/${dataSet}/${
    isSelected ? "selected" : "remaining"
  }.txt`;
  const writeStream = fs.createWriteStream(filePath);

  featuresArray.forEach((feature) => writeStream.write(`${feature.feature}\n`));

  writeStream.on("error", (error) => {
    console.error(
      `Unable to write data to ${filePath}. Error: ${error.message}`
    );
  });

  writeStream.end();
};

/**
 * Make a percentage pretty for printing to the console and .txt files
 * @param {*} num The number or (NaN) to be formatted
 * @returns The formatted number
 */
const formatNumber = (num) => {
  if (isNaN(num)) {
    return "N/A";
  } else {
    return (num * 100).toFixed(2) + "%";
  }
};

/**
 * Calculate the accuracy, precision, recall, and F-score
 * @param {{feature: string, realRelease: number}[]} selectedFeatures The array of selected features
 * @param {{feature: string, realRelease: number}[]} remainingFeatures The array of the features that weren't selected
 * @param {"Zoom" | "Webex" | "Discord"} dataSet The data set that created these results
 */
const calculateEvaluationMetrics = (
  selectedFeatures,
  remainingFeatures,
  dataSet
) => {
  // Categorize the features
  let truePosCount = 0; // labeled the 3rd release and actually the 3rd release
  let falseNegCount = 0; // not labeled the 3rd release but actually is the 3rd release
  let trueNegCount = 0; // not labeled the 3rd release and actually not labeled the 3rd release
  let falsePosCount = 0; // labeled the 3rd release but not actually the 3rd release
  selectedFeatures.forEach((feature) => {
    if (feature.realRelease === 3) truePosCount++;
    else falsePosCount++;
  });
  remainingFeatures.forEach((feature) => {
    if (feature.realRelease !== 3) trueNegCount++;
    else falseNegCount++;
  });

  // Calculate the metrics
  const accuracy =
    (truePosCount + trueNegCount) /
    (truePosCount + trueNegCount + falsePosCount + falseNegCount);
  const precision = truePosCount / (truePosCount + falsePosCount);
  const recall = truePosCount / (truePosCount + falseNegCount);
  const fScore = (2 * (precision * recall)) / (precision + recall);

  // Print the results to the console
  console.log(
    `\n------------ Evaluation Metric Values for ${dataSet} ------------`
  );
  console.log("Accuracy:", formatNumber(accuracy));
  console.log("Precision:", formatNumber(precision));
  console.log("Recall:", formatNumber(recall));
  console.log("F-Score:", formatNumber(fScore), "\n");

  return {
    accuracy: accuracy,
    precision: precision,
    recall: recall,
    fScore: fScore,
    dataSetName: dataSet,
  };
};

/**
 * Print the evaluation metrics to evaluationMetrics.txt
 * @param {{accuracy: number, precision: number, recall: number, fScore: number, dataSetName: "Zoom" | "Webex" | "Discord"}[]} allMetrics
 */
const printEvaluationMetrics = (allMetrics) => {
  const filePath = `results/evaluationMetrics.txt`;
  const writeStream = fs.createWriteStream(filePath);

  // Print the averages across the data sets
  writeStream.write(
    `------------ Average Evaluation Metric Values Across Data Sets ------------\n`
  );
  ["accuracy", "precision", "recall", "fScore"].forEach((metricName) => {
    let availableMetrics = allMetrics.length;
    writeStream.write(
      `${
        metricName === "fScore"
          ? "F-Score"
          : metricName.charAt(0).toUpperCase() + metricName.slice(1)
      }: ${formatNumber(
        allMetrics
          // Get an array containing the metric value of each data set
          .map((thisMetric) => thisMetric[metricName])
          // Get the average of those metric values
          .reduce((a, b) => {
            if (isNaN(b)) {
              availableMetrics--;
              return a;
            } else {
              return a + b;
            }
          }) / availableMetrics
      )}\n`
    );
  });

  // Print the values for each data set
  allMetrics.forEach((dataSet) => {
    writeStream.write(
      `\n------------ Evaluation Metric Values for ${dataSet.dataSetName} ------------\n`
    );
    writeStream.write(`Accuracy: ${formatNumber(dataSet.accuracy)}\n`);
    writeStream.write(`Precision: ${formatNumber(dataSet.precision)}\n`);
    writeStream.write(`Recall: ${formatNumber(dataSet.recall)}\n`);
    writeStream.write(`F-Score: ${formatNumber(dataSet.fScore)}\n`);
  });

  writeStream.on("error", (error) => {
    console.error(
      `Unable to write data to ${filePath}. Error: ${error.message}`
    );
  });

  writeStream.end();
};

export {
  getNounsVerbs,
  getFeaturesFromFile,
  chooseAvailableFeature,
  writeResultsToFiles,
  calculateEvaluationMetrics,
  printEvaluationMetrics,
};
