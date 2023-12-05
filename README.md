# RL in SRP
An application of reinforcement learning (RL) to the strategic release planning (SRP) problem.

<h2>Process</h2>

1. Given the historical features, create a collection of all of the nouns and verbs in those features.
    - Uses the <a href="https://www.npmjs.com/package/read-excel-file">read-excel-file npm package</a> and <a href="https://www.npmjs.com/package/wordpos-web">wordpos-web npm package</a>
2. Calculate the reward for selecting each term in the historical vocabulary based on how often it appears in the historical documents.
3. Given a desired number of features (n) for the next iteration, repeat the following steps n times:
    1. Using the calculated rewards, select a term from the historical vocabulary.
    2. Calculate the reward for selecting each future feature based on its average textual similarity score when comparing it to the original historical features containing that selected term.
        - Uses the <a href="https://www.npmjs.com/package/sentence-similarity">sentence-similarity npm package</a> and <a href="https://www.npmjs.com/package/similarity-score">similarity-score npm package</a>
    3. Using the calculated rewards, select a feature from the list of available future features.
    4. Add this feature to the list of features to be implemented in the next iteration.
    5. Remove the selected feature from the list of available future features and decrease the reward of the selected term by 50%.
4. Print the selected and remaining features to separate files.
5. Evaluate the effectiveness of the method (accuracy, precision, recall, F-score) using previously planned releases.

<h2>Run this Project</h2>

To run this code, complete the following steps:

1. Clone this repository.
2. Run `npm install` within the project directory to install the required npm packages.
3. Run `npm run dev` to run the code. Note that the output will show up in the terminal and will be added to the files within the `results` folder.
