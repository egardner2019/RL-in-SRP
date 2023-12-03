import readXlsxFile, { readSheetNames } from "read-excel-file/node";
import WordPOS from "wordpos";

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

const getFeaturesRewards = (historicalFeatures, availableFeatures, term) => {};

export { getNounsVerbs, getFeaturesFromFile, getFeaturesRewards };
