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
 * Get all of the nouns and verbs of the features included in the given 2-dimensional array
 * @param {*} allFeaturesByRelease The array containing arrays with the textual descriptions of the features of the associated release
 * @returns A 1-dimensional array of all the unique nouns and verbs (lowercased) in all of the given features
 */
const getNounsVerbs = async (allFeaturesByRelease) => {
  // A sub-method to get the nouns and verbs of all the features of a given release
  const getNounsVerbsOfRelease = async (releaseArray) => {
    const nounsAndVerbsOfReleaseArray = await Promise.all(
      // For each feature in this release, get the nouns and verbs as an array of words
      releaseArray.map(async (feature) => {
        const theseNouns = await wordpos.getNouns(feature);
        const theseVerbs = await wordpos.getVerbs(feature);

        // Return an array containing the nouns and verbs in this feature description
        return theseNouns.concat(theseVerbs);
      })
    );

    // Return a 1-dimensional array containing all of the nouns and verbs in the features of this release
    return nounsAndVerbsOfReleaseArray.flat(Infinity);
  };

  // Get all of the nouns and verbs in the historical release features
  let allNounsAndVerbs = await Promise.all(
    allFeaturesByRelease.map(
      async (thisReleasesFeatures) =>
        await getNounsVerbsOfRelease(thisReleasesFeatures)
    )
  );

  // Make the array 1-dimensional
  allNounsAndVerbs = allNounsAndVerbs.flat(Infinity);

  // Make all words lowercased
  allNounsAndVerbs = allNounsAndVerbs.map((nounVerb) => nounVerb.toLowerCase());

  // Return the nouns and verbs array with duplicated removed
  return Array.from(new Set(allNounsAndVerbs));
};

export { getNounsVerbs, getFeaturesFromFile };
