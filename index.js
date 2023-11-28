import { getNounsVerbs } from "./helperMethods.js";

const mainLogic = (dataSet) => {
  // 1. Read in the historical requirements and create a collection of all the nouns and verbs (use wordpos-web)
    const allNounsAndVerbs = getNounsVerbs();
    console.log(allNounsAndVerbs);
  // Ask the user for the desired number of requirements for the next iteration
  // If the desired number of requirements is less than or equal to the number of available requirements, alert the user and quit the program
  // 2. For the number of requirements the user wants, ... (for loop)
  // 2a. Calculate the reward for selecting each term in the historical vocabulary (how often it appears in the historical documents)
  // 2b. Select a term from the historical vocabulary based on the calculated rewards
  // 2c. Calculate the reward for selecting each requirement based on the average textual similarity score when comparing to each of the original historical documents containing that term (use sentence-similarity)
  // 2d. Select a requirement based on the calculated reward
  // 2e. Add the selected requirement to the list of requirements to be implemented in the next iteration
  // Remove the selected requirement from the list of available requirements, and decrease the reward of the selected term by 25%
  // 3. Print the selected and unselected requirements to separate files
  // 4. Evaluate the effectiveness of this method (accuracy, precision, recall)
};

mainLogic("Zoom");
mainLogic("Webex");
mainLogic("Discord");
