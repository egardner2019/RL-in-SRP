/**
 *
 * @param {string} dataSet The name of the data set being used
 */
const getNounsVerbs = (dataSet) => {
  // REMEMBER THAT THE DATASETS ARE REVERSED. LATEST IS AT THE TOP!
  // Get the number of available releases (numReleases)
  // Get the data from all but the last 3 releases (first 3 since it's reversed)
  // Create an array to hold all nouns and verbs (nounVerbArray)
  // For each feature in each release, use wordpos-web to get all of the nouns and verbs. Add them to nounVerbArray.
  // Return nounVerbArray with the duplicate values removed
};

export { getNounsVerbs };
