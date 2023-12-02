# RL in SRP
An application of reinforcement learning (RL) to the strategic release planning (SRP) problem.

Logic:
1. Given the historical features, create a collection of all of the nouns and verbs in those features.
    - Use the <a href="https://www.npmjs.com/package/wordpos-web">wordpos-web npm package</a>
2. Calculate the reward for selecting each term in the historical vocabulary based on how often it appears in the historical documents.
3. Given a desired number of features (n) for the next iteration, repeat the following steps n times:
    1. Using the calculated rewards, select a term from the historical vocabulary.
    2. Calculate the reward for selecting each future feature based on its average textual similarity score when comparing it to the original historical features containing that selected term.
        - Use the <a href="https://www.npmjs.com/package/sentence-similarity">sentence-similarity npm package</a>
    3. Using the calculated rewards, select a feature from the list of available future features.
    4. Add this feature to the list of features to be implemented in the next iteration.
    5. Remove the selected feature from the list of available future features and decrease the reward of the selected term by 25%.
4. Print the selected and unselected features to separate files.
5. Evaluate the effectiveness of the method (accuracy, precision, recall) using previously planned releases.
